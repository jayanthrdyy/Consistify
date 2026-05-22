const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Study', 'Fitness', 'Work', 'Personal'], default: 'Personal' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  goalHours: { type: Number, default: 1, min: 0.5, max: 24 },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  completedDates: [{ type: Date }],
  history: [{
    date: { type: String }, // YYYY-MM-DD
    completed: { type: Boolean, default: false }
  }]
});

module.exports = mongoose.model('Task', taskSchema);
