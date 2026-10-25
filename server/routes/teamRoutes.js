import express from 'express';
import RescueTeam from '../models/RescueTeam.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

import mongoose from 'mongoose';

const router = express.Router();

export const isValidTeamIdFormat = (id) => {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id);
};

export const findTeamByAnyId = async (id) => {
  if (!isValidTeamIdFormat(id)) {
    return null;
  }
  const trimmedId = id.trim();
  if (mongoose.Types.ObjectId.isValid(trimmedId) && /^[0-9a-fA-F]{24}$/.test(trimmedId)) {
    const byMongo = await RescueTeam.findById(trimmedId);
    if (byMongo) return byMongo;
  }
  return await RescueTeam.findOne({ id: trimmedId });
};

// GET /api/rescue-teams - List all teams (Protected)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const teams = await RescueTeam.find().sort({ id: 1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching rescue teams:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/rescue-teams/:id - Single team (Protected)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidTeamIdFormat(id)) {
      return res.status(400).json({ error: 'Invalid rescue team ID format.' });
    }

    const team = await findTeamByAnyId(id);
    if (!team) {
      return res.status(404).json({ error: 'Rescue team not found.' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching rescue team:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/rescue-teams/:id - Update status / location
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'rescue'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidTeamIdFormat(id)) {
      return res.status(400).json({ error: 'Invalid rescue team ID format.' });
    }

    const team = await findTeamByAnyId(id);
    if (!team) {
      return res.status(404).json({ error: 'Rescue team not found.' });
    }

    // A rescue user may only update their own team
    if (req.user.role === 'rescue') {
      const userTeamId = req.user.teamId;
      if (!userTeamId || (userTeamId !== team.id && userTeamId !== String(team._id))) {
        return res.status(403).json({
          error: 'Forbidden: Rescue personnel can only update their own squad details.'
        });
      }
    }

    const { status, currentLocation } = req.body;
    if (status) team.status = status;
    if (currentLocation) team.currentLocation = currentLocation;

    await team.save();

    res.json({
      message: 'Rescue team updated successfully',
      team
    });
  } catch (error) {
    console.error('Error updating rescue team:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
