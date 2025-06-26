const jwt = require('jsonwebtoken');
const User = require('../models/User.model'); // Vérifie la casse: "User.model.js" doit correspondre

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou mal formé' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // On attache les infos utiles de l'utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    console.error('Erreur de token :', error.message);
    res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = authMiddleware;


