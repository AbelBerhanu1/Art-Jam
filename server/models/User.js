const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    display_name: {
      type: DataTypes.STRING(100)
    },
    bio: {
      type: DataTypes.TEXT
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'moderator'),
      defaultValue: 'user'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // NEW FIELDS
    instagram: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tiktok: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    twitter: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      }
    }
  });

  User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };
    User.prototype.changePassword = async function(newPassword) {
      this.password_hash = await bcrypt.hash(newPassword, 10);
      await this.save();
      return this;
  };
  
  return User;
};