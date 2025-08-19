const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['ongoing', 'completed', 'cancelled'], default: 'ongoing' },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
