const express = require('express');
const crypto = require('crypto');
const { sendResetEmail } = require('../utils/mailer'); // En CommonJS maintenant

const router = express.Router();

// Stockage temporaire en mémoire
const resetTokens = {};

// Route pour demander une réinitialisation
router.post('/forgot-password-memory', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 heure

  resetTokens[email] = { token, expires };

  try {
    await sendResetEmail(email, token);
    res.json({ message: 'Reset link sent to email (in-memory mode)' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Error sending email' });
  }
});

// Pour test de validation du token
router.get('/verify-reset/:email/:token', (req, res) => {
  const { email, token } = req.params;
  const data = resetTokens[email];

  if (!data || data.token !== token || Date.now() > data.expires) {
    return res.status(400).send('Invalid or expired token');
  }

  res.send('Token valid. Proceed to reset password.');
});

module.exports = router;
