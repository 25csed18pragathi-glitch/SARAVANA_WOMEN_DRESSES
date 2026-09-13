import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required for admin seeding');
    console.log('Connecting to MongoDB Atlas to seed/update admin account...');
    await connectDB();

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Found existing account for ${adminEmail}. Updating credentials and role...`);
      admin.name = 'Saravana Store Admin';
      admin.role = 'admin';
      admin.password = adminPassword; // Pre-save hook will hash it with bcrypt
      await admin.save();
      console.log('✅ Admin account updated successfully.');
    } else {
      console.log(`Creating new admin account for ${adminEmail}...`);
      admin = await User.create({
        name: 'Saravana Store Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: process.env.ADMIN_PHONE || '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
      });
      console.log('✅ Admin account created successfully.');
    }

    // Verify the password hash matches
    const isMatch = await admin.matchPassword(adminPassword);
    console.log(`🔒 Verification match: ${isMatch ? 'PASSED (bcrypt verified)' : 'FAILED'}`);
    console.log(`👤 Admin ID: ${admin._id}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👑 Role: ${admin.role}`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
