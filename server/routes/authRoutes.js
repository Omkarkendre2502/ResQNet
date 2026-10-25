import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getJwtSecret, getJwtExpiresIn } from '../config/jwt.js';
import { registerValidator, loginValidator, changePasswordValidator } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

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
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );
};

// POST /api/auth/register
router.post('/register', authLimiter, registerValidator, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Public registration ALWAYS assigns citizen role with active status — no auto-login
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'citizen',
      phone: phone || '',
      isActive: true
    });

    await newUser.save();

    res.status(201).json({
      message: 'Account created. Please sign in.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, loginValidator, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check account lockout
    if (user.isLocked) {
      return res.status(403).json({ error: 'Account is locked due to too many failed attempts. Try again after 15 minutes.' });
    }

    // Check account active status
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Your account has been disabled. Contact the administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Role check if provided: keep error generic to prevent account enumeration
    if (role && user.role !== role) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Reset failed login attempts on successful authentication
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        teamId: user.teamId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        mustChangePassword: user.mustChangePassword
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/auth/change-password (Protected)
router.patch('/change-password', authenticateToken, changePasswordValidator, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    // Password complexity check: admin requires min 12 with upper, lower, number, symbol
    if (user.role === 'admin') {
      const adminRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
      if (!adminRegex.test(newPassword)) {
        return res.status(400).json({
          error: 'Administrator passwords must be at least 12 characters and contain uppercase, lowercase, number, and special character.'
        });
      }
    } else {
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }
    }

    user.password = newPassword; // Triggers pre('save') to hash with salt 12
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/auth/users (Admin only — returns all registered users, passwords excluded)
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
