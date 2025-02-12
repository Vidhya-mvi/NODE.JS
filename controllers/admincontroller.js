const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();



exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone
    });

    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.render('signup', { error: 'Error creating user' });
  }
};






exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("User Found:", user); 

    if (!user) return res.status(400).send('User not found');

    

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch); 

    if (!isMatch) return res.status(400).send('Invalid credentials');

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("Generated Token:", token); 

    res.cookie("token", token, { httpOnly: true });
    res.redirect('/notes'); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};



