import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in backend/.env before starting the server');
}

const PORT = process.env.PORT || 5000;

// Process safety guards for network/SSL socket drops
process.on('unhandledRejection', (err) => {
  console.warn('Unhandled Rejection (caught by server guard):', err.message || err);
});

process.on('uncaughtException', (err) => {
  console.warn('Uncaught Exception (caught by server guard):', err.message || err);
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

// Resilient connection to MongoDB Atlas with background retry
let retryInterval = null;

const attemptConnection = async () => {
  if (mongoose.connection.readyState === 1) return;
  try {
    await connectDB();
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
  } catch (err) {
    console.warn('Initial Atlas connection attempt failed. Will retry automatically every 10s...');
    if (!retryInterval) {
      retryInterval = setInterval(async () => {
        if (mongoose.connection.readyState !== 1) {
          try {
            console.log('Attempting MongoDB Atlas reconnection...');
            await connectDB();
            clearInterval(retryInterval);
            retryInterval = null;
          } catch (retryErr) {
            // Waiting for IP whitelist or network
          }
        } else {
          clearInterval(retryInterval);
          retryInterval = null;
        }
      }, 10000);
    }
  }
};

attemptConnection();

export default server;
