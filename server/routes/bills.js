const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const authMiddleware = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

// Get all bills
router.get("/", authMiddleware, async (req, res) => {
  const bills = await Bill.find({ userId: req.user.id });
  res.json(bills);
});

// Add a bill
router.post("/", authMiddleware, async (req, res) => {
  const { title, amount, dueDate } = req.body;
  const bill = new Bill({ title, amount, dueDate, userId: req.user.id });
  await bill.save();
  res.json(bill);
});

// Delete a bill
router.delete("/:id", authMiddleware, async (req, res) => {
  await Bill.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Mark bill as paid
router.patch("/:id/mark-paid", authMiddleware, async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  bill.paid = true;
  await bill.save();
  res.json(bill);
});
router.get("/test-email", async (req, res) => {
  try {
    await sendEmail("vijetaverma81@gmail.com", "Test Email", "<p>This is a test email</p>");
    res.send("Email sent");
  } catch (err) {
    res.status(500).send("Email failed");
  }
});


module.exports = router;
