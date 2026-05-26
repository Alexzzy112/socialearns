require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.updateOne(
    { email: 'azamukwokusilas2@gmail.com' },
    { $set: { isSuspended: false } }
  );
  console.log('Admin unsuspended');
  await mongoose.disconnect();
})();
