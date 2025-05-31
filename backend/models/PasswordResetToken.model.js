const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User.model'); 

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Un seul token actif par utilisateur
  }
}, {
  tableName: 'password_reset_tokens',
  timestamps: true,
});

// 🔗 Déclaration des associations dans une fonction pour éviter des erreurs circulaires
PasswordResetToken.associate = (models) => {
  PasswordResetToken.belongsTo(models.User, { foreignKey: 'userId' });
};

User.hasOne(PasswordResetToken, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

module.exports = PasswordResetToken;
