const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    submission_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    dislikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'comments'
  });

  return Comment;
};