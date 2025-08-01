const mongoose = require('mongoose');

const bloodUnitSchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  quantity: { type: Number, required: true, default: 0 },
  status: { type: String, default: 'Stable' }
});

const hospitalSchema = new mongoose.Schema({
  hospitalId: { type: String, unique: true, required: true }, 
  name: { type: String, required: true },
  location: String,
  contact: String,
  email: String,
  password: String,
  bloodInventory: [bloodUnitSchema]
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);