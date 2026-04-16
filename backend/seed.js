require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');

const services = [
  { name: 'Electrician', icon: '⚡', description: 'Electrical repairs and installations', basePrice: 200 },
  { name: 'Plumber', icon: '🔧', description: 'Plumbing repairs and installations', basePrice: 250 },
  { name: 'Carpenter', icon: '🪚', description: 'Furniture and woodwork repairs', basePrice: 300 },
  { name: 'Painter', icon: '🎨', description: 'Interior and exterior painting', basePrice: 400 },
  { name: 'Cleaner', icon: '🧹', description: 'Home and office cleaning', basePrice: 150 },
  { name: 'AC Technician', icon: '❄️', description: 'AC servicing and repair', basePrice: 350 },
  { name: 'Pest Control', icon: '🐛', description: 'Pest extermination services', basePrice: 500 },
  { name: 'Security', icon: '🔒', description: 'Lock and security systems', basePrice: 300 },
];

const seedDB = async () => {
  try {
    console.log('Connecting to Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Purana saaf karo
    await Service.deleteMany({});
    await User.deleteMany({ role: 'admin' });

    // Services dalo
    await Service.insertMany(services);
    console.log('✅ Services Added');

    // Admin dalo DIRECT password ke saath
    const admin = new User({
      name: 'Admin User',
      email: 'admin@quick.com',
      password: 'admin123', // Direct String
      phone: '9999999999',
      role: 'admin',
      isApproved: true,
      location: { type: 'Point', coordinates: [78.032, 30.326] },
      address: 'Muzaffarnagar, India'
    });

    await admin.save();
    console.log('✅ Admin Created Direct (No Hash)');
    
    console.log('\n🚀 Success! Try Login: admin@quick.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedDB();