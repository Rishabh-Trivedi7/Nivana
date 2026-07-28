import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { ROLES } from '../constants/roles.js';

const email = process.argv[2];

if (!email) {
  console.error('\nUsage: npm run make-admin <email>\n');
  console.error('Example: npm run make-admin you@example.com\n');
  process.exit(1);
}

const run = async () => {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    console.error(`\nNo user found with email: ${email}`);
    console.error('Register first at /register, then run this command.\n');
    await mongoose.connection.close();
    process.exit(1);
  }

  if (user.role === ROLES.ADMIN) {
    console.log(`\n${user.email} is already an admin.\n`);
    await mongoose.connection.close();
    process.exit(0);
  }

  user.role = ROLES.ADMIN;
  user.tokenVersion += 1;
  await user.save();

  console.log(`\nSuccess: ${user.email} is now an admin.`);
  console.log('Sign in at /admin/login\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('make-admin failed:', err.message);
  process.exit(1);
});
