import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  studentId: String,
  institution: String,
  grade: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const seedData = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: 'password123',
    role: 'student',
    studentId: 'STU001',
    institution: 'Oxford University',
    grade: '10A',
  },
  {
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    password: 'password123',
    role: 'student',
    studentId: 'STU002',
    institution: 'Cambridge University',
    grade: '9B',
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    role: 'student',
    studentId: 'STU003',
    institution: 'Imperial College London',
    grade: '10A',
  },
  {
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    password: 'password123',
    role: 'student',
    studentId: 'STU004',
    institution: 'University College London',
    grade: '9A',
  },
  {
    name: 'Dr. James Teacher',
    email: 'james.teacher@example.com',
    password: 'password123',
    role: 'teacher',
    institution: 'Oxford University',
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab';
    // Ensure database name is in the URI
    const dbUri = mongoUri.includes('/lab') ? mongoUri : mongoUri + '/lab';
    await mongoose.connect(dbUri);
    console.log('✓ Connected to MongoDB (lab database)');

    // Clear existing users
    await User.deleteMany({});
    console.log('✓ Cleared existing users');

    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      seedData.map(async (userData) => ({
        ...userData,
        password: await bcrypt.hash(userData.password, 10),
      }))
    );

    // Insert seeded data
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✓ Created ${createdUsers.length} users\n`);

    // Display created users
    console.log('Seeded Users:');
    createdUsers.forEach((user: any) => {
      console.log(`  • ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
