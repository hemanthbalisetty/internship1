const mongoose = require('mongoose');

const integrationSystemSchema = new mongoose.Schema({
  name: String,
  status: { type: String, enum: ['Synced', 'Pending', 'Error'], default: 'Pending' },
  color: String,
  lastSync: String,
  logs: [String],
});

module.exports = mongoose.model('IntegrationSystem', integrationSystemSchema);
