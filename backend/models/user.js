const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 }, // Ab hashed nahi, plain save hoga
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ['client', 'provider', 'admin'],
      default: 'client',
    },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    isApproved: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    isEngaged: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    visitCharges: { type: Number, default: 0 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    address: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

// --- PASSWORD HASHING HATA DIYA ---

// Compare password (Ab direct string match hoga)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password; 
};

module.exports = mongoose.model('User', userSchema);