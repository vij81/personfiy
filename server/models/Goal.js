const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  targetAmount: Number,
  currentAmount: { type: Number, default: 0 },
  achieved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
