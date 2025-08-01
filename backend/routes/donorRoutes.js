const express = require("express");
const router = express.Router();
const { registerDonor } = require("../controllers/donorController");

router.post("/", registerDonor);

module.exports = router;