const { Vote, Submission, User } = require('../models');

exports.castVote = async (req, res, next) => {
  try {
    const { submission_id, value } = req.body;

    // Validate vote value (1-5)
    if (value < 1 || value > 5) {
      return res.status(400).json({ error: 'Vote must be between 1 and 5' });
    }

    // Check if submission exists
    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      where: {
        user_id: req.user.id,
        submission_id: submission_id
      }
    });

    if (existingVote) {
      // Update existing vote
      await existingVote.update({ value });
      return res.json({
        message: 'Vote updated',
        vote: existingVote
      });
    }

    // Create new vote
    const vote = await Vote.create({
      user_id: req.user.id,
      submission_id: submission_id,
      value: value
    });

    res.status(201).json({
      message: 'Vote cast successfully',
      vote: vote
    });

  } catch (error) {
    next(error);
  }
};

// Get all votes for a submission
exports.getSubmissionVotes = async (req, res, next) => {
  try {
    const { submission_id } = req.params;

    const votes = await Vote.findAndCountAll({
      where: { submission_id },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name']
        }
      ]
    });

    // Calculate average
    const avgValue = votes.rows.length > 0
      ? votes.rows.reduce((sum, v) => sum + v.value, 0) / votes.rows.length
      : 0;

    res.json({
      votes: votes.rows,
      total: votes.count,
      average: Math.round(avgValue * 10) / 10,
      distribution: {
        1: votes.rows.filter(v => v.value === 1).length,
        2: votes.rows.filter(v => v.value === 2).length,
        3: votes.rows.filter(v => v.value === 3).length,
        4: votes.rows.filter(v => v.value === 4).length,
        5: votes.rows.filter(v => v.value === 5).length
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get user's votes
exports.getUserVotes = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const votes = await Vote.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Submission,
          attributes: ['id', 'title', 'image_url']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      votes: votes,
      total: votes.length
    });

  } catch (error) {
    next(error);
  }
};

// Delete a vote
exports.deleteVote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vote = await Vote.findByPk(id);
    if (!vote) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    // Check if user owns the vote
    if (vote.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this vote' });
    }

    await vote.destroy();
    res.json({ message: 'Vote deleted successfully' });

  } catch (error) {
    next(error);
  }
};