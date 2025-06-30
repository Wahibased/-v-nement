const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI); 
    console.log("MONGODB_URI =", process.env.MONGODB_URI ? "✔️ défini" : "❌ non défini");
    console.log(" Connecté à MongoDB Atlas");
  } catch (err) {
    console.error("Erreur MongoDB :", err);
    throw err;
  }
};

module.exports = { connectMongoDB };


