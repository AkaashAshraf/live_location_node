// controllers/trip.controller.js
const Trip = require("../models/Trip");
const User = require("../models/User");


// Start a new trip
exports.startTrip = async (req, res) => {
  try {
    const { date_time, driver_id, lat, long } = req.body;

    const trip = new Trip({
      date_time,
      driver_id,
      locations: [{ lat, long, created_at:date_time }]
    });

    await trip.save();
    await User.findByIdAndUpdate(date_time, { status: "online" });

    res.status(201).json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Close all trips for a driver on a specific date
exports.closeTrip = async (req, res) => {
  try {
    const { driver_id, date } = req.body;

    if (!driver_id || !date) {
      return res.status(400).json({ success: false, message: "driver_id and date are required" });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Update all open trips
    const result = await Trip.updateMany(
      {
        driverID: driver_id,
        status: "open",
        dateTime: { $gte: startOfDay, $lte: endOfDay }
      },
      { $set: { status: "closed" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "No open trips found to close" });
    }
    await User.findByIdAndUpdate(driver_id, { status: "offline" });

    res.json({ success: true, message: "Trips closed successfully", result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Add location to ongoing trip
exports.addLocation = async (req, res) => {
  try {
    const { lat, long, created_at, driver_id } = req.body;

    // Find today's last open trip for this driver
    const startOfDay = new Date(created_at);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(created_at);
    endOfDay.setHours(23, 59, 59, 999);

    const trip = await Trip.findOne({
      driverID: driver_id,
      status: "open",
      dateTime: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ dateTime: -1 });

    if (!trip) {
      return res.status(404).json({ success: false, message: "No open trip found for this driver on the given date" });
    }

    trip.locations.push({ lat, long, created_at });
    await trip.save();

    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get trips for driver on selected date
exports.getTripsByDate = async (req, res) => {
  try {
    const { driver_id, date } = req.query;

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const trips = await Trip.find({
      driverID: driver_id,
      dateTime: { $gte: startOfDay, $lte: endOfDay }
    }).populate("driverID");

    res.json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
