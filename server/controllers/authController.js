import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Check if we're in demo mode (no MongoDB)
const isDemoMode = () => {
  return mongoose.connection.readyState !== 1;
};

// Demo user data (inline)
const demoUser = {
  _id: 'demo-admin',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin'
};

export const register = async (req, res) => {
  try {
    if (isDemoMode()) {
      return res.status(503).json({ 
        message: 'Registration unavailable in demo mode. Please connect to MongoDB.' 
      });
    }

    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Demo mode - allow admin login
    if (isDemoMode()) {
      if (email === 'admin@example.com' && password === 'admin123') {
        const token = jwt.sign(
          { userId: demoUser._id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          message: 'Login successful (Demo Mode)',
          token,
          user: {
            id: demoUser._id,
            username: demoUser.username,
            email: demoUser.email,
            role: demoUser.role
          }
        });
      } else {
        return res.status(400).json({ message: 'Invalid credentials. In demo mode, use admin@example.com / admin123' });
      }
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (isDemoMode()) {
      return res.json({ 
        user: {
          id: demoUser._id,
          username: demoUser.username,
          email: demoUser.email,
          role: demoUser.role
        }
      });
    }

    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
