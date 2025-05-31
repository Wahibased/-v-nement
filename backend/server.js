require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sequelize } = require('./config/db'); // Sequelize
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const User = require('./models/User.model');
const memoryResetRoutes = require('./routes/memoryReset.routes');
const path = require('path');
const userRoutes = require('./routes/user.routes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());  // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/test-reset', memoryResetRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads')); // Sert les fichiers d'avatars




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


