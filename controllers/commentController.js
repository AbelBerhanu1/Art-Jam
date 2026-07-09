const { Comment, User, Submission, CommentLike } = require('../models');

exports.createComment = async (req, res, next) => {
  try {
    const { submission_id, content, parent_id } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (parent_id) {
      const parentComment = await Comment.findByPk(parent_id);
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      content: content.trim(),
      user_id: req.user.id,
      submission_id,
      parent_id: parent_id || null
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        }
      ]
    });

    res.status(201).json(commentWithUser);

  } catch (error) {
    next(error);
  }
};

exports.getSubmissionComments = async (req, res, next) => {
  try {
    const { submission_id } = req.params;

    const comments = await Comment.findAll({
      where: {
        submission_id,
        parent_id: null
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        },
        {
          model: Comment,
          as: 'Comments',
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'display_name', 'avatar_url']
            },
            {
              model: CommentLike,
              attributes: ['type']
            }
          ],
          order: [['created_at', 'ASC']]
        },
        {
          model: CommentLike,
          attributes: ['type']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      comments,
      total: comments.length
    });

  } catch (error) {
    next(error);
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "like" or "dislike"' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const existing = await CommentLike.findOne({
      where: {
        user_id: req.user.id,
        comment_id: id
      }
    });

    if (existing) {
      if (existing.type === type) {
        await existing.destroy();
        if (type === 'like') {
          await comment.decrement('likes');
        } else {
          await comment.decrement('dislikes');
        }
        return res.json({ message: 'Reaction removed' });
      } else {
        // Change reaction type
        await existing.update({ type });
        if (type === 'like') {
          await comment.decrement('dislikes');
          await comment.increment('likes');
        } else {
          await comment.decrement('likes');
          await comment.increment('dislikes');
        }
        return res.json({ message: 'Reaction updated' });
      }
    }

    await CommentLike.create({
      user_id: req.user.id,
      comment_id: id,
      type
    });

    if (type === 'like') {
      await comment.increment('likes');
    } else {
      await comment.increment('dislikes');
    }

    const updatedComment = await Comment.findByPk(id);
    res.json({
      message: `${type} added`,
      likes: updatedComment.likes,
      dislikes: updatedComment.dislikes
    });

  } catch (error) {
    next(error);
  }
};

exports.reportComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Please provide a reason for reporting' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const existingReport = await CommentReport.findOne({
      where: {
        comment_id: id,
        user_id: req.user.id
      }
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this comment' });
    }

    const report = await CommentReport.create({
      comment_id: id,
      user_id: req.user.id,
      reason: reason.trim()
    });

    res.status(201).json({
      message: 'Comment reported successfully. Our moderators will review it.',
      report
    });

  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    await comment.update({ content: content.trim() });
    res.json(comment);

  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await Comment.destroy({ where: { parent_id: id } });
    await CommentLike.destroy({ where: { comment_id: id } });
    await CommentReport.destroy({ where: { comment_id: id } });
    await comment.destroy();

    res.json({ message: 'Comment and all associated data deleted successfully' });

  } catch (error) {
    next(error);
  }
};

exports.getCommentReports = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reports = await CommentReport.findAll({
      where: { comment_id: id },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'display_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      comment_id: id,
      reports,
      total: reports.length
    });

  } catch (error) {
    next(error);
  }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await CommentReport.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await report.update({ status });

    res.json({
      message: `Report status updated to ${status}`,
      report
    });

  } catch (error) {
    next(error);
  }
};