const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  bloodType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending'
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  }
}, { timestamps: true }); // ✅ Enable auto createdAt and updatedAt

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);