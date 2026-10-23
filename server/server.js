import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbState] || 'unknown';

  res.json({
    status: 'healthy',
    system: 'ResQNet Smart Emergency Response API (Pune Zone)',
    database: {
      status: dbStatus,
      name: mongoose.connection.name,
      host: mongoose.connection.host
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/rescue-teams', teamRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`ResQNet Backend API Server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
