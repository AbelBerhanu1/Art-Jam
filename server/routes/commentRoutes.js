const express = require('express');
const commentController = require('../controllers/commentController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all comments for a submission
router.get('/submission/:submission_id', commentController.getSubmissionComments);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Create a comment
router.post('/', requireAuth, commentController.createComment);

// Like or dislike a comment
router.post('/:id/like', requireAuth, commentController.likeComment);

// Report a comment
router.post('/:id/report', requireAuth, commentController.reportComment);

// Update a comment (owner only)
router.put('/:id', requireAuth, commentController.updateComment);

// Delete a comment (owner or admin)
router.delete('/:id', requireAuth, commentController.deleteComment);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// Get all reports for a comment (admin only)
router.get('/:id/reports', requireAuth, requireRole('admin'), commentController.getCommentReports);

// Update report status (admin only)
router.put('/reports/:id', requireAuth, requireRole('admin'), commentController.updateReportStatus);

module.exports = router;