const express = require('express');
const followController = require('../controllers/followController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Follow/Unfollow (protected)
router.post('/:user_id/follow', requireAuth, followController.followUser);
router.delete('/:user_id/follow', requireAuth, followController.unfollowUser);
router.get('/:user_id/follow/check', requireAuth, followController.checkFollow);

// Get following/followers
router.get('/:user_id/following', followController.getFollowing);
router.get('/:user_id/followers', followController.getFollowers);

// Feed (protected)
router.get('/feed', requireAuth, followController.getFeed);

module.exports = router;