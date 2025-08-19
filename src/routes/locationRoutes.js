const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/users', locationController.getUsers);
router.get('/trip/:userId/:date', locationController.getTripByUserAndDate);
router.post('/update', locationController.updateLocation);
router.get('/status', locationController.getUserLiveStatus);

module.exports = router;
