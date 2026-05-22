const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null }, // YYYY-MM-DD
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
