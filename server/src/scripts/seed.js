import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { ROLES } from '../constants/roles.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

const PLACEHOLDER_IMAGES = {
  wellness: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
  ],
  mountain: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  ],
  riverside: [
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
  ],
  tea: [
    'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  ],
  heritage: [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  ],
};

const properties = [
  {
    title: 'Ananda in the Himalayas',
    location: 'Rishikesh',
    state: 'Uttarakhand',
    category: 'Wellness Retreats',
    description:
      'A world-renowned wellness sanctuary nestled in the Himalayan foothills. Ayurvedic therapies, yoga pavilions, and organic cuisine overlooking the Ganges create a transformative retreat experience.',
    pricePerNight: 28000,
    amenities: ['Spa', 'Yoga Pavilion', 'Organic Dining', 'Meditation Garden', 'Pool'],
    images: PLACEHOLDER_IMAGES.wellness,
    featured: true,
    averageRating: 4.8,
    totalReviews: 2,
  },
  {
    title: 'Vana Retreat',
    location: 'Dehradun',
    state: 'Uttarakhand',
    category: 'Wellness Retreats',
    description:
      'A serene forest retreat offering Sowa Rigpa healing, mindful movement, and cuisine rooted in seasonal Indian ingredients amid sal forests.',
    pricePerNight: 32000,
    amenities: ['Wellness Programs', 'Forest Trails', 'Organic Kitchen', 'Library'],
    images: PLACEHOLDER_IMAGES.wellness,
    featured: true,
    averageRating: 4.6,
    totalReviews: 1,
  },
  {
    title: 'The Kumaon',
    location: 'Kasar Devi',
    state: 'Uttarakhand',
    category: 'Mountain Escapes',
    description:
      'Architecturally striking lodge with panoramic views of the Nanda Devi range. Minimalist design meets Kumaoni warmth in this off-grid mountain escape.',
    pricePerNight: 18500,
    amenities: ['Mountain Views', 'Guided Hikes', 'Local Cuisine', 'Fireplace'],
    images: PLACEHOLDER_IMAGES.mountain,
    featured: true,
    averageRating: 4.9,
    totalReviews: 1,
  },
  {
    title: 'Shakti 360° Leti',
    location: 'Bageshwar',
    state: 'Uttarakhand',
    category: 'Mountain Escapes',
    description:
      'Remote Himalayan lodge accessible only by foot, offering four luxury cottages with sweeping valley views and complete digital detox.',
    pricePerNight: 45000,
    amenities: ['Private Cottages', 'Guided Treks', 'Heated Floors', 'Stargazing'],
    images: PLACEHOLDER_IMAGES.mountain,
    featured: false,
    averageRating: 5,
    totalReviews: 1,
  },
  {
    title: 'Evolve Back Kabini',
    location: 'Kabini',
    state: 'Karnataka',
    category: 'Riverside Stays',
    description:
      'Lakeside resort on the banks of the Kabini, where wildlife safaris meet refined comfort. Watch elephants from your private pool villa.',
    pricePerNight: 22000,
    amenities: ['Safari', 'Pool Villa', 'Riverside Dining', 'Nature Walks'],
    images: PLACEHOLDER_IMAGES.riverside,
    featured: true,
    averageRating: 4.7,
    totalReviews: 0,
  },
  {
    title: 'Amanbagh',
    location: 'Alwar',
    state: 'Rajasthan',
    category: 'Riverside Stays',
    description:
      'A Mughal-inspired oasis in the Aravalli hills. Terraced gardens, marble pools, and curated cultural experiences in a restored noble estate.',
    pricePerNight: 55000,
    amenities: ['Marble Pool', 'Cultural Tours', 'Spa', 'Private Dining'],
    images: PLACEHOLDER_IMAGES.riverside,
    featured: false,
    averageRating: 0,
    totalReviews: 0,
  },
  {
    title: 'Wild Mahseer',
    location: 'Balipara',
    state: 'Assam',
    category: 'Tea Estate Experiences',
    description:
      'Stay in a colonial bungalow on a working tea estate. Experience tea tasting, river cruises, and the biodiversity of Northeast India.',
    pricePerNight: 14000,
    amenities: ['Tea Tasting', 'River Cruise', 'Colonial Bungalow', 'Bird Watching'],
    images: PLACEHOLDER_IMAGES.tea,
    featured: true,
    averageRating: 4.5,
    totalReviews: 0,
  },
  {
    title: 'Makaibari Tea Estate Homestay',
    location: 'Kurseong',
    state: 'West Bengal',
    category: 'Tea Estate Experiences',
    description:
      'Organic tea estate homestay in the Darjeeling hills. Walk through biodynamic gardens and learn artisanal tea production from local families.',
    pricePerNight: 8500,
    amenities: ['Tea Tours', 'Homestay', 'Organic Farm', 'Mountain Views'],
    images: PLACEHOLDER_IMAGES.tea,
    featured: false,
    averageRating: 0,
    totalReviews: 0,
  },
  {
    title: 'Neeleshwar Hermitage',
    location: 'Kasaragod',
    state: 'Kerala',
    category: 'Luxury Villas',
    description:
      'Beachfront Ayurvedic retreat in North Kerala. Private villas with plunge pools, traditional therapies, and untouched coastline.',
    pricePerNight: 24000,
    amenities: ['Ayurveda', 'Private Pool', 'Beach Access', 'Yoga'],
    images: PLACEHOLDER_IMAGES.villa,
    featured: true,
    averageRating: 4.8,
    totalReviews: 0,
  },
  {
    title: 'Alila Fort Bishangarh',
    location: 'Bishangarh',
    state: 'Rajasthan',
    category: 'Heritage Properties',
    description:
      'A 230-year-old warrior fort transformed into a luxury heritage hotel. Panoramic Aravalli views, Rajasthani cuisine, and curated cultural immersions.',
    pricePerNight: 38000,
    amenities: ['Heritage Fort', 'Rooftop Dining', 'Spa', 'Cultural Programs'],
    images: PLACEHOLDER_IMAGES.heritage,
    featured: true,
    averageRating: 4.9,
    totalReviews: 0,
  },
  {
    title: 'Taj Lake Palace',
    location: 'Udaipur',
    state: 'Rajasthan',
    category: 'Heritage Properties',
    description:
      'An ethereal white marble palace floating on Lake Pichola. Iconic Rajasthani hospitality in one of India\'s most romantic heritage settings.',
    pricePerNight: 65000,
    amenities: ['Lake Views', 'Boat Transfer', 'Royal Suites', 'Fine Dining'],
    images: PLACEHOLDER_IMAGES.heritage,
    featured: false,
    averageRating: 0,
    totalReviews: 0,
  },
  {
    title: 'Windamere Hotel',
    location: 'Darjeeling',
    state: 'West Bengal',
    category: 'Mountain Escapes',
    description:
      'Colonial-era heritage hotel from the Raj era. Afternoon tea, toy train views, and the charm of old-world Darjeeling hospitality.',
    pricePerNight: 12000,
    amenities: ['Heritage Rooms', 'Afternoon Tea', 'Mountain Views', 'Fireplace Lounge'],
    images: PLACEHOLDER_IMAGES.mountain,
    featured: false,
    averageRating: 0,
    totalReviews: 0,
  },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);

  console.log('Creating users...');
  const admin = await User.create({
    fullName: 'Nivana Admin',
    email: 'admin@nivana.com',
    password: 'admin123',
    role: ROLES.ADMIN,
  });

  const user1 = await User.create({
    fullName: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    role: ROLES.USER,
  });

  const user2 = await User.create({
    fullName: 'Arjun Mehta',
    email: 'arjun@example.com',
    password: 'password123',
    role: ROLES.USER,
  });

  console.log('Creating properties...');
  const propertiesWithOwners = properties.map(p => ({
    ...p,
    ownerId: admin._id,
  }));
  const createdProperties = await Property.insertMany(propertiesWithOwners);

  const [ananda, kumaon, shakti, vana] = createdProperties;

  user1.wishlist = [ananda._id, kumaon._id, createdProperties[8]._id];
  user2.wishlist = [shakti._id, createdProperties[9]._id];
  await user1.save();
  await user2.save();

  console.log('Creating bookings...');

  const makePastDates = (monthsAgo, nights) => {
    const checkIn = new Date();
    checkIn.setMonth(checkIn.getMonth() - monthsAgo);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    return { checkIn, checkOut, nights };
  };

  const user1Ananda = makePastDates(2, 3);
  const completedBooking = await Booking.create({
    userId: user1._id,
    propertyId: ananda._id,
    checkInDate: user1Ananda.checkIn,
    checkOutDate: user1Ananda.checkOut,
    totalPrice: ananda.pricePerNight * user1Ananda.nights,
    bookingStatus: BOOKING_STATUS.COMPLETED,
  });

  const user2Ananda = makePastDates(3, 2);
  await Booking.create({
    userId: user2._id,
    propertyId: ananda._id,
    checkInDate: user2Ananda.checkIn,
    checkOutDate: user2Ananda.checkOut,
    totalPrice: ananda.pricePerNight * user2Ananda.nights,
    bookingStatus: BOOKING_STATUS.COMPLETED,
  });

  const user2Kumaon = makePastDates(4, 3);
  await Booking.create({
    userId: user2._id,
    propertyId: kumaon._id,
    checkInDate: user2Kumaon.checkIn,
    checkOutDate: user2Kumaon.checkOut,
    totalPrice: kumaon.pricePerNight * user2Kumaon.nights,
    bookingStatus: BOOKING_STATUS.COMPLETED,
  });

  const user1Shakti = makePastDates(5, 2);
  await Booking.create({
    userId: user1._id,
    propertyId: shakti._id,
    checkInDate: user1Shakti.checkIn,
    checkOutDate: user1Shakti.checkOut,
    totalPrice: shakti.pricePerNight * user1Shakti.nights,
    bookingStatus: BOOKING_STATUS.COMPLETED,
  });

  const user2Vana = makePastDates(6, 3);
  await Booking.create({
    userId: user2._id,
    propertyId: vana._id,
    checkInDate: user2Vana.checkIn,
    checkOutDate: user2Vana.checkOut,
    totalPrice: vana.pricePerNight * user2Vana.nights,
    bookingStatus: BOOKING_STATUS.COMPLETED,
  });

  const futureCheckIn = new Date();
  futureCheckIn.setMonth(futureCheckIn.getMonth() + 1);
  const futureCheckOut = new Date(futureCheckIn);
  futureCheckOut.setDate(futureCheckOut.getDate() + 4);

  await Booking.create({
    userId: user1._id,
    propertyId: kumaon._id,
    checkInDate: futureCheckIn,
    checkOutDate: futureCheckOut,
    totalPrice: kumaon.pricePerNight * 4,
    bookingStatus: BOOKING_STATUS.PENDING,
  });

  await Booking.create({
    userId: user2._id,
    propertyId: shakti._id,
    checkInDate: futureCheckIn,
    checkOutDate: futureCheckOut,
    totalPrice: shakti.pricePerNight * 4,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
  });

  console.log('Creating reviews...');
  await Review.insertMany([
    {
      userId: user1._id,
      propertyId: ananda._id,
      rating: 5,
      comment:
        'Life-changing wellness experience. The Ayurvedic treatments and Ganges views were extraordinary.',
    },
    {
      userId: user2._id,
      propertyId: ananda._id,
      rating: 4,
      comment: 'Beautiful property with exceptional spa services. Worth every rupee.',
    },
    {
      userId: user2._id,
      propertyId: kumaon._id,
      rating: 5,
      comment: 'The architecture and mountain views are unmatched. A true hidden gem.',
    },
    {
      userId: user1._id,
      propertyId: shakti._id,
      rating: 5,
      comment: 'Remote, raw, and absolutely magical. The trek in is part of the adventure.',
    },
    {
      userId: user2._id,
      propertyId: vana._id,
      rating: 4,
      comment: 'Incredible forest setting and thoughtful wellness programming.',
    },
  ]);

  console.log('\nSeed completed successfully!\n');
  console.log('--- Demo Accounts ---');
  console.log('Admin:  admin@nivana.com / admin123');
  console.log('User 1: priya@example.com / password123');
  console.log('User 2: arjun@example.com / password123');
  console.log(`\nProperties: ${createdProperties.length}`);
  console.log(`Completed booking ID (for review testing): ${completedBooking._id}`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
