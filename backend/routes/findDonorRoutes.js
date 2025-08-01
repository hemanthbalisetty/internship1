const express = require("express");
const router = express.Router();
const Donor = require("../models/donorModel");
const fetch = require("node-fetch");

// Get lat/lng from city name using Nominatim
const getCoordsFromCity = async (cityName) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityName)}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
};

// Haversine formula for distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// GET /api/find-donors?city=Indore&organ=Pancreas&bloodType=A-
router.get("/", async (req, res) => {
  const { city, organ, bloodType } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const userCoords = await getCoordsFromCity(city);
    if (!userCoords) {
      return res.status(400).json({ error: "Invalid city name" });
    }

    // Build query based on optional organ and bloodType
    const query = {};
    if (organ) query.organType = organ;
    if (bloodType) query.bloodType = bloodType;

    const donors = await Donor.find(query);

    const filteredDonors = [];

    for (const donor of donors) {
      if (!donor.location) continue;

      const donorCoords = await getCoordsFromCity(donor.location);
      if (!donorCoords) continue;

      const distance = getDistance(
        userCoords.lat,
        userCoords.lng,
        donorCoords.lat,
        donorCoords.lng
      );

      if (distance <= 300) {
        filteredDonors.push({
          ...donor.toObject(),
          distance: Number(distance.toFixed(2)),
          lat: donorCoords.lat,
          lng: donorCoords.lng,
        });
      }
    }

    console.log(`Donors found: ${filteredDonors.length}`);
    return res.json(filteredDonors);
  } catch (err) {
    console.error("Error in /api/find-donors:", err);
    return res.status(500).json({ error: "Server error while finding donors" });
  }
});

module.exports = router;