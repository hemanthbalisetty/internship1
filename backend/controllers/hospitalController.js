const Hospital = require('../models/hospital');

// Get all hospitals with blood inventory
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get hospital by ID
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ hospitalId: req.params.hospitalId });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update or add blood unit
exports.updateBloodUnit = async (req, res) => {
  const { hospitalId, type, quantity, status } = req.body;

  try {
    const hospital = await Hospital.findOne({ hospitalId });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const unit = hospital.bloodInventory.find(b => b.type === type);
    if (unit) {
      unit.quantity = quantity;
      unit.status = status || unit.status;
    } else {
      hospital.bloodInventory.push({ type, quantity, status });
    }

    await hospital.save();
    res.json({ message: 'Blood unit updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Batch update blood inventory units
exports.updateBloodInventoryUnits = async (req, res) => {
  const { updatedUnits } = req.body;
  const { hospitalId } = req.params;

  try {
    const hospital = await Hospital.findOne({ hospitalId });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    console.log("Incoming updatedUnits:", updatedUnits);
    for (const [type, quantity] of Object.entries(updatedUnits)) {
      const parsedQty = typeof quantity === 'string' ? parseInt(quantity) : quantity;
      const existing = hospital.bloodInventory.find(b => b.type === type);
      if (existing) {
        existing.quantity = parsedQty;
        existing.status = parsedQty > 10 ? 'Stable' : parsedQty > 0 ? 'Low' : 'Needed';
      } else {
        hospital.bloodInventory.push({
          type,
          quantity: parsedQty,
          status: parsedQty > 10 ? 'Stable' : parsedQty > 0 ? 'Low' : 'Needed'
        });
      }
    }

    hospital.markModified('bloodInventory');
    console.log("Final bloodInventory to be saved:", hospital.bloodInventory);

    await hospital.save();
    res.json({ message: 'Blood inventory updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};