require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = process.env.JAWSDB_URL
  ? new Sequelize(process.env.JAWSDB_URL, {
      dialect: 'mysql',
      logging: false,
    })
  : new Sequelize(
      process.env.MYSQL_DATABASE,
      process.env.MYSQL_USER,
      process.env.MYSQL_PASSWORD,
      {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false,
      }
    );

module.exports = { sequelize };

