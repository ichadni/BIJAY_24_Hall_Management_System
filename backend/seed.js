require('dotenv').config();
const User = require('./models/User');
const connectDB = require('./config/db');

const seedUsers = [
  {
    name: 'Hall Admin',
    email: 'admin@bijoy24.sust.edu',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    name: 'Hall Staff',
    email: 'staff@bijoy24.sust.edu',
    password: 'Staff@123',
    role: 'staff'
  }
];

const seed = async () => {
  try {
    // ==============================
    // CONNECT DB
    // ==============================
    await connectDB();

    console.log('🌱 Seeding default users...\n');

    // ==============================
    // INSERT USERS
    // ==============================
    for (const userData of seedUsers) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        console.log(`⚠️ Already exists: ${userData.email}`);
        continue;
      }

      await User.create(userData);

      console.log(
        `✅ Created ${userData.role}: ${userData.email}`
      );
    }

    console.log('\n✅ Seeding complete!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    process.exit(1);
  }
};

seed();