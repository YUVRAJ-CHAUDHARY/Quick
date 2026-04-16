const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register user (No Hashing)
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, services, visitCharges, address, lat, lng } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const userData = {
      name,
      email,
      password, // Password direct save ho raha hai
      phone,
      role: role || 'client',
      address: address || '',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0],
      },
    };

    if (role === 'provider') {
      userData.services = services || [];
      userData.visitCharges = visitCharges || 0;
      userData.isApproved = false; // Admin approval needed
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user (Direct Match)
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('services');
    
    // Yahan matchPassword ab User model mein simple (===) check karega
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      isAvailable: user.isAvailable,
      isEngaged: user.isEngaged,
      services: user.services,
      visitCharges: user.visitCharges,
      location: user.location,
      address: user.address,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('services');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, lat, lng, visitCharges, isAvailable } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (visitCharges !== undefined) user.visitCharges = visitCharges;
    if (isAvailable !== undefined) user.isAvailable = isAvailable;
    
    if (lat && lng) {
      user.location = { 
        type: 'Point', 
        coordinates: [parseFloat(lng), parseFloat(lat)] 
      };
    }

    await user.save();
    
    const updated = await User.findById(user._id)
      .select('-password')
      .populate('services');
      
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };