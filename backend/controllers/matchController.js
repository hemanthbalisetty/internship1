const Match = require('../models/Match');

exports.getMatches = async (req, res) => {
  const matches = await Match.find();
  res.json(matches);
};

exports.createMatch = async (req, res) => {
  const match = new Match(req.body);
  await match.save();
  res.status(201).json(match);
};