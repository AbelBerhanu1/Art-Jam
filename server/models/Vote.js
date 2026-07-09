const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vote = sequelize.define('Vote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    submission_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    tableName: 'votes',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'submission_id'] 
      }
    ]
  });

  return Vote;
};