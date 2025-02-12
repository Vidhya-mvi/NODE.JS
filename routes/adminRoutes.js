const express = require('express');
const router = express.Router();
const authController = require('../controllers/admincontroller');

// Signup Route
router.post('/signup', authController.signup);

// Login Route
router.post('/login', authController.login);

// Logout Route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});


module.exports = router;
