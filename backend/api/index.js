const connectDB = require('../config/db');
const { connectCloudinary } = require('../config/cloudinary');
const { app } = require('../server');

connectDB();
connectCloudinary();

module.exports = app;
