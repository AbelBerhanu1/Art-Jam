const express = require('express');
const voteController = require('../controllers/voteController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Routes
router.post('/', requireAuth, voteController.castVote);
router.get('/submission/:submission_id', voteController.getSubmissionVotes);
router.get('/user/me', requireAuth, voteController.getUserVotes);
router.delete('/:id', requireAuth, voteController.deleteVote);

module.exports = router;