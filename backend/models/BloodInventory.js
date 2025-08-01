const mongoose = require('mongoose');

const BloodInventorySchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,  // e.g., "HOS001"
    ref: 'Hospital'  // reference to hospital
  },
  bloodGroup: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: 'Stable' }
}, { timestamps: true });

BloodInventorySchema.index({ hospitalId: 1, bloodGroup: 1 }, { unique: true });

module.exports = mongoose.model('BloodInventory', BloodInventorySchema);
