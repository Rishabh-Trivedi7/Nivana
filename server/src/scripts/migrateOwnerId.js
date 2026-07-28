/**
 * Migration: Backfill ownerId on existing properties
 *
 * Run with: node src/scripts/migrateOwnerId.js
 *
 * This assigns the first admin user found as the owner of all
 * properties that don't already have an ownerId set.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { ROLES } from '../constants/roles.js';

const migrate = async () => {
  await connectDB();

  // Find the first admin user
  const admin = await User.findOne({ role: ROLES.ADMIN }).lean();

  if (!admin) {
    console.error('No admin user found. Cannot run migration.');
    process.exit(1);
  }

  console.log(`Found admin: ${admin.fullName} (${admin.email}) — ID: ${admin._id}`);

  // Update all properties that have no ownerId
  const result = await Property.updateMany(
    { ownerId: { $exists: false } },
    { $set: { ownerId: admin._id } }
  );

  console.log(`\nMigration complete!`);
  console.log(`Properties updated: ${result.modifiedCount}`);
  console.log(`Properties already had ownerId: ${result.matchedCount - result.modifiedCount}`);

  await mongoose.connection.close();
  process.exit(0);
};

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
