const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Registration = sequelize.define('Registration', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  event_mongo_id: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Registration;
