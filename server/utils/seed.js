const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Zone = require('../models/Zone');
const RateCard = require('../models/RateCard');
const Order = require('../models/Order');
const TrackingHistory = require('../models/TrackingHistory');

async function seed() {
  // Initialize Database connection
  await connectDB();

  console.log('🧹 Purging existing collections/files...');
  await User.deleteMany({});
  await Zone.deleteMany({});
  await RateCard.deleteMany({});
  await Order.deleteMany({});
  await TrackingHistory.deleteMany({});

  console.log('👤 Creating users (Admin, Customer, and Agents)...');
  const passwordHash = await bcrypt.hash('Password123', 10);

  const admin = await User.create({
    name: 'Logistics Admin',
    email: 'admin@tracker.com',
    passwordHash: passwordHash,
    role: 'admin',
    status: 'active'
  });

  const customer = await User.create({
    name: 'Acme Retail (Customer)',
    email: 'customer@tracker.com',
    passwordHash: passwordHash,
    role: 'customer',
    status: 'active'
  });

  const agentA = await User.create({
    name: 'John Doe (Agent Zone A)',
    email: 'agent1@tracker.com',
    passwordHash: passwordHash,
    role: 'agent',
    status: 'active',
    availability: true,
    currentZone: 'Zone A',
    currentLocation: { lat: 28.6139, lng: 77.2090 } // Delhi/Zone A mock coordinates
  });

  const agentB = await User.create({
    name: 'Jane Smith (Agent Zone B)',
    email: 'agent2@tracker.com',
    passwordHash: passwordHash,
    role: 'agent',
    status: 'active',
    availability: true,
    currentZone: 'Zone B',
    currentLocation: { lat: 19.0760, lng: 72.8777 } // Mumbai/Zone B mock coordinates
  });

  console.log('📍 Seeding Zones...');
  const zoneA = await Zone.create({
    name: 'Zone A',
    pincodes: ['110001', '110002', '110003', '110004']
  });

  const zoneB = await Zone.create({
    name: 'Zone B',
    pincodes: ['400001', '400002', '400003', '400004']
  });

  const zoneC = await Zone.create({
    name: 'Zone C',
    pincodes: ['560001', '560002', '560003', '560004']
  });

  console.log('💳 Seeding Rate Cards...');
  const rateCards = [
    // --- Zone A -> Zone A ---
    { pickupZone: 'Zone A', dropZone: 'Zone A', customerType: 'B2C', paymentMethod: 'Prepaid', baseWeightLimit: 2, baseRate: 5.00, perKgIncrementalRate: 1.50, extraCharge: 0 },
    { pickupZone: 'Zone A', dropZone: 'Zone A', customerType: 'B2C', paymentMethod: 'COD', baseWeightLimit: 2, baseRate: 5.00, perKgIncrementalRate: 1.50, extraCharge: 2.00 },
    { pickupZone: 'Zone A', dropZone: 'Zone A', customerType: 'B2B', paymentMethod: 'Prepaid', baseWeightLimit: 5, baseRate: 4.00, perKgIncrementalRate: 1.00, extraCharge: 0 },
    { pickupZone: 'Zone A', dropZone: 'Zone A', customerType: 'B2B', paymentMethod: 'COD', baseWeightLimit: 5, baseRate: 4.00, perKgIncrementalRate: 1.00, extraCharge: 1.50 },

    // --- Zone B -> Zone B ---
    { pickupZone: 'Zone B', dropZone: 'Zone B', customerType: 'B2C', paymentMethod: 'Prepaid', baseWeightLimit: 2, baseRate: 6.00, perKgIncrementalRate: 1.50, extraCharge: 0 },
    { pickupZone: 'Zone B', dropZone: 'Zone B', customerType: 'B2C', paymentMethod: 'COD', baseWeightLimit: 2, baseRate: 6.00, perKgIncrementalRate: 1.50, extraCharge: 2.00 },
    { pickupZone: 'Zone B', dropZone: 'Zone B', customerType: 'B2B', paymentMethod: 'Prepaid', baseWeightLimit: 5, baseRate: 5.00, perKgIncrementalRate: 1.00, extraCharge: 0 },
    { pickupZone: 'Zone B', dropZone: 'Zone B', customerType: 'B2B', paymentMethod: 'COD', baseWeightLimit: 5, baseRate: 5.00, perKgIncrementalRate: 1.00, extraCharge: 1.50 },

    // --- Zone A -> Zone B ---
    { pickupZone: 'Zone A', dropZone: 'Zone B', customerType: 'B2C', paymentMethod: 'Prepaid', baseWeightLimit: 2, baseRate: 12.00, perKgIncrementalRate: 2.50, extraCharge: 0 },
    { pickupZone: 'Zone A', dropZone: 'Zone B', customerType: 'B2C', paymentMethod: 'COD', baseWeightLimit: 2, baseRate: 12.00, perKgIncrementalRate: 2.50, extraCharge: 3.00 },
    { pickupZone: 'Zone A', dropZone: 'Zone B', customerType: 'B2B', paymentMethod: 'Prepaid', baseWeightLimit: 5, baseRate: 10.00, perKgIncrementalRate: 2.00, extraCharge: 0 },
    { pickupZone: 'Zone A', dropZone: 'Zone B', customerType: 'B2B', paymentMethod: 'COD', baseWeightLimit: 5, baseRate: 10.00, perKgIncrementalRate: 2.00, extraCharge: 2.50 },

    // --- Zone B -> Zone A ---
    { pickupZone: 'Zone B', dropZone: 'Zone A', customerType: 'B2C', paymentMethod: 'Prepaid', baseWeightLimit: 2, baseRate: 12.00, perKgIncrementalRate: 2.50, extraCharge: 0 },
    { pickupZone: 'Zone B', dropZone: 'Zone A', customerType: 'B2C', paymentMethod: 'COD', baseWeightLimit: 2, baseRate: 12.00, perKgIncrementalRate: 2.50, extraCharge: 3.00 },
    { pickupZone: 'Zone B', dropZone: 'Zone A', customerType: 'B2B', paymentMethod: 'Prepaid', baseWeightLimit: 5, baseRate: 10.00, perKgIncrementalRate: 2.00, extraCharge: 0 },
    { pickupZone: 'Zone B', dropZone: 'Zone A', customerType: 'B2B', paymentMethod: 'COD', baseWeightLimit: 5, baseRate: 10.00, perKgIncrementalRate: 2.00, extraCharge: 2.50 }
  ];

  for (const card of rateCards) {
    await RateCard.create(card);
  }

  console.log('✅ Seeding completed successfully!');
  console.log('\nUse these credentials for testing:');
  console.log('----------------------------------------------------');
  console.log(`🔑 Admin:    email: admin@tracker.com   pwd: Password123`);
  console.log(`🔑 Customer: email: customer@tracker.com pwd: Password123`);
  console.log(`🔑 Agent A:  email: agent1@tracker.com   pwd: Password123`);
  console.log(`🔑 Agent B:  email: agent2@tracker.com   pwd: Password123`);
  console.log('----------------------------------------------------');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
