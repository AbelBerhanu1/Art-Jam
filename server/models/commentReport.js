const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommentReport = sequelize.define('CommentReport', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    comment_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'dismissed'),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'comment_reports',
    indexes: [
      {
        unique: true,
        fields: ['comment_id', 'user_id']  
      }
    ]
  });

  return CommentReport;
};