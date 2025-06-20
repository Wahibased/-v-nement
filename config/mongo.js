const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connecté à MongoDB Atlas");
  } catch (err) {
    console.error("❌ Erreur MongoDB :", err);
    throw err;
  }
};

module.exports = { connectMongoDB };
