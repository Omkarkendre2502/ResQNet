import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Incident from '../models/Incident.js';
import RescueTeam from '../models/RescueTeam.js';
import AuditLog, { logAudit } from '../models/AuditLog.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { createRescueUserValidator, updateUserStatusValidator } from '../middleware/validation.js';

const router = express.Router();

const isValidObjectId = (id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id.trim());

// All admin routes require authentication and admin role
router.use(authenticateToken, authorizeRoles('admin'));

// Helper to escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/stats - High-level system statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      citizensCount,
      rescueCount,
      adminsCount,
      totalIncidents,
      activeIncidents,
      totalTeams,
      availableTeams
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'citizen' }),
      User.countDocuments({ role: 'rescue' }),
      User.countDocuments({ role: 'admin' }),
      Incident.countDocuments(),
      Incident.countDocuments({ status: { $nin: ['Completed', 'Resolved'] } }),
      RescueTeam.countDocuments(),
      RescueTeam.countDocuments({ status: 'Available' })
    ]);

    res.json({
      users: {
        total: totalUsers,
        citizens: citizensCount,
        rescue: rescueCount,
        admins: adminsCount
      },
      incidents: {
        total: totalIncidents,
        active: activeIncidents
      },
      teams: {
        total: totalTeams,
        available: availableTeams
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/users - Search, filter, and paginate users
router.get('/users', async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search && typeof search === 'string') {
      const escaped = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { teamId: { $regex: escaped, $options: 'i' } }
      ];
    }

    if (role && ['citizen', 'rescue', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = { $ne: false };
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/users/:id - User details with incident history
router.get('/users/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const incidents = await Incident.find({
      $or: [
        { reportedById: user._id },
        { reportedById: String(user._id) },
        { reporterEmail: user.email.toLowerCase() }
      ]
    }).sort({ reportedAt: -1 }).limit(20);

    res.json({ user, incidents });
  } catch (error) {
    console.error('Error fetching user detail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/admin/users/:id - Edit user profile info
router.patch('/users/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }
    const { name, phone, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const changes = {};

    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }
      changes.oldEmail = user.email;
      changes.newEmail = email.toLowerCase().trim();
      user.email = email.toLowerCase().trim();
    }

    if (name && name.trim()) {
      changes.oldName = user.name;
      changes.newName = name.trim();
      user.name = name.trim();
    }

    if (phone !== undefined) {
      changes.phone = phone.trim();
      user.phone = phone.trim();
    }

    await user.save();

    await logAudit({
      user: req.user,
      action: 'USER_UPDATED',
      targetType: 'User',
      targetId: user._id,
      details: changes,
      req
    });

    res.json({
      message: 'User profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        teamId: user.teamId
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/admin/users/:id/status - Activate or Deactivate user
router.patch('/users/:id/status', updateUserStatusValidator, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }
    const { isActive } = req.body;

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Safety check: Cannot deactivate oneself
    if (String(req.user._id) === String(targetUser._id)) {
      return res.status(400).json({ error: 'Cannot change activation status of your own account.' });
    }

    // Safety check: Cannot deactivate the last active administrator
    if (targetUser.role === 'admin' && !isActive) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          error: 'Cannot deactivate the sole remaining active administrator in the system.'
        });
      }
    }

    targetUser.isActive = isActive;
    if (isActive) {
      targetUser.failedLoginAttempts = 0;
      targetUser.lockUntil = null;
    }
    await targetUser.save();

    await logAudit({
      user: req.user,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetType: 'User',
      targetId: targetUser._id,
      details: { email: targetUser.email, role: targetUser.role },
      req
    });

    res.json({
      message: `User ${targetUser.email} has been ${isActive ? 'activated' : 'disabled'}.`,
      user: {
        id: targetUser._id,
        email: targetUser.email,
        isActive: targetUser.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/admin/users/:id/reset-password - Generate temporary password and set mustChangePassword
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Generate random 12-character high entropy password
    const tempPassword = `ResQ#${crypto.randomBytes(4).toString('hex')}!9`;

    targetUser.password = tempPassword; // Pre-save hook hashes with salt cost 12
    targetUser.mustChangePassword = true;
    targetUser.failedLoginAttempts = 0;
    targetUser.lockUntil = null;
    await targetUser.save();

    await logAudit({
      user: req.user,
      action: 'PASSWORD_RESET',
      targetType: 'User',
      targetId: targetUser._id,
      details: { email: targetUser.email },
      req
    });

    res.json({
      message: 'Temporary password generated successfully.',
      tempPassword,
      mustChangePassword: true
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/admin/users/:id - Delete user account with safety checks
router.delete('/users/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Safety check: Cannot delete self
    if (String(req.user._id) === String(targetUser._id)) {
      return res.status(400).json({ error: 'You cannot delete your own administrative account.' });
    }

    // Safety check: Cannot delete last admin
    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last administrator account.' });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    await logAudit({
      user: req.user,
      action: 'USER_DELETED',
      targetType: 'User',
      targetId: targetUser._id,
      details: { email: targetUser.email, role: targetUser.role },
      req
    });

    res.json({ message: `User account for ${targetUser.email} has been deleted.` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/admin/rescue-users - Create rescue squad login linked to teamId
router.post('/rescue-users', createRescueUserValidator, async (req, res) => {
  try {
    const { name, email, password, teamId, phone } = req.body;

    const team = await RescueTeam.findOne({ id: teamId.trim() });
    if (!team) {
      return res.status(404).json({ error: `Rescue squad '${teamId}' not found in registered squads.` });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newRescueUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'rescue',
      teamId: team.id,
      phone: phone || team.phone || '',
      isActive: true
    });

    await newRescueUser.save();

    await logAudit({
      user: req.user,
      action: 'RESCUE_USER_CREATED',
      targetType: 'User',
      targetId: newRescueUser._id,
      details: { email: newRescueUser.email, teamId: team.id },
      req
    });

    res.status(201).json({
      message: `Rescue squad login created for ${team.name}`,
      user: {
        id: newRescueUser._id,
        name: newRescueUser.name,
        email: newRescueUser.email,
        role: newRescueUser.role,
        teamId: newRescueUser.teamId
      }
    });
  } catch (error) {
    console.error('Error creating rescue user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/audit-logs - Latest audit log entries
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit).lean();
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
