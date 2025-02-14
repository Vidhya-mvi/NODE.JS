const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    console.log('Auth middleware called'); 
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log('Token:', token); 

    if (!token) {
      console.log('Access Denied: No Token Provided'); 
      return res.status(401).send('Access Denied: No Token Provided');
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Verified:', verified); 
    req.user = await User.findById(verified.userId);

    if (!req.user) {
      console.log('Invalid User'); 
      return res.status(401).send('Invalid User');
    }

    console.log("Authenticated User:", req.user); 

    next();
  } catch (err) {
    console.error('Invalid Token:', err.message); 
    res.status(401).send('Invalid Token');
  }
};


// const adminAuth = async (req, res, next) => {
//   try {
//     const token = req.cookies.adminToken || req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).send('Access Denied: No Token Provided');
//     }

//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     req.admin = await Admin.findById(verified.adminId);

//     if (!req.admin) {
//       return res.status(401).send('Invalid Admin');
//     }

//     next();
//   } catch (err) {
//     res.status(401).send('Invalid Token');
//   }
// };