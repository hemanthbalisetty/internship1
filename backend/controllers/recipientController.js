const Recipient = require("../models/recipientModel");

const registerRecipient = async (req, res) => {
  try {
    const recipient = new Recipient(req.body);
    await recipient.save();

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('newRecipientRegistered', recipient);
    }

    res.status(201).json({ message: "Recipient registered successfully" });
  } catch (error) {
    console.error("Recipient registration error:", error);
    res.status(500).json({ message: "Recipient registration failed", error });
  }
};

const getAllRecipients = async (req, res) => {
  try {
    const recipients = await Recipient.find();
    res.status(200).json(recipients);
  } catch (error) {
    console.error("Fetching recipients failed:", error);
    res.status(500).json({ message: "Failed to fetch recipients", error });
  }
};

module.exports = {
  registerRecipient,
  getAllRecipients
};