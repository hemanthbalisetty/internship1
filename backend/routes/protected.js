const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', authMiddleware, (req, res) => {
  res.status(200).json({ message: `Hello ${req.org.orgId}, welcome to your dashboard!` });
});

module.exports = router;