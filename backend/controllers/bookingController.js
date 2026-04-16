const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc  Client raises a service request
// @route POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { serviceId, description, lat, lng, address, scheduledAt } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const booking = await Booking.create({
      client: req.user._id,
      service: serviceId,
      description,
      clientAddress: address || '',
      clientLocation: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      scheduledAt: scheduledAt || null,
      status: 'pending',
    });

    const populated = await Booking.findById(booking._id)
      .populate('client', 'name email phone')
      .populate('service', 'name icon');

    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').emit('new_booking', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get nearby providers for a service
// @route GET /api/bookings/nearby-providers?serviceId=&lat=&lng=&radius=
const getNearbyProviders = async (req, res) => {
  try {
    const { serviceId, lat, lng, radius = 10 } = req.query;
    const radiusInMeters = parseFloat(radius) * 1000;

    const providers = await User.find({
      role: 'provider',
      isApproved: true,
      isAvailable: true,
      isEngaged: false,
      isActive: true,
      services: serviceId,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    })
      .select('-password')
      .populate('services', 'name icon');

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Provider accepts a booking (Step 2 of handshake)
// @route PUT /api/bookings/:id/accept
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is no longer pending' });
    }

    const provider = await User.findById(req.user._id);
    if (provider.isEngaged) {
      return res.status(400).json({ message: 'You are already engaged with another job' });
    }

    booking.provider = req.user._id;
    booking.status = 'accepted';
    booking.visitCharges = provider.visitCharges;
    await booking.save();

    // Mark provider as engaged
    provider.isEngaged = true;
    await provider.save();

    const populated = await Booking.findById(booking._id)
      .populate('client', 'name email phone address')
      .populate('provider', 'name email phone visitCharges rating')
      .populate('service', 'name icon');

    if (req.app.get('io')) {
      req.app.get('io').to(booking.client.toString()).emit('booking_accepted', populated);
      req.app.get('io').emit('booking_updated', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Client confirms booking after seeing charges (Step 3 - Handshake Complete)
// @route PUT /api/bookings/:id/confirm
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Booking must be accepted first' });
    }
    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the client can confirm' });
    }

    booking.status = 'confirmed';
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('client', 'name email phone')
      .populate('provider', 'name email phone visitCharges rating')
      .populate('service', 'name icon');

    if (req.app.get('io')) {
      req.app.get('io').emit('booking_updated', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Provider rejects a booking
// @route PUT /api/bookings/:id/reject
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Can only reject pending bookings' });
    }

    booking.rejectedBy.push(req.user._id);
    booking.status = 'rejected';
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('client', 'name email phone')
      .populate('service', 'name icon');

    if (req.app.get('io')) {
      req.app.get('io').emit('booking_updated', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update job status (provider)
// @route PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const allowedTransitions = {
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed'],
    };

    if (!allowedTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from '${booking.status}' to '${status}'`,
      });
    }

    booking.status = status;
    if (status === 'in_progress') booking.startedAt = new Date();
    if (status === 'completed') {
      booking.completedAt = new Date();
      // Free up provider
      await User.findByIdAndUpdate(booking.provider, {
        isEngaged: false,
        $inc: { totalJobs: 1 },
      });
    }
    if (status === 'cancelled') {
      if (booking.provider) {
        await User.findByIdAndUpdate(booking.provider, { isEngaged: false });
      }
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('client', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'name icon');

    if (req.app.get('io')) {
      req.app.get('io').emit('booking_updated', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Client cancels a pending booking
// @route PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!['pending', 'accepted', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel at this stage' });
    }

    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only client can cancel' });
    }

    if (booking.provider) {
      await User.findByIdAndUpdate(booking.provider, { isEngaged: false });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get bookings for current user
// @route GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const query =
      req.user.role === 'client'
        ? { client: req.user._id }
        : { provider: req.user._id };

    const bookings = await Booking.find(query)
      .populate('client', 'name email phone')
      .populate('provider', 'name email phone visitCharges rating')
      .populate('service', 'name icon')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all pending bookings nearby (provider)
// @route GET /api/bookings/pending-nearby?lat=&lng=&radius=
const getPendingNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    const radiusInMeters = parseFloat(radius) * 1000;

    const provider = await User.findById(req.user._id).populate('services');
    const serviceIds = provider.services.map((s) => s._id);

    const bookings = await Booking.find({
      status: 'pending',
      service: { $in: serviceIds },
      clientLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    })
      .populate('client', 'name phone address')
      .populate('service', 'name icon')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single booking
// @route GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('provider', 'name email phone visitCharges rating')
      .populate('service', 'name icon basePrice');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Admin: get all bookings
// @route GET /api/bookings/admin/all
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('client', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'name icon')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getNearbyProviders,
  acceptBooking,
  confirmBooking,
  rejectBooking,
  updateBookingStatus,
  cancelBooking,
  getMyBookings,
  getPendingNearby,
  getBookingById,
  getAllBookings,
};