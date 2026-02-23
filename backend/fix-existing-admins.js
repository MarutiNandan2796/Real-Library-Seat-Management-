// Run this script once to fix existing approved admins
// Usage: node fix-existing-admins.js

const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  adminStatus: String,
  isActive: Boolean,
  isVerified: Boolean,
});

const User = mongoose.model('User', userSchema);

async function fixExistingAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library-management');
    console.log('✅ Connected to MongoDB');

    // Find all approved admins that are not active
    const result = await User.updateMany(
      {
        role: 'admin',
        adminStatus: 'approved',
        isActive: false
      },
      {
        $set: { isActive: true }
      }
    );

    console.log(`✅ Fixed ${result.modifiedCount} admin account(s)`);
    console.log('All approved admins can now login successfully!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixExistingAdmins();
