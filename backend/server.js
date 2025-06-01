require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sequelize } = require('./config/db'); // Sequelize
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const memoryResetRoutes = require('./routes/memoryReset.routes');
const userRoutes = require('./routes/user.routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());  // Parse JSON bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/test-reset', memoryResetRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads')); // Sert les fichiers d'avatars

// Servir le frontend en production
const frontendPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(frontendPath));


// Route de santé pour Render
app.get('/healthz', (req, res) => res.send('OK'));
// Fallback React Router (à placer après les routes API)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Connexion MongoDB (Mongoose)
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie.');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
  }
};

// Démarrer le serveur après connexion aux bases de données
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL réussie.');

    await sequelize.sync({ alter: true });
    console.log('✅ Synchronisation des modèles Sequelize réussie.');

    await connectMongoDB(); // Connexion MongoDB

    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
  }
})();
