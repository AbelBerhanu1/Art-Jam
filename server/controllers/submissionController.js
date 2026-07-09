const { Submission, User, Vote, Comment } = require('../models');
const { Op } = require('sequelize');

// Get all submissions (with optional filters)
exports.listSubmissions = async (req, res, next) => {
  try {
    const { jam_id, user_id, limit = 10, offset = 0 } = req.query;

    const where = {};
    if (jam_id) where.jam_id = jam_id;
    if (user_id) where.user_id = user_id;

    const submissions = await Submission.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        },
        {
          model: Vote,
          attributes: ['value']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate average rating for each submission
    const submissionsWithRating = submissions.rows.map(submission => {
      const votes = submission.Votes || [];
      const avgRating = votes.length > 0 
        ? votes.reduce((sum, v) => sum + v.value, 0) / votes.length 
        : 0;
      
      return {
        ...submission.toJSON(),
        avg_rating: Math.round(avgRating * 10) / 10,
        vote_count: votes.length
      };
    });

    res.json({
      submissions: submissionsWithRating,
      total: submissions.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

// Get single submission by ID
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio']
        },
        {
          model: Vote,
          attributes: ['value']
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'display_name', 'avatar_url']
            }
          ],
          where: { parent_id: null },
          required: false
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const votes = submission.Votes || [];
    const avgRating = votes.length > 0 
      ? votes.reduce((sum, v) => sum + v.value, 0) / votes.length 
      : 0;

    res.json({
      ...submission.toJSON(),
      avg_rating: Math.round(avgRating * 10) / 10,
      vote_count: votes.length
    });
  } catch (error) {
    next(error);
  }
};

// Create new submission (with image upload)
exports.createSubmission = async (req, res, next) => {
  try {
    const { title, description, jam_id } = req.body;

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Create submission
    const submission = await Submission.create({
      title,
      description,
      image_url: `/uploads/${req.file.filename}`,
      user_id: req.user.id,
      jam_id: jam_id || null,
      status: 'published'
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

// Update submission
exports.updateSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check ownership
    if (submission.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this submission' });
    }

    const { title, description, status } = req.body;

    await submission.update({
      title: title || submission.title,
      description: description || submission.description,
      status: status || submission.status
    });

    res.json(submission);
  } catch (error) {
    next(error);
  }
};

// Delete submission
exports.deleteSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check ownership
    if (submission.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this submission' });
    }

    await submission.destroy();
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    next(error);
  }
};