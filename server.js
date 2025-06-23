require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongoDB } = require('./config/mongo');
const { sequelize } = require('./config/db'); // Sequelize
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const memoryResetRoutes = require('./routes/memoryReset.routes');
const userRoutes = require('./routes/user.routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
// --- ADD THIS LINE ---
const HOST = '0.0.0.0'; 

console.log('🔄 Initialisation du backend...');

// === MIDDLEWARES ===
app.use(cors());
app.use(express.json());

// === ROUTES API ===
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/test-reset', memoryResetRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));

// === ROUTES DE TEST ET DE SANTÉ ===
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend is running!' });
});

app.get('/healthz', (req, res) => res.send('OK'));

// === FRONTEND (STATIC FILES EN PROD) ===
const frontendPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(frontendPath));
app.get(/^\/(?!api\/|uploads\/|healthz).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// === LANCEMENT DU SERVEUR ===
(async () => {
  try {
    console.log('⏳ Connexion à MySQL...');
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL réussie.');

    await sequelize.sync({ alter: true });
    console.log('✅ Synchronisation des modèles Sequelize réussie.');

    console.log('⏳ Connexion à MongoDB...');
    await connectMongoDB();

    // --- CHANGE THIS LINE ---
    app.listen(PORT, HOST, () => { // Added HOST here
      console.log(`🚀 Serveur lancé et en écoute sur ${HOST}:${PORT}`); // Updated log for clarity
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error.message);
    // It's good practice to exit the process if critical services (like DB) fail to connect
    process.exit(1); 
  }
})();