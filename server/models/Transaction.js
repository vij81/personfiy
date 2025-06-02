const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    category: String,
  amount: Number,
  type: String,
  date: { type: Date, default: Date.now },
  userId: String
});

module.exports = mongoose.model("Transaction", TransactionSchema);

