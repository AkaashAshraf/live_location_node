const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
