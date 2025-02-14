const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const adminAuth = require('../middleware/authmiddleware ');

// Signup Route
router.post('/signup', adminController.signup);

// Login Route
router.post('/login', adminController.login);

// Logout Route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// router.get('/login', (req, res) => {
//   res.render('admin-login');
// });

// router.post('/login', adminController.adminLogin);


// router.get('/logout', (req, res) => {
//   res.clearCookie('adminToken'); 
//   res.redirect('/login');
// });


// router.get('/admin-pannel', adminAuth, adminController.adminPanel);


// router.get('/edit-blog/:id', adminAuth, adminController.editBlog);
// router.put('/edit-blog/:id', adminAuth, adminController.updateBlog);


// router.delete('/delete-blog/:id', adminAuth, adminController.deleteBlog);


// router.delete('/delete-comment/:id', adminAuth, adminController.deleteComment);


module.exports = router;
