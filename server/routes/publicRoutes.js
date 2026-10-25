import express from 'express';
import rateLimit from 'express-rate-limit';
import Incident from '../models/Incident.js';
import RescueTeam from '../models/RescueTeam.js';
import User from '../models/User.js';

const router = express.Router();

const isTestEnv = process.env.NODE_ENV === 'test';

// Public endpoint rate limiter: 120 requests per 15 minutes per IP
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestEnv ? 5000 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests to public stats, please try again later.' }
});

router.use(publicLimiter);

/**
 * GET /api/public/stats
 * Returns public aggregate counts only for display on the landing page.
 * Strictly no personal data, no names, no incident descriptions or locations.
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalIncidents,
      completedIncidents,
      availableTeams,
      registeredCitizens,
      sampleIncidents
    ] = await Promise.all([
      Incident.countDocuments(),
      Incident.countDocuments({ status: { $in: ['Completed', 'Resolved'] } }),
      RescueTeam.countDocuments({ status: 'Available' }),
      User.countDocuments({ role: 'citizen', isActive: true }),
      Incident.find(
        { 'timeline.0': { $exists: true } },
        'reportedAt timeline'
      ).limit(100).lean()
    ]);

    // Calculate average response time in minutes based on timeline data if available
    let averageResponseMinutes = null;
    let totalMinutes = 0;
    let validSampleCount = 0;

    for (const inc of sampleIncidents) {
      if (!inc.reportedAt || !Array.isArray(inc.timeline)) continue;
      const reportedTime = new Date(inc.reportedAt).getTime();
      // Find the first event marking 'Reached' or 'On the Way'
      const responseEvent = inc.timeline.find(
        (t) => t.status === 'Reached' || t.status === 'On the Way'
      );
      if (responseEvent && responseEvent.time) {
        const responseTime = new Date(responseEvent.time).getTime();
        const diffMinutes = (responseTime - reportedTime) / (1000 * 60);
        // Sanity check: response between 1 minute and 180 minutes
        if (diffMinutes >= 1 && diffMinutes <= 180) {
          totalMinutes += diffMinutes;
          validSampleCount++;
        }
      }
    }

    if (validSampleCount > 0) {
      averageResponseMinutes = Number((totalMinutes / validSampleCount).toFixed(1));
    }

    // Set cache control for 30 seconds to ease database load while staying fresh
    res.set('Cache-Control', 'public, max-age=30');

    res.json({
      totalIncidents,
      completedIncidents,
      availableTeams,
      registeredCitizens,
      averageResponseMinutes
    });
  } catch (error) {
    console.error('[Public API Error] Error fetching public stats:', error);
    res.status(500).json({ error: 'Failed to retrieve aggregate statistics' });
  }
});

export default router;
