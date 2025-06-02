const cron = require("node-cron");
const Bill = require("../models/Bill");
const sendEmail = require("../utils/sendEmail");

cron.schedule("30 18 * * *", async () => { // For testing, every minute
  try {

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    const dueBills = await Bill.find({
      dueDate: { $gte: tomorrow, $lt: nextDay },
      paid: false,
    }).populate("userId");

    

    for (const bill of dueBills) {
      const user = bill.userId;
      if (!user?.email) {
        console.warn("⚠️ Skipping bill: user email not found");
        continue;
      }

      await sendEmail(
        user.email,
        "⏰ Upcoming Bill Reminder",
        `<p>Dear ${user.name || "user"},</p>
        <p>This is a reminder that your bill <strong>${bill.title}</strong> of ₹${bill.amount} is due <strong>tomorrow</strong>.</p>
        <p>Please make sure to pay it on time to avoid any penalties.</p>
        <p>– Personify</p>`
      );

      
    }

    
  } catch (err) {
    console.error("❌ Error running bill reminder job:", err);
  }
});
