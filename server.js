require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const authRoutes = require('./routes/adminRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { updateNote, addComment,getNote } = require('./controllers/notecontroller');
const path = require('path');
const authMiddleware = require('./middleware/authmiddleware '); 

const app = express();

// ✅ Connect to Database
connectDB();

// ✅ Middleware Order is Correct
app.use(express.json()); // JSON parser (should come before routes)
app.use(express.urlencoded({ extended: true })); // URL-encoded data parser
app.use(cookieParser());
app.use(methodOverride('_method'));

// ✅ Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Static Files
app.use(express.static('public'));

// ✅ Routes
app.use('/', noteRoutes);
app.use(authRoutes); // Auth routes should come after middleware

// ✅ Ensure `req.user` is set before accessing protected routes
app.post('/notes/:id/comments', authMiddleware, addComment);

app.get('/', (req, res) => res.render('home'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));
app.get('/notes/:id/edit', updateNote);


// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));