import express from 'express';
import Incident from '../models/Incident.js';
import RescueTeam from '../models/RescueTeam.js';
import { optionalAuth, authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/incidents - Fetch incidents with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, severity, type, assignedTeamId } = req.query;
    const filter = {};

    if (status) {
      if (status.toLowerCase() === 'active') {
        filter.status = { $nin: ['Completed', 'Resolved'] };
      } else if (status.toLowerCase() === 'completed') {
        filter.status = { $in: ['Completed', 'Resolved'] };
      } else {
        filter.status = new RegExp(`^${status}$`, 'i');
      }
    }

    if (severity) {
      filter.severity = new RegExp(`^${severity}$`, 'i');
    }

    if (type) {
      filter.type = new RegExp(`^${type}$`, 'i');
    }

    if (assignedTeamId) {
      filter.assignedTeamId = assignedTeamId;
    }

    const incidents = await Incident.find(filter).sort({ reportedAt: -1 });
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch incidents.' });
  }
});

// GET /api/incidents/:id - Get single incident
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findOne({
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/incidents - Citizen reports a new emergency
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      type,
      location,
      coordinates,
      peopleAffected,
      severity,
      description,
      photoUrl,
      reporterName,
      reporterEmail,
      reporterPhone
    } = req.body;

    if (!type || !location || !severity || !description) {
      return res.status(400).json({
        error: 'Missing required emergency fields: type, location, severity, and description are required.'
      });
    }

    const newId = `INC-${Math.floor(2000 + Math.random() * 8000)}`;
    const now = new Date();

    const defaultPuneCoords = [
      18.5204 + (Math.random() - 0.5) * 0.04,
      73.8567 + (Math.random() - 0.5) * 0.04
    ];

    const incidentData = {
      id: newId,
      type,
      title: `${type} Emergency at ${location.split(',')[0]}`,
      location: location.trim(),
      coordinates: coordinates && coordinates.length === 2 ? coordinates : defaultPuneCoords,
      peopleAffected: parseInt(peopleAffected) || 1,
      severity,
      description: description.trim(),
      reportedBy: req.user?.name || reporterName || 'Priya Sharma',
      reporterEmail: req.user?.email || reporterEmail || 'priya.sharma@example.com',
      reporterPhone: reporterPhone || req.user?.phone || '+91 98220 12345',
      status: 'Reported',
      assignedTeamId: null,
      assignedTeamName: null,
      photoUrl: photoUrl || null,
      reportedAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'Reported',
          time: now,
          note: `Emergency reported by ${req.user?.name || reporterName || 'Priya Sharma'}. Severity: ${severity}.`
        }
      ]
    };

    const incident = new Incident(incidentData);
    await incident.save();

    res.status(201).json({
      message: 'Emergency reported successfully',
      incident
    });
  } catch (error) {
    console.error('Error reporting emergency:', error);
    res.status(500).json({ error: error.message || 'Failed to submit emergency report.' });
  }
});

// PATCH /api/incidents/:id/assign - Admin assigns a rescue squad
router.patch('/:id/assign', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { teamId, note } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required to assign a squad.' });
    }

    const incident = await Incident.findOne({
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    const team = await RescueTeam.findOne({
      $or: [{ id: teamId }, { _id: teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null }]
    });

    if (!team) {
      return res.status(404).json({ error: `Rescue squad '${teamId}' not found.` });
    }

    const now = new Date();
    incident.assignedTeamId = team.id;
    incident.assignedTeamName = team.name;
    if (incident.status === 'Reported') {
      incident.status = 'Assigned';
    }
    incident.updatedAt = now;
    incident.timeline.push({
      status: 'Assigned',
      time: now,
      note: note || `Admin Rahul Patil assigned rescue team: ${team.name}`
    });

    await incident.save();

    // Update squad status to Assigned
    team.status = 'Assigned';
    await team.save();

    res.json({
      message: `Assigned ${team.name} to ${incident.id}`,
      incident
    });
  } catch (error) {
    console.error('Error assigning rescue squad:', error);
    res.status(500).json({ error: error.message || 'Failed to assign rescue squad.' });
  }
});

// PATCH /api/incidents/:id/status - Rescue squad updates status
router.patch('/:id/status', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required.' });
    }

    const incident = await Incident.findOne({
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    const now = new Date();
    incident.status = status;
    incident.updatedAt = now;
    incident.timeline.push({
      status,
      time: now,
      note: note || `Status updated to ${status} by rescue squad`
    });

    await incident.save();

    // If status is Completed or Resolved, free up the assigned squad back to Available
    if (incident.assignedTeamId) {
      const team = await RescueTeam.findOne({ id: incident.assignedTeamId });
      if (team) {
        if (status === 'Completed' || status === 'Resolved') {
          team.status = 'Available';
        } else if (['On the Way', 'Reached', 'In Progress'].includes(status)) {
          team.status = 'In Progress';
        }
        await team.save();
      }
    }

    res.json({
      message: `Incident ${incident.id} status updated to ${status}`,
      incident
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: error.message || 'Failed to update incident status.' });
  }
});

// General PATCH /api/incidents/:id - Handles assignment or status update interchangeably
router.patch('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTeamId, status, note } = req.body;

    const incident = await Incident.findOne({
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    const now = new Date();

    // Assignment handling
    if (assignedTeamId) {
      const team = await RescueTeam.findOne({
        $or: [{ id: assignedTeamId }, { _id: assignedTeamId.match(/^[0-9a-fA-F]{24}$/) ? assignedTeamId : null }]
      });

      if (team) {
        incident.assignedTeamId = team.id;
        incident.assignedTeamName = team.name;
        if (incident.status === 'Reported') {
          incident.status = 'Assigned';
        }
        incident.timeline.push({
          status: 'Assigned',
          time: now,
          note: note || `Admin Rahul Patil assigned rescue team: ${team.name}`
        });

        team.status = 'Assigned';
        await team.save();
      }
    }

    // Status handling
    if (status) {
      incident.status = status;
      incident.timeline.push({
        status,
        time: now,
        note: note || `Status updated to ${status}`
      });

      if (incident.assignedTeamId) {
        const team = await RescueTeam.findOne({ id: incident.assignedTeamId });
        if (team) {
          if (status === 'Completed' || status === 'Resolved') {
            team.status = 'Available';
          } else if (['On the Way', 'Reached', 'In Progress'].includes(status)) {
            team.status = 'In Progress';
          }
          await team.save();
        }
      }
    }

    incident.updatedAt = now;
    await incident.save();

    res.json({
      message: 'Incident updated successfully',
      incident
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: error.message || 'Failed to update incident.' });
  }
});

export default router;
