const express = require('express');
const router = express.Router();
const controller = require('../controllers/hospitalController');
const Hospital = require('../models/hospital');

router.get('/', controller.getAllHospitals);
router.get('/:hospitalId', controller.getHospitalById);
router.post('/update-blood', controller.updateBloodUnit);





module.exports = router;
