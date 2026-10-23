import mongoose from 'mongoose';
import User from '../models/User.js';
import RescueTeam from '../models/RescueTeam.js';
import { initialTeams } from '../data/sampleData.js';

// Default seed accounts — each is checked individually so a partial seed is
// always completed without overwriting any existing account or password.
const DEFAULT_SEED_USERS = [
  {
    name: 'Rahul Patil',
    email: 'admin@resqnet.org',
    password: 'adminpassword',
    role: 'admin',
    phone: '+91 98230 45678'
  },
  {
    name: 'Priya Sharma',
    email: 'citizen@resqnet.org',
    password: 'password123',
    role: 'citizen',
    phone: '+91 98220 12345'
  },
  {
    name: 'Pune Emergency Response Team 01',
    email: 'rescue@resqnet.org',
    password: 'rescuepassword',
    role: 'rescue',
    teamId: 'PERT-01',
    phone: '+91 (020) 2550-6789'
  }
];

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resqnet';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);

    // --- Idempotent user seeding ---
    // Check each default account by email; create only if missing.
    // Never overwrites an existing account or its password.
    let created = 0;
    for (const seed of DEFAULT_SEED_USERS) {
      const exists = await User.findOne({ email: seed.email });
      if (!exists) {
        await User.create(seed); // pre('save') hook bcrypt-hashes the password
        console.log(`[MongoDB] Seeded missing account: ${seed.email} (${seed.role})`);
        created++;
      }
    }
    if (created === 0) {
      const total = await User.countDocuments();
      console.log(`[MongoDB] All default accounts present. users collection has ${total} document(s).`);
    } else {
      console.log(`[MongoDB] Seeded ${created} missing default account(s).`);
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
