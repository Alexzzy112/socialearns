const connectDB = require('../config/db');
const { connectCloudinary } = require('../config/cloudinary');
const app = require('../server');

const dbPromise = connectDB().catch(err => {
  console.error('DB connection failed:', err.message);
});
connectCloudinary();

module.exports = async (req, res) => {
  try {
    await dbPromise;
  } catch {
    return res.status(503).json({ message: 'Database connection failed. Please try again later.' });
  }
  return app(req, res);
};
