// routes/goals.js
const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth"); // ensure user is logged in

// Get all goals for user
router.get("/", authMiddleware, async (req, res) => {
  const goals = await Goal.find({ userId: req.user.id });
  res.json(goals);
});

// Create a goal
router.post("/", authMiddleware, async (req, res) => {
  const { title, targetAmount } = req.body;
  const newGoal = new Goal({ title, targetAmount, userId: req.user.id });
  await newGoal.save();
  res.json(newGoal);
});

// Mark goal as achieved
router.patch("/:id/achieve", authMiddleware, async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { achieved: true },
    { new: true }
  );

  // Create notification
  await Notification.create({
    message: `🎯 Goal Achieved: ${goal.title}`,
    type: "goal",
    userId: req.user.id,
  });

  // Optional: trigger email
  // const sendEmail = require("../utils/sendEmail");
  // await sendEmail(req.user.email, "Goal Achieved!", `<p>Congrats on your goal: ${goal.title}</p>`);

  res.json(goal);
});
router.patch("/:id/add-money", authMiddleware, async (req, res) => {
  const { amount } = req.body;

  const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });

  if (!goal) return res.status(404).json({ error: "Goal not found" });

  goal.currentAmount += amount;

  if (goal.currentAmount >= goal.targetAmount && !goal.achieved) {
    goal.achieved = true;

    // Create notification
    await Notification.create({
      message: `🎯 Goal Achieved: ${goal.title}`,
      type: "goal",
      userId: req.user.id,
    });

    // Optionally send email
    // const sendEmail = require("../utils/sendEmail");
    // await sendEmail(req.user.email, "🎯 Goal Achieved!", `<p>Your goal ${goal.title} is now achieved!</p>`);
  }

  await goal.save();
  res.json(goal);
});
// Delete goal
router.delete("/:id", authMiddleware, async (req, res) => {
  await Goal.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Goal deleted" });
});

module.exports = router;
