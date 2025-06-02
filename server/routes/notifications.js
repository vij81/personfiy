const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");

// Get all notifications
router.get("/", authMiddleware, async (req, res) => {
  const notes = await Notification.find({ userId: req.user.id }).sort({ timestamp: -1 });
  res.json(notes);
});

// Delete a notification
router.delete("/:id", authMiddleware, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;
