
const IntegrationSystem = require('../models/IntegrationSystems');
const log = require('../utils/logger');

// Get all systems
exports.getSystems = async (req, res) => {
  try {
    const systems = await IntegrationSystem.find();
    res.json(systems);
  } catch (err) {
    log(`ERROR: Fetching systems failed - ${err.message}`);
    res.status(500).json({ error: 'Error fetching systems' });
  }
};

// Create a new system
exports.createSystem = async (req, res) => {
  try {
    const system = new IntegrationSystem(req.body);
    await system.save();
    log(`System created: ${system.name}`);
    res.status(201).json(system);
  } catch (err) {
    log(`ERROR: Creating system failed - ${err.message}`);
    res.status(500).json({ error: 'Error creating system' });
  }
};

const Hospital = require('../models/hospital');

exports.syncSystem = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findOne({ hospitalId });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    hospital.lastSync = new Date();
    await hospital.save();

    log(`System synced: ${hospital.name}`);
    res.json({ lastSync: hospital.lastSync });
  } catch (err) {
    log(`ERROR: Syncing failed - ${err.message}`);
    res.status(500).json({ error: 'Error syncing hospital system' });
  }
};

exports.retrySystem = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findOne({ hospitalId });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    hospital.lastSync = new Date();
    await hospital.save();

    log(`System retry success: ${hospital.name}`);
    res.json({ lastSync: hospital.lastSync });
  } catch (err) {
    log(`ERROR: Retry failed - ${err.message}`);
    res.status(500).json({ error: 'Retry failed' });
  }
};

// Export logs
exports.getLogs = async (req, res) => {
  try {
    const systems = await IntegrationSystem.find();
    const allLogs = systems.map(sys => `${sys.name}:\n${sys.logs.join('\n')}\n`).join('\n');

    res.type('text').send(allLogs); // safer way to set plain text response
  } catch (err) {
    log(`ERROR: Fetching logs failed - ${err.message}`);
    res.status(500).json({ error: 'Error fetching logs' });
  }
};
// Get sync logs for a specific hospital
exports.getHospitalLogs = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findOne({ hospitalId });

    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    res.json({ logs: hospital.logs || [] });
  } catch (err) {
    log(`ERROR: Fetching logs failed - ${err.message}`);
    res.status(500).json({ error: 'Error fetching hospital logs' });
  }
};