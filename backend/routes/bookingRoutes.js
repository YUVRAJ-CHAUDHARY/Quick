const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby-providers', protect, authorize('client'), getNearbyProviders);
router.get('/my', protect, getMyBookings);
router.get('/pending-nearby', protect, authorize('provider'), getPendingNearby);
router.get('/admin/all', protect, authorize('admin'), getAllBookings);
router.get('/:id', protect, getBookingById);

router.post('/', protect, authorize('client'), createBooking);
router.put('/:id/accept', protect, authorize('provider'), acceptBooking);
router.put('/:id/confirm', protect, authorize('client'), confirmBooking);
router.put('/:id/reject', protect, authorize('provider'), rejectBooking);
router.put('/:id/status', protect, authorize('provider'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('client'), cancelBooking);

module.exports = router;