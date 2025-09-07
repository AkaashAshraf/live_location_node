// models/Trip.js
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
  created_at: { type: Date, required: true },
  order_no: { type: String, required: false },
  type: { type: String, required: false }
});

const tripSchema = new mongoose.Schema({
  date_time: { type: Date, required: true },
  status: { type: String, default: "open", enum: ["open", "closed"] },
  driver_id: { type: String, required: true },
  branch_id: { type: String, required: true },
branch_name: { type: String, required: true },

  locations: [locationSchema]
});

module.exports = mongoose.model("Trip", tripSchema);
