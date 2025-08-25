// routes/trip.routes.js
const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// Start a trip
router.post("/start", tripController.startTrip);

// Add location
router.post("/add-location", tripController.addLocation);

// Get trips by date + driver
router.get("/", tripController.getTripsByDate);
// Close trip
router.post("/close", tripController.closeTrip);
router.get("/get-users", tripController.getUsers);


module.exports = router;
