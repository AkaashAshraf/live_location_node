// models/Trip.js
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
  created_at: { type: Date, required: true }
});

const tripSchema = new mongoose.Schema({
  date_time: { type: Date, required: true },
  status: { type: String, default: "open", enum: ["open", "closed"] },
  driver_id: { type: String, required: true },
  locations: [locationSchema]
});

module.exports = mongoose.model("Trip", tripSchema);
