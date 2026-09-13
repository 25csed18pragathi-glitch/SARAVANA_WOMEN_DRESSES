import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas using Mongoose with robust error handling
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in environment variables. Please check your backend/.env file.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (error.name === 'MongooseServerSelectionError') {
      console.warn('Action Required: Please whitelist your IP (0.0.0.0/0 or 223.181.223.69) in MongoDB Atlas -> Network Access.');
    }
    throw error;
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB Atlas: Connection established successfully.');
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB Atlas: Disconnected from cluster.');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB Atlas: Reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB Atlas Connection Error:', err.message);
});

export default connectDB;
