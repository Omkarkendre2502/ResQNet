import mongoose from 'mongoose';
import User from '../models/User.js';
import RescueTeam from '../models/RescueTeam.js';
import { initialTeams } from '../data/sampleData.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resqnet';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);

    // --- Optional first-run admin bootstrap from .env ---
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    if (adminEmail && adminPassword) {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (!existingAdmin) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
        if (!passwordRegex.test(adminPassword)) {
          console.warn('[Security Warning] ADMIN_PASSWORD in .env does not meet complexity requirements (min 12 chars with upper, lower, number, symbol). Skipping bootstrap.');
        } else {
          await User.create({
            name: adminName.trim(),
            email: adminEmail.toLowerCase().trim(),
            password: adminPassword,
            role: 'admin',
            isActive: true
          });
          console.warn('================================================================================');
          console.warn(`[SECURITY ALERT] Initial admin account created for ${adminEmail}.`);
          console.warn('PLEASE REMOVE ADMIN_PASSWORD FROM YOUR .env FILE IMMEDIATELY FOR SECURITY!');
          console.warn('================================================================================');
        }
      }
    }

    // --- Idempotent rescue-team seeding ---
    // Seed only when the rescueteams collection is completely empty.
    // Preserves any existing team records.
    const teamCount = await RescueTeam.countDocuments();
    if (teamCount === 0) {
      console.log('[MongoDB] Seeding initial Pune rescue squads...');
      await RescueTeam.insertMany(initialTeams);
      console.log('[MongoDB] Pune rescue squads initialized (PERT-01, PERT-02, PERT-03).');
    } else {
      console.log(`[MongoDB] Preserving existing rescue squads (${teamCount} teams found).`);
    }

  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
