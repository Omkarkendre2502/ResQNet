import express from 'express';
import RescueTeam from '../models/RescueTeam.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/rescue-teams - List all teams
router.get('/', async (req, res) => {
  try {
    const teams = await RescueTeam.find().sort({ id: 1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching rescue teams:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch rescue teams.' });
  }
});

// GET /api/rescue-teams/:id - Single team
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const team = await RescueTeam.findOne({
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!team) {
      return res.status(404).json({ error: 'Rescue team not found.' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/rescue-teams/:id - Update status / location
router.patch('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentLocation } = req.body;

    const team = await RescueTeam.findOne({
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!team) {
      return res.status(404).json({ error: 'Rescue team not found.' });
    }

    if (status) team.status = status;
    if (currentLocation) team.currentLocation = currentLocation;

    await team.save();

    res.json({
      message: 'Rescue team updated successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
