const { sequelize } = require('../config/database');

// Import models
const User = require('./User')(sequelize);
const Submission = require('./Submission')(sequelize);
const Vote = require('./Vote')(sequelize);
const Comment = require('./Comment')(sequelize);
const Jam = require('./Jam')(sequelize);
const SubmissionTag = require('./SubmissionTag')(sequelize);
const Follow = require('./Follow')(sequelize);
const CommentLike = require('./CommentLike')(sequelize);
const CommentReport = require('./CommentReport')(sequelize);

// ============================================
// ASSOCIATIONS
// ============================================

// User → Submissions
User.hasMany(Submission, { foreignKey: 'user_id' });
Submission.belongsTo(User, { foreignKey: 'user_id' });

// User → Votes
User.hasMany(Vote, { foreignKey: 'user_id' });
Vote.belongsTo(User, { foreignKey: 'user_id' });

// Submission → Votes
Submission.hasMany(Vote, { foreignKey: 'submission_id' });
Vote.belongsTo(Submission, { foreignKey: 'submission_id' });

// User → Comments
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// Submission → Comments
Submission.hasMany(Comment, { foreignKey: 'submission_id' });
Comment.belongsTo(Submission, { foreignKey: 'submission_id' });

// Comment → Replies (self-referencing with alias 'Comments' to match frontend)
Comment.hasMany(Comment, { as: 'Comments', foreignKey: 'parent_id' });
Comment.belongsTo(Comment, { as: 'Parent', foreignKey: 'parent_id' });

// Comment → CommentLike
Comment.hasMany(CommentLike, { foreignKey: 'comment_id' });
CommentLike.belongsTo(Comment, { foreignKey: 'comment_id' });

// User → CommentLike
User.hasMany(CommentLike, { foreignKey: 'user_id' });
CommentLike.belongsTo(User, { foreignKey: 'user_id' });

// Comment → CommentReport
Comment.hasMany(CommentReport, { foreignKey: 'comment_id' });
CommentReport.belongsTo(Comment, { foreignKey: 'comment_id' });

// User → CommentReport
User.hasMany(CommentReport, { foreignKey: 'user_id' });
CommentReport.belongsTo(User, { foreignKey: 'user_id' });

// Jam → Submissions
Jam.hasMany(Submission, { foreignKey: 'jam_id' });
Submission.belongsTo(Jam, { foreignKey: 'jam_id' });

// User → Jams
User.hasMany(Jam, { foreignKey: 'created_by' });
Jam.belongsTo(User, { foreignKey: 'created_by' });

// Submission → SubmissionTag
Submission.hasMany(SubmissionTag, { foreignKey: 'submission_id' });
SubmissionTag.belongsTo(Submission, { foreignKey: 'submission_id' });

// User → SubmissionTag
User.hasMany(SubmissionTag, { foreignKey: 'user_id' });
SubmissionTag.belongsTo(User, { foreignKey: 'user_id' });

// ============================================
// FOLLOW ASSOCIATIONS
// ============================================

// A user can follow many users
User.belongsToMany(User, {
  through: Follow,
  as: 'Following',
  foreignKey: 'follower_id',
  otherKey: 'following_id'
});

User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'following_id',
  otherKey: 'follower_id'
});

// ============================================
// EXPORT ALL MODELS
// ============================================

module.exports = {
  sequelize,
  User,
  Submission,
  Vote,
  Comment,
  CommentLike,
  CommentReport,
  Jam,
  SubmissionTag,
  Follow
};