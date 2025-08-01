const BloodRequest = require('../models/BloodRequest');

// Create request
exports.createRequest = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    const { bloodType, quantity, urgency, location, status, from, to } = req.body;

    const request = new BloodRequest({
      bloodType,
      quantity,
      urgency,
      location,
      status,
      from,
      to
    });

    await request.save();

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('newBloodRequest', request);
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await BloodRequest.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Request not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a request
exports.deleteRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await BloodRequest.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Request not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

