const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paid: { type: Boolean, default: false },
});

module.exports = mongoose.model("Bill", billSchema);
