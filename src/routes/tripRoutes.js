const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const userController = require("../controllers/userController"); // import userController

// Start a trip
router.post("/start", tripController.startTrip);

// Add location
router.post("/add-location", tripController.addLocation);

// Get trips by date + driver
router.get("/", tripController.getTripsByDate);

// Close trip
router.post("/close", tripController.closeTrip);

// Get users
router.get("/get-users", tripController.getTripsByDate); // ✅ use userController here

module.exports = router;
