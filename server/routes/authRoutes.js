import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      teamId: user.teamId
    },
    process.env.JWT_SECRET || 'resqnet_jwt_secret_pune_2026_super_secure_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Public registration ALWAYS assigns citizen role — admin/rescue cannot self-register
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'citizen',
      phone: phone || ''
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        teamId: newUser.teamId
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Role check if provided
    if (role && user.role !== role) {
      return res.status(403).json({
        error: `Account exists, but is registered as '${user.role}', not '${role}'.`
      });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        teamId: user.teamId
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during login.' });
  }
});

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/users (Admin only — returns all registered users, passwords excluded)
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve users.' });
  }
});

export default router;
