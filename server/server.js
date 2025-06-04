const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require("path");
dotenv.config();
require('./config/passport'); // ⬅️ Google OAuth strategy

const authRoutes = require('./routes/auth');
const TransactionRoutes = require('./routes/transactions');
const app = express();

app.use(cors({ origin: 'https://personfiy.netlify.app', credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false, // better to use false here
    cookie: {
      secure: false, // true if using HTTPS
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

const _dirname=path.resolve();

require("./cron/billReminder");
app.use('/auth', authRoutes);
app.use('/transactions', TransactionRoutes);
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);
const goalsdone = require('./routes/goals');
app.use('/goal', goalsdone);
const billRoutes = require("./routes/bills");
app.use("/bills", billRoutes);
const notify = require("./routes/notifications");
app.use("/notifications", notify);

app.listen(8080, () => console.log('Server running on port 8080'));

