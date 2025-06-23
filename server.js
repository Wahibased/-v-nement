require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongoDB } = require('./config/mongo');
const { sequelize } = require('./config/db'); // Sequelize
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const memoryResetRoutes = require('./routes/memoryReset.routes');
const userRoutes = require('./routes/user.routes');
// const path = require('path'); // Not needed if serving static files is commented out

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Initialisation du backend...');

// --- MIDDLEWARES ---
// Configure CORS to allow requests from your Vercel frontend
const corsOptions = {
  origin: 'https://v-nement.vercel.app', // Your Vercel frontend URL
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
app.use(express.json());

// --- ROUTES API ---
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/test-reset', memoryResetRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));

// --- ROUTES DE TEST ET DE SANTÉ ---
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.get('/healthz', (req, res) => res.send('OK'));

// --- FRONTEND (STATIC FILES EN PROD) ---
// These lines are correctly commented out,
// as your frontend is deployed separately on Vercel.
// const frontendPath = path.join(__dirname, 'frontend/dist');
// app.use(express.static(frontendPath));
// app.get(/^\/(?!api\/|uploads\/|healthz).*/, (req, res) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });

// --- LANCEMENT DU SERVEUR ---
(async () => {
  try {
    console.log('Connexion à MySQL...');
    await sequelize.authenticate();
    console.log('Connexion à MySQL réussie.');

    await sequelize.sync({ alter: true });
    console.log('Synchronisation des modèles Sequelize réussie.');

    console.log('Connexion à MongoDB...');
    await connectMongoDB();

    // Listen on 0.0.0.0 for Railway deployments
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Serveur lancé et en écoute sur 0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur au démarrage du serveur:', error.message);
    // Exit the process if the database connection fails
    process.exit(1);
  }
})();

