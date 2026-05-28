const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');
  if ((uri.includes('localhost') || uri.includes('127.0.0.1')) && process.env.VERCEL === '1') {
    throw new Error('MONGO_URI points to localhost. Use a remote MongoDB Atlas URI for deployment.');
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  cachedConnection = conn;
  return conn;
};

module.exports = connectDB;
