const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  driver_id: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
