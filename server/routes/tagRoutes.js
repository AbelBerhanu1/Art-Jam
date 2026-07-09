const express = require('express');
const tagController = require('../controllers/tagController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Tag routes
router.post('/', requireAuth, tagController.tagUser);
router.delete('/:submission_id/:user_id', requireAuth, tagController.untagUser);
router.get('/submission/:submission_id', tagController.getSubmissionTags);
router.get('/user/:user_id', tagController.getUserTags);
router.get('/user/me', requireAuth, tagController.getUserTags);

module.exports = router;