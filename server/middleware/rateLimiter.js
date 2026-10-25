import rateLimit from 'express-rate-limit';

const isTestEnv = process.env.NODE_ENV === 'test';

// Global rate limiter: 200 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestEnv ? 5000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Stricter limiter on login and register: 10 per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestEnv ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes.' }
});

// Stricter limiter on POST /api/incidents: 20 per hour
export const reportIncidentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTestEnv ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many emergency reports submitted from this IP, please try again later.' }
});

export default {
  globalLimiter,
  authLimiter,
  reportIncidentLimiter
};
