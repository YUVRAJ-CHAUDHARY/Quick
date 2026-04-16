const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all users (except admins)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .populate('services', 'name icon');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a provider
// @route   PUT /api/admin/approve/:id
const approveProvider = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found or not a provider role' });
    }
    user.isApproved = true;
    await user.save();
    res.json({ message: 'Provider approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/toggle/:id
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const pendingApprovals = await User.countDocuments({ role: 'provider', isApproved: false });

    // Booking counts (Safety check in case Booking model is empty or has issues)
    let totalBookings = 0;
    let completedBookings = 0;
    let activeBookings = 0;

    if (Booking) {
      totalBookings = await Booking.countDocuments();
      completedBookings = await Booking.countDocuments({ status: 'completed' });
      activeBookings = await Booking.countDocuments({
        status: { $in: ['pending', 'accepted', 'confirmed', 'in_progress'] },
      });
    }

    // Response object
    res.json({
      totalUsers,
      totalProviders,
      pendingApprovals,
      totalBookings,
      completedBookings,
      activeBookings,
      success: true // Frontend check ke liye easy rahega
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getAllUsers, 
  approveProvider, 
  toggleUserStatus, 
  getStats // Is naam ko routes/adminRoutes.js mein dhyan se use karna
};