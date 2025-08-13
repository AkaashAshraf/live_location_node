const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  userId: { type: String, unique: true },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  lat: Number,
  long: Number,
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
