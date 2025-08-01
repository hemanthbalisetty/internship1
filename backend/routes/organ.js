const express = require('express');
const router = express.Router();

// Sample route
router.get('/', (req, res) => {
  res.json({ message: 'Organ donation endpoint working' });
});

module.exports = router;
