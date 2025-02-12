const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    console.log('Auth middleware called'); // Add this line
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log('Token:', token); // Add logging

    if (!token) {
      console.log('Access Denied: No Token Provided'); // Add logging
      return res.status(401).send('Access Denied: No Token Provided');
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Verified:', verified); // Add logging
    req.user = await User.findById(verified.userId);

    if (!req.user) {
      console.log('Invalid User'); // Add logging
      return res.status(401).send('Invalid User');
    }

    console.log("Authenticated User:", req.user); // Debugging

    next();
  } catch (err) {
    console.error('Invalid Token:', err.message); // Add logging
    res.status(401).send('Invalid Token');
  }
};