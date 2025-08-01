const express = require('express');
const router = express.Router();
const Inventory = require('../models/BloodInventory');

// POST /api/inventory/update
router.post('/update', async (req, res) => {
  const { orgId, bloodGroup, quantity } = req.body;

  try {
    let existing = await Inventory.findOne({ orgId, bloodGroup });

    if (existing) {
      existing.quantity = quantity;
      existing.lastUpdated = Date.now();
      await existing.save();
    } else {
      const newRecord = new Inventory({ orgId, bloodGroup, quantity });
      await newRecord.save();
    }

    res.status(200).json({ message: 'Inventory updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating inventory', error: err.message });
  }
});

// GET /api/inventory/:orgId
// router.get('/:orgId', async (req, res) => {
//   const { orgId } = req.params;

//   try {
//     const data = await Inventory.find({ orgId });
//     res.status(200).json({ inventory: data });
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching inventory' });
//   }
// });

module.exports = router;