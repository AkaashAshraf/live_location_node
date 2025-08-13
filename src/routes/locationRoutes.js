const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Existing routes
router.get("/users/all", locationController.getAllUsers);
router.get("/users/status", locationController.getUsersWithStatus); // ✅ NEW GET route
router.get("/:userId/:date", locationController.getTripsByDate);
router.post("/", locationController.addLocation);

// New route for status + location update
router.post("/update-status", locationController.updateUserStatus);

module.exports = router;
