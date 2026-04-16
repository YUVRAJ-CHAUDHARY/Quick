const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getAllUsers, 
  approveProvider, 
  toggleUserStatus 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Saare admin routes ko protect aur authorize karo
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/approve/:id', approveProvider);
router.put('/toggle/:id', toggleUserStatus);

module.exports = router;