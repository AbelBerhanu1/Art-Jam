const { Jam, User, Submission } = require('../models');
const { Op } = require('sequelize');

exports.createJam = async (req, res, next) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      theme,
      rules,
      max_submissions_per_user,
      cover_image
    } = req.body;

    const jam = await Jam.create({
      title,
      description,
      start_date,
      end_date,
      theme: theme || null,
      rules: rules || null,
      max_submissions_per_user: max_submissions_per_user || 1,
      cover_image: cover_image || null,
      created_by: req.user.id,
      status: new Date() >= new Date(start_date) ? 'active' : 'draft'
    });

    res.status(201).json(jam);

  } catch (error) {
    next(error);
  }
};

// List all jams
exports.listJams = async (req, res, next) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;

    const jams = await Jam.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        },
        {
          model: Submission,
          attributes: ['id']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Add submission count to each jam
    const jamsWithCount = jams.rows.map(jam => ({
      ...jam.toJSON(),
      submission_count: jam.Submissions ? jam.Submissions.length : 0
    }));

    res.json({
      jams: jamsWithCount,
      total: jams.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    next(error);
  }
};

// Get single jam
exports.getJam = async (req, res, next) => {
  try {
    const jam = await Jam.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        },
        {
          model: Submission,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'display_name', 'avatar_url']
            }
          ]
        }
      ]
    });

    if (!jam) {
      return res.status(404).json({ error: 'Jam not found' });
    }

    res.json(jam);

  } catch (error) {
    next(error);
  }
};

// Update jam
exports.updateJam = async (req, res, next) => {
  try {
    const jam = await Jam.findByPk(req.params.id);

    if (!jam) {
      return res.status(404).json({ error: 'Jam not found' });
    }

    // Check if user is creator or admin
    if (jam.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this jam' });
    }

    const {
      title,
      description,
      start_date,
      end_date,
      theme,
      rules,
      max_submissions_per_user,
      cover_image,
      status
    } = req.body;

    await jam.update({
      title: title || jam.title,
      description: description || jam.description,
      start_date: start_date || jam.start_date,
      end_date: end_date || jam.end_date,
      theme: theme || jam.theme,
      rules: rules || jam.rules,
      max_submissions_per_user: max_submissions_per_user || jam.max_submissions_per_user,
      cover_image: cover_image || jam.cover_image,
      status: status || jam.status
    });

    res.json(jam);

  } catch (error) {
    next(error);
  }
};

// Delete jam
exports.deleteJam = async (req, res, next) => {
  try {
    const jam = await Jam.findByPk(req.params.id);

    if (!jam) {
      return res.status(404).json({ error: 'Jam not found' });
    }

    // Check if user is creator or admin
    if (jam.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this jam' });
    }

    await jam.destroy();
    res.json({ message: 'Jam deleted successfully' });

  } catch (error) {
    next(error);
  }
};