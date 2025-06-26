const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

async function sendResetEmail(to, token) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${encodeURIComponent(to)}/${token}`;

    const info = await transporter.sendMail({
      from: `"My App" <${process.env.BREVO_USER}>`,
      to,
      subject: '🔐 Réinitialisation de mot de passe',
      html: `
        <h3>Réinitialisation de mot de passe</h3>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Ce lien expirera dans une heure.</p>
      `
    });

    console.log('✅ Email de réinitialisation envoyé:', info.messageId);
  } catch (error) {
    console.error('❌ Erreur lors de l’envoi du mail de réinitialisation:', error);
    throw error; // Pour propager l’erreur vers le contrôleur
  }
}

module.exports = { sendResetEmail };

