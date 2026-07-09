const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommentLike = sequelize.define('CommentLike', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    comment_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false
    }
  }, {
    tableName: 'comment_likes',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'comment_id']
      }
    ]
  });

  return CommentLike;
};