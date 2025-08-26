// controllers/trip.controller.js
const Trip = require("../models/Trip");
const User = require("../models/User");

// -------------------- Start Trip --------------------
exports.startTrip = async (req, res) => {
  try {
    const { date_time, driver_id, lat, long } = req.body;

    if (!date_time || !driver_id || lat === undefined || long === undefined) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const trip = new Trip({
      date_time,
      driver_id,
      status: "open",
      locations: [{ lat, long, created_at: new Date() }]
    });

    await trip.save();

    // Set driver status online
 const updatedDriver = await User.findOneAndUpdate(
  { driver_id }, // search for driver_id
  { 
    status: "online", 
    lat: lat, 
    lng: long
  },
  { 
    new: true,   // return the updated or newly created document
    upsert: true // create a new document if it doesn't exist
  }
);

console.log("Driver updated or created:", updatedDriver);
    res.status(201).json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Close Trip --------------------
exports.closeTrip = async (req, res) => {
  try {
    const { driver_id, date } = req.body;

    if (!driver_id || !date) {
      return res.status(400).json({ success: false, message: "driver_id and date are required" });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const result = await Trip.updateMany(
      { driver_id, status: "open", date_time: { $gte: startOfDay, $lte: endOfDay } },
      { $set: { status: "closed" } }
    );

    if (!result || result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "No open trips found to close" });
    }

    // Set driver status offline
const updatedDriver = await User.findOneAndUpdate(
  { driver_id }, // search for driver_id
  { 
    status: "offline", 
   
  },
  { 
    new: true,   // return the updated or newly created document
    // upsert: true // create a new document if it doesn't exist
  }
);

console.log("Driver updated or created:", updatedDriver);
    res.json({ success: true, message: `Closed ${result.modifiedCount} trip(s)`, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Add Location --------------------
exports.addLocation = async (req, res) => {
  try {
    const { lat, long, created_at, driver_id } = req.body;

    if (!lat || !long || !created_at || !driver_id) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const createdAt = new Date(created_at);
    if (isNaN(createdAt)) {
      return res.status(400).json({ success: false, message: "Invalid created_at date" });
    }
  await User.findOneAndUpdate(
  { driver_id }, // search for driver_id
  { 
    status: "online", 
    lat: lat, 
    lng: long
  },
  { 
    new: true,   // return the updated or newly created document
    upsert: true // create a new document if it doesn't exist
  }
);
    const startOfDay = new Date(createdAt);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(createdAt);
    endOfDay.setHours(23, 59, 59, 999);

    const trip = await Trip.findOne({
      driver_id,
      status: "open",
      date_time: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date_time: -1 });

    if (!trip) {
      return res.status(404).json({ success: false, message: "No open trip found for this driver today" });
    }

    trip.locations.push({ lat, long, created_at: createdAt });
    await trip.save();

    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Get Trips By Date --------------------
exports.getTripsByDate = async (req, res) => {
  try {
    const { driver_id, date } = req.query;

    if (!driver_id || !date) {
      return res.status(400).json({ success: false, message: "driver_id and date are required" });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const trips = await Trip.find({
      driver_id,
      date_time: { $gte: startOfDay, $lte: endOfDay }
    }).populate("driver_id");

    res.json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

