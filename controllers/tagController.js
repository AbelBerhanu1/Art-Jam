const { SubmissionTag, User, Submission } = require('../models');

// Tag a user in a submission
exports.tagUser = async (req, res, next) => {
  try {
    const { submission_id, user_id } = req.body;

    // Check if submission exists
    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already tagged
    const existingTag = await SubmissionTag.findOne({
      where: {
        submission_id,
        user_id
      }
    });

    if (existingTag) {
      return res.status(400).json({ error: 'User already tagged in this submission' });
    }

    const tag = await SubmissionTag.create({
      submission_id,
      user_id
    });

    res.status(201).json({
      message: `User ${user.username} tagged in submission`,
      tag
    });

  } catch (error) {
    next(error);
  }
};

// Untag a user from a submission
exports.untagUser = async (req, res, next) => {
  try {
    const { submission_id, user_id } = req.params;

    const tag = await SubmissionTag.findOne({
      where: {
        submission_id,
        user_id
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await tag.destroy();
    res.json({ message: 'User untagged successfully' });

  } catch (error) {
    next(error);
  }
};

// Get all tags for a submission
exports.getSubmissionTags = async (req, res, next) => {
  try {
    const { submission_id } = req.params;

    const tags = await SubmissionTag.findAll({
      where: { submission_id },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        }
      ]
    });

    res.json({
      submission_id,
      tags: tags.map(t => t.User),
      count: tags.length
    });

  } catch (error) {
    next(error);
  }
};

// Get submissions where user is tagged
exports.getUserTags = async (req, res, next) => {
  try {
    const userId = req.params.user_id || req.user.id;

    const tags = await SubmissionTag.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Submission,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'display_name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      user_id: userId,
      submissions: tags.map(t => t.Submission),
      count: tags.length
    });

  } catch (error) {
    next(error);
  }
};