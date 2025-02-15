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
const multer  = require('multer')

const app = express();


connectDB();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static('public'));


app.use('/', noteRoutes);
app.use(authRoutes); 


app.post('/notes/:id/comments', authMiddleware, addComment);
app.get("/", (req, res) => {
  res.render("home", { user: req.session.user, currentPage: "/" });
});
app.get('/', (req, res) => res.render('home'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));
app.get('/notes/:id/edit', updateNote);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));