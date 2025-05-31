const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING(191), // Pour éviter ER_TOO_LONG_KEY en MySQL
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '', // ou une image par défaut comme '/uploads/default.png'
  },

  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  resetTokenExpiration: {
    type: DataTypes.DATE,
    allowNull: true,
  }

}, {
  timestamps: true, // createdAt / updatedAt
});

module.exports = User;


