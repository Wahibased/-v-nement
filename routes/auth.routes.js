require('dotenv').config();

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User.model');
const PasswordResetToken = require('../models/PasswordResetToken.model'); // Assure-toi qu'il est bien créé
const { sendResetEmail } = require('../utils/mailer');


// 🔐 Enregistrement
router.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d’email invalide.' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà enregistré.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: 'Utilisateur enregistré avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l’inscription:', error);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 🔑 Connexion (login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (err) {
    console.error('Erreur lors du login:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 🔁 Demande de réinitialisation du mot de passe
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email requis.' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 3600000;

    await PasswordResetToken.destroy({ where: { userId: user.id } });

    await PasswordResetToken.create({
      token,
      expiresAt: new Date(expiration),
      userId: user.id,
    });

    await sendResetEmail(user.email, token);

    res.json({ message: 'Un email de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error('Erreur lors de la demande de reset:', err);
    res.status(500).json({ error: `Erreur serveur: ${err.message}` });  // Affiche le message exact
  }
});


// 🔐 Réinitialisation du mot de passe
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Mot de passe invalide (min. 6 caractères).' });
  }

  try {
    const resetEntry = await PasswordResetToken.findOne({
      where: {
        token,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: User
    });

    if (!resetEntry || !resetEntry.User) {
      return res.status(400).json({ error: 'Lien invalide ou expiré.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    resetEntry.User.password = hashedPassword;
    await resetEntry.User.save();
    await resetEntry.destroy();

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });

  } catch (error) {
    console.error('Erreur de reset:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;

