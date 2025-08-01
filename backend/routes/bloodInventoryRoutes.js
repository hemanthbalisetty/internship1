const express = require('express');
const router = express.Router();

const {
  getAllInventories,
  searchByBloodGroup,
  addOrUpdateUnit,
  updateUnitsByHospitalId,
  getInventoryByHospital
} = require('../controllers/bloodInventoryController');


// GET all hospitals' blood inventories
router.get('/', getAllInventories);

// GET to search inventory by blood type across all hospitals (e.g., A+)
router.get('/type/:type', searchByBloodGroup);

// PUT to update blood inventory units for a hospital
router.put('/update-units/:hospitalId', updateUnitsByHospitalId);

// POST to add or update blood units for a hospital
router.post('/', addOrUpdateUnit);

// GET inventory for a specific hospital by hospitalId (e.g., HOS003)
router.get('/:hospitalId', getInventoryByHospital);

// Fallback route for all unmatched requests
router.all('*', (req, res) => {
  res.status(200).json({
    message: `🧪 Caught in fallback: ${req.method} ${req.originalUrl}`
  });
});

module.exports = router;