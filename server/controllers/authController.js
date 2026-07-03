const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwttokenforlastmiledeliverytracker', {
    expiresIn: '30d'
  });
};

/**
 * Register User
 * Route: POST /api/auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password)' });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    // Determine role (guard registration against unsolicited admin signups)
    const assignedRole = role && ['customer', 'agent'].includes(role) ? role : 'customer';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during user registration' });
  }
};

/**
 * Login User
 * Route: POST /api/auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    // Match passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        availability: user.availability,
        currentZone: user.currentZone,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during user login' });
  }
};

/**
 * Get Current User Profile
 * Route: GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        availability: user.availability,
        currentZone: user.currentZone,
        currentLocation: user.currentLocation
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
