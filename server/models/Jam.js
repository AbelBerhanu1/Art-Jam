const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Jam = sequelize.define('Jam', {
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
      type: DataTypes.TEXT,
      allowNull: false
    },
    cover_image: {
      type: DataTypes.STRING(255)
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    theme: {
      type: DataTypes.STRING(100)
    },
    rules: {
      type: DataTypes.TEXT
    },
    max_submissions_per_user: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'voting', 'completed'),
      defaultValue: 'draft'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'jams'
  });

  return Jam;
};