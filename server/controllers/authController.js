const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, display_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash: password,
      display_name: display_name || username
    });

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        avatar_url: user.avatar_url,
        bio: user.bio,
        instagram: user.instagram,
        tiktok: user.tiktok,
        twitter: user.twitter,
        website: user.website
      },
      token
    });

  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { username } });

    // Check if user exists and password matches
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        avatar_url: user.avatar_url,
        bio: user.bio,
        instagram: user.instagram,
        tiktok: user.tiktok,
        twitter: user.twitter,
        website: user.website
      },
      token
    });

  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
      avatar_url: user.avatar_url,
      bio: user.bio,
      instagram: user.instagram,
      tiktok: user.tiktok,
      twitter: user.twitter,
      website: user.website,
      created_at: user.created_at
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CHANGE PASSWORD (Authenticated User)
// ============================================
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get user with password_hash
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Change password
    await user.changePassword(newPassword);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    next(error);
  }
};

// ============================================
// ADMIN: RESET USER PASSWORD
// ============================================
exports.adminResetPassword = async (req, res, next) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.changePassword(newPassword);

    res.json({ 
      message: `Password reset successfully for ${user.username}`,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name
      }
    });

  } catch (error) {
    next(error);
  }
};