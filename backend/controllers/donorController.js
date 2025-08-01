const Donor = require("../models/donorModel");

const registerDonor = async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).json({ message: "Donor registered successfully" });
  } catch (error) {
    console.error("Donor registration error:", error);
    res.status(500).json({ message: "Donor registration failed", error });
  }
};

module.exports = { registerDonor };