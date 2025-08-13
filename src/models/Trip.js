const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  lat: Number,
  long: Number,
  timestamp: Date
});

const tripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  started_at: { type: Date, default:null },
  ended_at: { type: Date, default: null },
  locations: [locationSchema]
});

// Create a compound index on userId and date
tripSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Trip", tripSchema);
