const express = require('express');
const router = express.Router();
const { getOrgansByRole } = require('../controllers/organController');

router.get('/:role', getOrgansByRole); // role: 'donor' or 'recipient'

module.exports = router;