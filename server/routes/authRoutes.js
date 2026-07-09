const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Password change validation
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

const adminResetPasswordValidation = [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

// ============================================
// PUBLIC ROUTES
// ============================================

// Register
router.post('/register', registerValidation, authController.register);

// Login
router.post('/login', loginValidation, authController.login);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Get current user
router.get('/me', requireAuth, authController.getMe);

// Change own password
router.post('/change-password', requireAuth, changePasswordValidation, authController.changePassword);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// Admin reset user password
router.post('/admin/reset-password/:userId', requireAuth, requireRole('admin'), adminResetPasswordValidation, authController.adminResetPassword);

module.exports = router;