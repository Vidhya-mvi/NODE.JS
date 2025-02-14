const express = require('express');
const router = express.Router();
const noteController = require('../controllers/notecontroller');
const auth = require('../middleware/authmiddleware ');
const upload = require('../upload')

router.get('/notes', auth, noteController.getAllNotes);

router.post('/notes', auth, upload, noteController.createNote);
router.get('/notes/new', auth, (req, res) => {
  res.render('create-note');
});

router.get('/notes/:id/edit', auth, noteController.editNote);
router.put('/notes/:id', auth, noteController.updateNote);
router.delete('/notes/:id', auth, noteController.deleteNote);
router.post('/notes/:id/comments', auth, noteController.addComment);
router.delete('/notes/:id/comments/delete/:commentId', auth, noteController.deleteComment); 
router.get('/notes/:id', auth, noteController.viewNote);
router.get('/MyBlog', auth, noteController.viewUserBlogs);
router.get('/',  noteController.getHomePage);
router.post("/notes/:id/like", auth,noteController.likeNote);
router.get("/notes/:id/like-status", auth,noteController.getLikeCount);




module.exports = router;