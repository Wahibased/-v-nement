require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors'); // Import the cors middleware
const { connectMongoDB } = require('./config/mongo'); // Your MongoDB connection function
const { sequelize } = require('./config/db'); // Your Sequelize (MySQL) connection instance

// Import your API route modules
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const memoryResetRoutes = require('./routes/memoryReset.routes');
const userRoutes = require('./routes/user.routes');

// const path = require('path'); // This module is no longer needed as frontend static files are not served by the backend

const app = express();
// Define the port your server will listen on. Use process.env.PORT for Railway, or 5000 for local development.
const PORT = process.env.PORT || 5000;

console.log('🔄 Initialisation du backend...');

// === MIDDLEWARES ===
// Configure CORS to explicitly allow requests from your Vercel frontend.
// Replace 'https://v-nement-jcbq.vercel.app' with your exact Vercel production domain.
const corsOptions = {
  origin: 'https://v-nement-jcbq.vercel.app',
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions)); // Apply the CORS middleware with your specified options
app.use(express.json()); // Middleware to parse JSON bodies from incoming requests

// === API ROUTES ===
// Mount your imported route modules under their respective API paths
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/test-reset', memoryResetRoutes); // Assuming this is for testing/resetting
app.use('/api/users', userRoutes);

// Route to serve uploaded files (e.g., images). Assuming 'uploads' is a directory in your backend.
app.use('/uploads', express.static('uploads'));

// === TEST AND HEALTH CHECK ROUTES ===
// Simple test route to check if the backend is running and responsive
app.get('/api/test', (req, res) => {
  res.json({ message: ' Backend is running!' });
});

// Health check endpoint for deployment platforms (like Railway)
app.get('/healthz', (req, res) => res.send('OK'));

// === FRONTEND (STATIC FILES IN PRODUCTION) ===
// These lines are COMMENTED OUT because your frontend is deployed separately on Vercel.
// Your backend should NOT attempt to serve frontend static files.
// If these lines were active, they would cause the "ENOENT: no such file or directory" error
// because the /app/frontend/dist directory does not exist within the backend's container.
// const frontendPath = path.join(__dirname, 'frontend/dist');
// app.use(express.static(frontendPath));
// app.get(/^\/(?!api\/|uploads\/|healthz).*/, (req, res) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });

// === SERVER STARTUP LOGIC ===
// Asynchronous function to connect to databases and then start the server
(async () => {
  try {
    console.log('Connexion à MySQL...');
    await sequelize.authenticate(); // Test the MySQL connection
    console.log(' Connexion à MySQL réussie.');

    // Synchronize Sequelize models with the database.
    // 'alter: true' will make incremental changes without dropping tables.
    // Be cautious with 'alter: true' in production environments as it can have side effects.
    await sequelize.sync({ alter: true });
    console.log('Synchronisation des modèles Sequelize réussie.');

    console.log('⏳ Connexion à MongoDB...');
    await connectMongoDB(); // Connect to MongoDB
    // Assuming connectMongoDB prints success message internally

    // Start the Express server
    // Listen on '0.0.0.0' to bind to all network interfaces, which is common for container environments.
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Serveur lancé et en écoute sur 0.0.0.0:${PORT}`);
    });
  } catch (error) {
    // Log any errors that occur during database connection or server startup
    console.error('Erreur au démarrage du serveur:', error.message);
    // Exit the process with a non-zero code to indicate failure, useful for deployment platforms
    process.exit(1);
  }
})();


