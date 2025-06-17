require('dotenv').config();
const { Sequelize } = require('sequelize');

const mysql = require('mysql');
const db = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);
new Sequelize(process.env.CLEARDB_DATABASE_URL, {
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

