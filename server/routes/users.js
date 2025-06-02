const express = require('express');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// GET user profile
router.get('/profile', authenticate, (req, res) => {
  res.json({ name: req.user.name, email: req.user.email });
});


// ✅ Update Name and Email
router.put('/update-profile', authenticate, async (req, res) => {
  const { name, email } = req.body;

  try {
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return res.status(404).json({ msg: 'User not found' });

    existingUser.name = name || existingUser.name;
    existingUser.email = email || existingUser.email;

    await existingUser.save();

    res.json({ msg: 'Profile updated', user: { name: existingUser.name, email: existingUser.email } });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});
// ✅ Change Password
router.put('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (!user.password) return res.status(400).json({ msg: 'This account was created via Google. You cannot change the password.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});
// DELETE user
router.delete('/delete', authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting account', error: err.message });
  }
});

module.exports = router;
