const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Submission = sequelize.define('Submission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    jam_id: {
      type: DataTypes.UUID,
      allowNull: true 
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published'
    }
  }, {
    tableName: 'submissions'
  });

  return Submission;
};