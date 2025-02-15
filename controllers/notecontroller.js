const Note = require('../models/note');
const Comment = require('../models/comment'); 


exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate({
      path: 'comments',
      populate: { path: 'user', select: 'username' } 
    }).exec();

    res.render('note', { notes, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching notes');
  }
};






exports.renderCreateNoteForm = (req, res) => {
  res.render('create-note');
};

exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageUrl = req.file ? `/uploads/assets/${req.file.filename}` : null; 

    const newNote = new Note({
      title,
      content,
      imageUrl, 
      user: req.user._id,
    });

    await newNote.save();
    res.redirect('/myBlog'); 
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).send('Error creating note');
  }
};


exports.editNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send('Note not found');

  
    if (req.user._id.toString() !== note.user.toString() && req.user.role !== 'admin') {
      return res.status(403).send('You are not authorized to edit this blog');
    }

    res.render('edit-note', { note });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching note for editing');
  }
};


exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).send('Note not found');


    if (req.user._id.toString() !== note.user.toString() && req.user.role !== 'admin') {
      return res.status(403).send('You are not authorized to update this blog');
    }

    await Note.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
    res.redirect('/myBlog');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating note');
  }
};


exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send('Note not found');


    if (req.user._id.toString() !== note.user.toString() && req.user.role !== 'admin') {
      return res.status(403).send('You are not authorized to delete this blog');
    }

    await Note.findByIdAndDelete(req.params.id);
    res.redirect('/myBlog?deleted=true');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting note');
  }
};



exports.viewNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    
   
    const note = await Note.findById(noteId)
      .populate('comments')
      .populate('comments.user'); 
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

   
    res.render('note', { note, user: req.user });
  } catch (err) {
    console.error('Error fetching note:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.viewUserBlogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await Note.find({ user: userId });

    console.log("Fetched notes for user:", notes); 

    res.render('myBlogPage', { notes });
  } catch (err) {
    console.error('Error fetching user blogs:', err);
    res.status(500).json({ error: err.message });
  }
};



exports.getHomePage = async (req, res) => {
  try {
    console.log('getHomePage called'); 
    const blogs = await Note.find();
    res.render('home', { blogs }); 
  } catch (err) {
    console.error('Error fetching blogs:', err); 
    res.status(500).json({ error: err.message });
  }
};




exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const noteId = req.params.id;

    if (!req.user) {
      return res.status(401).json({ error: "You must be logged in to add a comment" });
    }

   
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

 
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

 
    const comment = new Comment({
      text,
      user: req.user._id, 
      note: noteId,
    });
    await comment.save();

  
    note.comments.push(comment._id);
    await note.save();

    res.status(201).json({ 
      success: true, 
      message: "Comment added", 
      username: req.user.username,  
      commentId: comment._id 
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Error adding comment" });
  }
};



exports.deleteComment = async (req, res) => {
  try {
    const noteId = req.params.id;
    const commentId = req.params.commentId;

   
    if (!req.user) return res.status(401).json({ error: "You must be logged in to delete comments" });


    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    
    if (req.user.role !== 'admin' && comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }

    await Note.findByIdAndUpdate(noteId, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Error deleting comment" });
  }
};




exports.likeNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user._id;

   
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    const likedIndex = note.likes.indexOf(userId);

    if (likedIndex === -1) {
      
      note.likes.push(userId);
    } else {
      
      note.likes.splice(likedIndex, 1);
    }

    await note.save();

    
    res.json({ success: true, likes: note.likes.length });
  } catch (err) {
    console.error("Error liking note:", err);
    res.status(500).json({ error: "Error liking note" });
  }
};


exports.getLikeCount = async (req, res) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

   
    const liked = note.likes.includes(req.user._id); 
    res.json({ likes: note.likes.length, liked });
  } catch (err) {
    console.error("Error fetching like count:", err);
    res.status(500).json({ error: "Error fetching like count" });
  }
};