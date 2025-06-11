const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

router.get('/signup', (req, res) => {
  res.render('signup', { error: null }); // ✅ Error pass ho raha hai EJS me
});

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashedPassword });
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  res.render('login', { error: null }); // error default
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.render('login', { error: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render('login', { error: "Invalid password" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
