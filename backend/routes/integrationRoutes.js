
const express = require('express');
const router = express.Router();
const controller = require('../controllers/integrationController');

router.get('/', controller.getSystems);
router.post('/create', controller.createSystem);
router.post('/sync/:hospitalId', controller.syncSystem);
router.post('/retry/:hospitalId', controller.retrySystem);
router.get('/logs/:hospitalId', controller.getHospitalLogs);
router.get('/logs', controller.getLogs);



module.exports = router;
