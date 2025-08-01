const Organ = require('../models/Organ');

exports.getOrgansByRole = async (req, res) => {
  const { role } = req.params;
  const organs = await Organ.find({ role });
  res.json(organs);
};