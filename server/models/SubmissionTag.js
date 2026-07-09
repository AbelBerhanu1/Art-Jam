const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubmissionTag = sequelize.define('SubmissionTag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    submission_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'submission_tags',
    indexes: [
      {
        unique: true,
        fields: ['submission_id', 'user_id']  
      }
    ]
  });

  return SubmissionTag;
};