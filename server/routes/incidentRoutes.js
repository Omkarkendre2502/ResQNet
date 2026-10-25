import express from 'express';
import mongoose from 'mongoose';
import Incident from '../models/Incident.js';
import RescueTeam from '../models/RescueTeam.js';
import Counter from '../models/Counter.js';
import { logAudit } from '../models/AuditLog.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  createIncidentValidator,
  assignIncidentValidator,
  statusIncidentValidator
} from '../middleware/validation.js';
import { reportIncidentLimiter } from '../middleware/rateLimiter.js';
import { handlePhotoUpload } from '../middleware/upload.js';
import { findTeamByAnyId } from './teamRoutes.js';

const router = express.Router();

/**
 * Sequential atomic ID generator using Counter model (INC-0001 format).
 * Seeds above existing numeric IDs to prevent collision.
 */
export const getNextIncidentId = async () => {
  const existing = await Counter.findById('incidentId');
  if (!existing) {
    const incidents = await Incident.find({ id: /^INC-\d+$/ }, { id: 1 }).lean();
    let maxNum = 2002;
    for (const inc of incidents) {
      const match = inc.id.match(/^INC-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    try {
      await Counter.create({ _id: 'incidentId', seq: maxNum });
    } catch (e) {
      // Counter was seeded concurrently
    }
  }

  while (true) {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'incidentId' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    const candidateId = `INC-${String(counter.seq).padStart(4, '0')}`;
    const alreadyExists = await Incident.findOne({ id: candidateId });
    if (!alreadyExists) {
      return candidateId;
    }
  }
};

export const ALLOWED_STATUSES = [
  'Reported',
  'Assigned',
  'On the Way',
  'Reached',
  'In Progress',
  'Completed'
];
export const ALLOWED_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
export const ALLOWED_TYPES = ['Fire', 'Flood', 'Accident', 'Building Collapse', 'Other'];

export const STATUS_FLOW = [
  'Reported',
  'Assigned',
  'On the Way',
  'Reached',
  'In Progress',
  'Completed'
];

export const isValidIncidentIdFormat = (id) => {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id);
};

export const findIncidentByAnyId = async (id) => {
  if (!isValidIncidentIdFormat(id)) {
    return null;
  }
  const trimmedId = id.trim();
  if (mongoose.Types.ObjectId.isValid(trimmedId) && /^[0-9a-fA-F]{24}$/.test(trimmedId)) {
    const byMongo = await Incident.findById(trimmedId);
    if (byMongo) return byMongo;
  }
  return await Incident.findOne({ id: trimmedId });
};

/**
 * Sanitizes incident data to prevent leaking sensitive reporter information (email, phone, photo)
 * to unauthenticated or unauthorized users.
 * Accessible only to admins, assigned rescue team, and the citizen who reported it.
 */
export const sanitizeIncidentForUser = (incident, user) => {
  const incObj = incident.toObject ? incident.toObject() : { ...incident };

  const isAdmin = user && user.role === 'admin';
  const isAssignedRescue =
    user &&
    user.role === 'rescue' &&
    user.teamId &&
    incObj.assignedTeamId &&
    String(incObj.assignedTeamId).toLowerCase() === String(user.teamId).toLowerCase();
  const isReporter =
    user &&
    ((incObj.reportedById && (String(incObj.reportedById) === String(user._id) || String(incObj.reportedById) === String(user.id))) ||
      (incObj.reporterEmail && user.email && incObj.reporterEmail.toLowerCase() === user.email.toLowerCase()));

  const canViewPrivateFields = Boolean(isAdmin || isAssignedRescue || isReporter);

  if (!canViewPrivateFields) {
    delete incObj.reporterEmail;
    delete incObj.reporterPhone;
    delete incObj.photoUrl;
    incObj.reportedBy = 'Citizen';
    if (Array.isArray(incObj.timeline)) {
      incObj.timeline = incObj.timeline.map((event) => {
        const ev = { ...event };
        if (ev.note && typeof ev.note === 'string') {
          ev.note = ev.note.replace(/Emergency reported by [^.]+/, 'Emergency reported by Citizen');
        }
        return ev;
      });
    }
  }

  return incObj;
};

// GET /api/incidents - Fetch incidents with exact safe filters (Protected & Role Isolated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, severity, type, assignedTeamId } = req.query;
    const filter = {};

    // Role-based data isolation:
    // Citizen sees only incidents they reported
    if (req.user.role === 'citizen') {
      const userIdentifier = req.user.id || req.user._id;
      const conditions = [{ reportedById: userIdentifier }, { reportedById: String(userIdentifier) }];
      if (req.user.email) {
        conditions.push({ reporterEmail: req.user.email.toLowerCase() });
      }
      filter.$or = conditions;
    } else if (req.user.role === 'rescue') {
      // Rescue squad sees only incidents assigned to their squad
      if (!req.user.teamId) {
        filter.assignedTeamId = '__NO_SQUAD__';
      } else {
        filter.assignedTeamId = req.user.teamId;
      }
    }
    // Admin sees all incidents across Pune

    if (status !== undefined) {
      const s = String(status).trim();
      const sLower = s.toLowerCase();

      if (sLower === 'active') {
        filter.status = { $nin: ['Completed', 'Resolved'] };
      } else if (sLower === 'completed') {
        filter.status = { $in: ['Completed', 'Resolved'] };
      } else {
        const matched = ALLOWED_STATUSES.find((item) => item.toLowerCase() === sLower);
        if (!matched) {
          return res.status(400).json({
            error: `Invalid status filter. Allowed values: ${ALLOWED_STATUSES.join(', ')}, active, completed.`
          });
        }
        filter.status = matched;
      }
    }

    if (severity !== undefined) {
      const sev = String(severity).trim();
      const matched = ALLOWED_SEVERITIES.find((item) => item.toLowerCase() === sev.toLowerCase());
      if (!matched) {
        return res.status(400).json({
          error: `Invalid severity filter. Allowed values: ${ALLOWED_SEVERITIES.join(', ')}.`
        });
      }
      filter.severity = matched;
    }

    if (type !== undefined) {
      const t = String(type).trim();
      const matched = ALLOWED_TYPES.find((item) => item.toLowerCase() === t.toLowerCase());
      if (!matched) {
        return res.status(400).json({
          error: `Invalid type filter. Allowed values: ${ALLOWED_TYPES.join(', ')}.`
        });
      }
      filter.type = matched;
    }

    if (assignedTeamId !== undefined) {
      const teamId = String(assignedTeamId).trim();
      if (!/^[A-Za-z0-9-]{1,20}$/.test(teamId)) {
        return res.status(400).json({
          error: 'Invalid assignedTeamId query filter format.'
        });
      }
      // If user is rescue, they cannot override their squad filter
      if (req.user.role !== 'rescue') {
        filter.assignedTeamId = teamId;
      }
    }

    const incidents = await Incident.find(filter).sort({ reportedAt: -1 });
    const sanitizedIncidents = incidents.map((inc) => sanitizeIncidentForUser(inc, req.user));
    res.json(sanitizedIncidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/incidents/:id - Get single incident (Protected)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidIncidentIdFormat(id)) {
      return res.status(400).json({ error: 'Invalid incident ID format.' });
    }

    const incident = await findIncidentByAnyId(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    // Role-based authorization for single incident view
    if (req.user.role === 'citizen') {
      const isReporter =
        (incident.reportedById && (String(incident.reportedById) === String(req.user.id) || String(incident.reportedById) === String(req.user._id))) ||
        (incident.reporterEmail && incident.reporterEmail.toLowerCase() === req.user.email?.toLowerCase());
      if (!isReporter) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view this incident.' });
      }
    } else if (req.user.role === 'rescue') {
      if (!req.user.teamId || incident.assignedTeamId !== req.user.teamId) {
        return res.status(403).json({ error: 'Forbidden: Rescue personnel can only view incidents assigned to their squad.' });
      }
    }

    res.json(sanitizeIncidentForUser(incident, req.user));
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/incidents - Citizen reports a new emergency (requires login & supports multipart photo upload)
router.post(
  '/',
  authenticateToken,
  reportIncidentLimiter,
  handlePhotoUpload,
  createIncidentValidator,
  async (req, res) => {
    try {
      const {
        type,
        location,
        coordinates,
        peopleAffected,
        severity,
        description,
        photoUrl,
        reporterPhone
      } = req.body;

      const newId = await getNextIncidentId();
      const now = new Date();

      const defaultPuneCoords = [
        18.5204 + (Math.random() - 0.5) * 0.04,
        73.8567 + (Math.random() - 0.5) * 0.04
      ];

      let parsedCoords = defaultPuneCoords;
      if (coordinates) {
        if (typeof coordinates === 'string') {
          try {
            parsedCoords = JSON.parse(coordinates);
          } catch (e) {
            parsedCoords = defaultPuneCoords;
          }
        } else if (Array.isArray(coordinates) && coordinates.length === 2) {
          parsedCoords = [Number(coordinates[0]), Number(coordinates[1])];
        }
      }

      const reporterName = req.user.name || 'Citizen';
      const reporterEmail = req.user.email || '';
      const phone = req.user.phone || reporterPhone || '';

      // Determine photo URL: prioritize uploaded file, never store base64 in MongoDB
      let resolvedPhotoUrl = null;
      if (req.file) {
        resolvedPhotoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      } else if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('data:')) {
        resolvedPhotoUrl = photoUrl.trim();
      }

      const incidentData = {
        id: newId,
        type,
        title: `${type} Emergency at ${location.split(',')[0]}`,
        location: location.trim(),
        coordinates: parsedCoords,
        peopleAffected: parseInt(peopleAffected, 10) || 1,
        severity,
        description: description.trim(),
        reportedById: req.user._id || req.user.id || null,
        reportedBy: reporterName,
        reporterEmail: reporterEmail,
        reporterPhone: phone,
        status: 'Reported',
        assignedTeamId: null,
        assignedTeamName: null,
        photoUrl: resolvedPhotoUrl,
        reportedAt: now,
        updatedAt: now,
        timeline: [
          {
            status: 'Reported',
            time: now,
            note: `Emergency reported by ${reporterName}. Severity: ${severity}.`
          }
        ]
      };

      const incident = new Incident(incidentData);
      await incident.save();

      res.status(201).json({
        message: 'Emergency reported successfully',
        incident: sanitizeIncidentForUser(incident, req.user)
      });
    } catch (error) {
      console.error('Error reporting emergency:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// PATCH /api/incidents/:id/assign - Admin assigns a rescue squad
router.patch(
  '/:id/assign',
  authenticateToken,
  authorizeRoles('admin'),
  assignIncidentValidator,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { teamId, note } = req.body;

      if (!isValidIncidentIdFormat(id)) {
        return res.status(400).json({ error: 'Invalid incident ID format.' });
      }

      const incident = await findIncidentByAnyId(id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found.' });
      }

      // Check incident is still 'Reported' or 'Assigned'
      if (!['Reported', 'Assigned'].includes(incident.status)) {
        return res.status(409).json({
          error: `Cannot assign rescue squad: incident status is '${incident.status}'. Only Reported or Assigned incidents may be assigned.`
        });
      }

      const team = await findTeamByAnyId(teamId);
      if (!team) {
        return res.status(404).json({ error: `Rescue squad '${teamId}' not found.` });
      }

      // Check that the team's status is 'Available'
      if (team.status !== 'Available') {
        return res.status(409).json({ error: 'Rescue team is not available' });
      }

      const now = new Date();
      const adminName = req.user?.name || 'Admin';

      const previousTeamStatus = team.status;

      // Update squad status to Assigned first
      team.status = 'Assigned';
      await team.save();

      try {
        incident.assignedTeamId = team.id;
        incident.assignedTeamName = team.name;
        if (incident.status === 'Reported') {
          incident.status = 'Assigned';
        }
        incident.updatedAt = now;
        incident.timeline.push({
          status: 'Assigned',
          time: now,
          note: note || `${adminName} assigned rescue team: ${team.name}`
        });

        await incident.save();

        await logAudit({
          user: req.user,
          action: 'INCIDENT_ASSIGNED',
          targetType: 'Incident',
          targetId: incident.id,
          details: { teamId: team.id, teamName: team.name },
          req
        });
      } catch (incidentError) {
        // Rollback squad status if incident save failed
        try {
          team.status = previousTeamStatus;
          await team.save();
        } catch (rollbackErr) {
          console.error('Failed to rollback team status:', rollbackErr);
        }
        throw incidentError;
      }

      res.json({
        message: `Assigned ${team.name} to ${incident.id}`,
        incident: sanitizeIncidentForUser(incident, req.user)
      });
    } catch (error) {
      console.error('Error assigning rescue squad:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// PATCH /api/incidents/:id/status - Rescue squad or Admin updates status
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('rescue', 'admin'),
  statusIncidentValidator,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!isValidIncidentIdFormat(id)) {
        return res.status(400).json({ error: 'Invalid incident ID format.' });
      }

      const incident = await findIncidentByAnyId(id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found.' });
      }

      // A rescue user may only update incidents whose assignedTeamId equals req.user.teamId
      if (req.user.role === 'rescue') {
        if (!req.user.teamId || incident.assignedTeamId !== req.user.teamId) {
          return res.status(403).json({
            error: 'Forbidden: Rescue users can only update incidents assigned to their own squad.'
          });
        }
      }

      // Enforce status flow: Reported -> Assigned -> On the Way -> Reached -> In Progress -> Completed
      const currentIdx = STATUS_FLOW.indexOf(incident.status);
      const targetIdx = STATUS_FLOW.indexOf(status);

      if (currentIdx === -1 || targetIdx === -1 || targetIdx !== currentIdx + 1) {
        return res.status(409).json({
          error: `Invalid status transition: cannot move from '${incident.status}' to '${status}'. Only forward transition to '${STATUS_FLOW[currentIdx + 1] || 'none'}' is allowed.`
        });
      }

      const now = new Date();
      const updaterName = req.user?.name || 'rescue squad';

      const previousIncidentStatus = incident.status;
      const previousTimeline = [...incident.timeline];
      const previousUpdatedAt = incident.updatedAt;

      incident.status = status;
      incident.updatedAt = now;
      incident.timeline.push({
        status,
        time: now,
        note: note || `Status updated to ${status} by ${updaterName}`
      });

      await incident.save();

      // If status changed, coordinate team status safely with rollback if needed
      if (incident.assignedTeamId) {
        const team = await RescueTeam.findOne({ id: incident.assignedTeamId });
        if (team) {
          try {
            if (status === 'Completed' || status === 'Resolved') {
              team.status = 'Available';
            } else if (['On the Way', 'Reached', 'In Progress'].includes(status)) {
              team.status = 'In Progress';
            }
            await team.save();
          } catch (teamError) {
            console.error('Failed to update team status, rolling back incident status:', teamError);
            incident.status = previousIncidentStatus;
            incident.timeline = previousTimeline;
            incident.updatedAt = previousUpdatedAt;
            await incident.save();
            throw teamError;
          }
        }
      }

      await logAudit({
        user: req.user,
        action: 'STATUS_UPDATED',
        targetType: 'Incident',
        targetId: incident.id,
        details: { status, teamId: incident.assignedTeamId },
        req
      });

      res.json({
        message: `Incident ${incident.id} status updated to ${status}`,
        incident: sanitizeIncidentForUser(incident, req.user)
      });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;
