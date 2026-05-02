const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Donation = require('./models/Donation');
const FoodRequest = require('./models/FoodRequest');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/annapurna');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Donation.deleteMany({});
    await FoodRequest.deleteMany({});

    // Create Users
    const users = await User.create([
      {
        name: 'System Administrator',
        email: 'admin@annapurna.com',
        password: 'password123',
        role: 'admin',
        phone: '+91 99999 99999',
        address: 'HQ, Mumbai',
        bio: 'Core system administrator for the Annapurna platform.',
        totalDonations: 0,
        rating: 5.0,
      },
      {
        name: 'Dr. Sarah Mitchell',
        email: 'sarah@donor.com',
        password: 'password123',
        role: 'donor',
        phone: '+91 98765 43210',
        address: '123 Skyview Apartments, Mumbai',
        organizationName: 'Mitchell Health Foundaton',
        bio: 'Philanthropist and health advocate. Dedicated to zero-waste food systems in metropolitan hubs.',
        totalDonations: 142,
        rating: 4.9,
      },
      {
        name: 'Alex Rivera',
        email: 'alex@volunteer.com',
        password: 'password123',
        role: 'volunteer',
        phone: '+91 87654 32109',
        address: 'Bandra West, Mumbai',
        bio: 'Spatial logistics expert. Delivering hope one meal at a time. Active member of the 2026 Resilience Corps.',
        totalDeliveries: 89,
        rating: 4.8,
      },
      {
        name: 'Hope Children Home',
        email: 'hope@orphanage.com',
        password: 'password123',
        role: 'orphanage',
        phone: '+91 76543 21098',
        address: '45 Sunshine Lane, Mumbai',
        organizationName: 'Hope Global Network',
        bio: 'Providing sanctuary for 150+ children. Integrated with Annapurna for sustainable nutrition planning.',
        totalDonations: 0,
        rating: 5.0,
      }
    ]);

    console.log('Users seeded.');

    const admin = users[0];
    const donor = users[1];
    const volunteer = users[2];
    const orphanage = users[3];

    // Create Donations
    await Donation.create([
      {
        donor: donor._id,
        title: 'Nutrient-Dense Biryani Platters',
        description: '50 units of fresh, high-protein vegetable biryani. Prepared in a certified commercial kitchen.',
        foodType: 'cooked',
        quantity: '15kg',
        servings: 50,
        expiryTime: new Date(Date.now() + 3600000 * 6), // 6 hours from now
        pickupAddress: donor.address,
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        status: 'available',
        isUrgent: true,
        dietaryInfo: 'Vegetarian, Nut-free',
        images: ['https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=500'],
      },
      {
        donor: donor._id,
        title: 'Organic Produce Crate',
        description: 'Seasonal vegetables including broccoli, carrots, and spinach. Sourced from urban rooftop farms.',
        foodType: 'raw',
        quantity: '10kg',
        servings: 20,
        expiryTime: new Date(Date.now() + 3600000 * 48), // 48 hours
        pickupAddress: donor.address,
        location: { type: 'Point', coordinates: [72.8333, 18.9222] },
        status: 'accepted',
        volunteer: volunteer._id,
        acceptedAt: new Date(),
        dietaryInfo: 'Organic, Non-GMO',
        images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=500'],
      },
      {
        donor: donor._id,
        volunteer: volunteer._id,
        title: 'Fresh Bread & Pastries',
        description: 'Assorted baked goods from the morning batch. 50+ items.',
        foodType: 'cooked',
        quantity: '5kg',
        servings: 30,
        expiryTime: new Date(Date.now() - 3600000), // Past
        pickupAddress: donor.address,
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        status: 'delivered',
        deliveredAt: new Date(),
        dietaryInfo: 'Contains Gluten',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500'],
      }
    ]);

    // Create Requests
    await FoodRequest.create([
      {
        requester: orphanage._id,
        title: 'Daily Lunch Requirement',
        description: 'Seeking stable meal provision for 150 children. High protein and vitamins preferred.',
        foodType: 'cooked',
        quantity: 'Large Batch',
        servingsNeeded: 150,
        requiredBy: new Date(Date.now() + 3600000 * 24),
        deliveryAddress: orphanage.address,
        location: { type: 'Point', coordinates: [72.8500, 19.1000] },
        urgencyLevel: 'high',
        beneficiaryCount: 150,
        status: 'open',
      }
    ]);

    console.log('Donations and Requests seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
