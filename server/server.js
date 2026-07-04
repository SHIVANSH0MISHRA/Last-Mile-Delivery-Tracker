const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Express Middlewares
app.use(cors());
app.use(express.json());

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Last-Mile Delivery Tracker Server is healthy.',
    timestamp: new Date(),
    mode: process.env.USE_MOCK_DB === 'true' ? 'Mock File Database' : 'MongoDB'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

const fs = require('fs');

// Start database and server
const startServer = async () => {
  await connectDB();
  
  // Serve static assets in production if client build exists
  const clientBuildPath = path.join(__dirname, '../client/dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    // Return API root message if deployed purely as backend (e.g. Render + Vercel stack)
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Last-Mile Delivery Tracker API is active.',
        healthCheck: '/health'
      });
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Last-Mile Delivery Tracker server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
};

startServer();
