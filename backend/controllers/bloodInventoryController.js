const BloodInventory = require('../models/BloodInventory');
const Hospital = require('../models/hospital');

// Get all inventories
exports.getAllInventories = async (req, res) => {
  try {
    const all = await BloodInventory.find();
    res.status(200).json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInventoryByHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ hospitalId: req.params.hospitalId });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({ bloodInventory: hospital.bloodInventory || [] });
  } catch (error) {
    console.error('Error fetching inventory from hospital:', error);
    res.status(500).json({ error: 'Server error while fetching inventory' });
  }
};

exports.addOrUpdateUnit = async (req, res) => {
  const { hospitalId, bloodGroup, quantity, status } = req.body;

  try {
    const existing = await BloodInventory.findOne({ hospitalId, bloodGroup });

    if (existing) {
      existing.quantity = quantity;
      existing.status = status;
      await existing.save();
      return res.status(200).json({ message: 'Updated successfully' });
    }

    const newEntry = new BloodInventory({ hospitalId, bloodGroup, quantity, status });
    await newEntry.save();
    res.status(201).json({ message: 'Created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Search by blood group
exports.searchByBloodGroup = async (req, res) => {
  try {
    const data = await BloodInventory.find({ bloodGroup: req.params.bloodGroup });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUnitsByHospitalId = async (req, res) => {
  const hospitalId = req.params.hospitalId;
  const updatedUnits = req.body.updatedUnits;

  if (!hospitalId || !updatedUnits || typeof updatedUnits !== 'object') {
    return res.status(400).json({ message: 'Invalid request payload' });
  }

  try {
    const types = Object.keys(updatedUnits);
    const updates = [];

    for (const bloodType of types) {
      const quantity = Number(updatedUnits[bloodType]);
      const status = quantity > 10 ? 'Stable' : quantity > 0 ? 'Low' : 'Needed';

      if (!bloodType || isNaN(quantity)) {
        console.warn('Skipping invalid blood type or quantity:', bloodType, quantity);
        continue;
      }

      const existing = await BloodInventory.findOne({ hospitalId, bloodGroup: bloodType });

      if (existing) {
        existing.quantity = quantity;
        existing.status = status;
        updates.push(existing.save());
      } else {
        const newEntry = new BloodInventory({ hospitalId, bloodGroup: bloodType, quantity, status });
        updates.push(newEntry.save());
      }
    }

    const results = await Promise.all(updates);
    console.log(`Updated inventory for hospital ${hospitalId}:`, results);

    const hospital = await Hospital.findOne({ hospitalId });
    if (!hospital) {
      console.error("Hospital not found");
      return res.status(404).json({ message: "Hospital not found" });
    }

    types.forEach(bloodType => {
      const quantity = Number(updatedUnits[bloodType]);
      const status = quantity > 10 ? 'Stable' : quantity > 0 ? 'Low' : 'Needed';

      const existingUnit = hospital.bloodInventory.find(unit => unit.type === bloodType);
      if (existingUnit) {
        existingUnit.quantity = quantity;
        existingUnit.status = status;
      } else {
        hospital.bloodInventory.push({ type: bloodType, quantity, status });
      }
    });

    await hospital.save();

    res.status(200).json({ message: 'Inventory updated successfully', updated: results });
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: 'Server error while updating inventory' });
  }
};

exports.getInventoryByHospital = getInventoryByHospital;
exports.updateUnitsByHospitalId = updateUnitsByHospitalId;