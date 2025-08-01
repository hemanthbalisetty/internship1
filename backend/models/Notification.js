const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  text: String,
  isRead: { type: Boolean, default: false },
  urgent: Boolean,
  success: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);