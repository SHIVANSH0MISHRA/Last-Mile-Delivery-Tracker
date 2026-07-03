const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (process.env.USE_MOCK_DB === 'true') {
    console.log('⚠️  Using local JSON file-based database (Mock DB Mode).');
    return false;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery-tracker';

  try {
    console.log(`🔌 Attempting to connect to MongoDB: ${mongoURI}...`);
    // Connect with a short timeout to fail fast if MongoDB is not running locally
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log('✅ MongoDB connected successfully.');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Switching to local JSON file-based database (Mock DB Mode).');
    process.env.USE_MOCK_DB = 'true';
    return false;
  }
};

module.exports = { connectDB, isConnected: () => isConnected };
