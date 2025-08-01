const express = require('express');
const router = express.Router();
const Blood = require('../models/Blood');
const MatchRequest = require('../models/MatchRequest');

// POST: Search donors based on blood group and location
router.post('/search', async (req, res) => {
  const { bloodGroup, location } = req.body;

  try {
    const compatibleDonors = await Blood.find({
      bloodGroup,
      location,
      donorOrRecipient: 'donor'
    });

    res.json({ matches: compatibleDonors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Matching error' });
  }
});

// POST: Create a match request
router.post('/request', async (req, res) => {
  const { donorId, recipientId } = req.body;

  try {
    const match = new MatchRequest({ donorId, recipientId });
    await match.save();
    res.json({ message: 'Match request created', match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating match request' });
  }
});

// GET: Get all match requests
router.get('/all', async (req, res) => {
  try {
    const matches = await MatchRequest.find()
      .populate('donorId')
      .populate('recipientId');
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching matches' });
  }
});

module.exports = router;