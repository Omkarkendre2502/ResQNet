import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { getJwtSecret } from './config/jwt.js';
import { globalLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

// Ensure JWT secret is valid at startup (throws if missing or < 32 chars)
getJwtSecret();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// Restrict CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
    credentials: true
  })
);

// Body Parsers with 1MB limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sanitize request against NoSQL query injection
app.use(mongoSanitize());

// Global Rate Limiting
app.use(globalLimiter);

// Health Check Route (only returns status and timestamp)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Serve uploaded incident images read-only
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/rescue-teams', teamRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
});

// Global Error Handler (In production/500 never leaks error.message)
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  if (status === 500) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  res.status(status).json({
    error: err.message || 'An error occurred'
  });
});

// Start Server
let server = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`ResQNet Backend API Server running on port ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export const closeServer = () => {
  if (server) {
    server.close();
  }
};

export default app;
