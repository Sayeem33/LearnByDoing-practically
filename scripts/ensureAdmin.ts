import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  institution: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const ADMIN_EMAIL = 'admin.simulab@example.com';
const ADMIN_PASSWORD = 'password123';

async function ensureAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab';
    const dbUri = mongoUri.includes('/lab') ? mongoUri : `${mongoUri}/lab`;
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        $set: {
          name: 'System Administrator',
          password: passwordHash,
          role: 'admin',
          institution: 'SimuLab HQ',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    console.log(`Admin ready: ${admin.email} (${admin.role})`);
    console.log(`Secret admin login URL: /system-root-access-9x3/admin-login`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to ensure admin account:', error);
    process.exit(1);
  }
}

ensureAdmin();
