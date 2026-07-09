const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Follow = sequelize.define('Follow', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    follower_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    following_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'follows',
    indexes: [
      {
        unique: true,
        fields: ['follower_id', 'following_id']  
      }
    ]
  });

  return Follow;
};