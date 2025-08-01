const express = require("express");
const router = express.Router();
const {
  registerRecipient,
  getAllRecipients
} = require("../controllers/recipientController");

// POST /api/recipients — Register a new recipient
router.post("/", registerRecipient);

// GET /api/recipients — Get all recipients
router.get("/", getAllRecipients);

module.exports = router;