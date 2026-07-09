const { Follow, User, Submission } = require('../models');
const { Op } = require('sequelize');

// Follow a user
exports.followUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    // Can't follow yourself
    if (user_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await User.findByPk(user_id);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        following_id: user_id
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow
    const follow = await Follow.create({
      follower_id: req.user.id,
      following_id: user_id
    });

    res.status(201).json({
      message: `You are now following ${userToFollow.username}`,
      follow
    });

  } catch (error) {
    next(error);
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const follow = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        following_id: user_id
      }
    });

    if (!follow) {
      return res.status(404).json({ error: 'You are not following this user' });
    }

    await follow.destroy();

    res.json({ message: 'Unfollowed successfully' });

  } catch (error) {
    next(error);
  }
};

// Get users I'm following
exports.getFollowing = async (req, res, next) => {
  try {
    const userId = req.params.user_id || req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'Following',
          attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      user_id: userId,
      following: user.Following || [],
      count: user.Following ? user.Following.length : 0
    });

  } catch (error) {
    next(error);
  }
};

// Get my followers
exports.getFollowers = async (req, res, next) => {
  try {
    const userId = req.params.user_id || req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      user_id: userId,
      followers: user.Followers || [],
      count: user.Followers ? user.Followers.length : 0
    });

  } catch (error) {
    next(error);
  }
};

// Check if I'm following a user
exports.checkFollow = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const follow = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        following_id: user_id
      }
    });

    res.json({
      is_following: !!follow
    });

  } catch (error) {
    next(error);
  }
};

// Get feed from followed users
exports.getFeed = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Get users I'm following
    const following = await Follow.findAll({
      where: { follower_id: req.user.id },
      attributes: ['following_id']
    });

    const followingIds = following.map(f => f.following_id);

    if (followingIds.length === 0) {
      return res.json({
        submissions: [],
        total: 0,
        message: 'Follow some users to see their posts'
      });
    }

    // Get submissions from followed users
    const submissions = await Submission.findAndCountAll({
      where: {
        user_id: {
          [Op.in]: followingIds
        },
        status: 'published'
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      submissions: submissions.rows,
      total: submissions.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    next(error);
  }
};