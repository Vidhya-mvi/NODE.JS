const Note = require('../models/note');
const Comment = require('../models/comment'); // Ensure this line is added

// Get all notes
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


// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log('Request Body:', req.body); 
    console.log('Authenticated User:', req.user); 

    if (!title || !content) {
      return res.status(400).send('Title and content are required');
    }

    const note = new Note({
      title,
      content,
      user: req.user._id 
    });

    await note.save();
    res.redirect('/notes');
  } catch (err) {
    console.error('Error creating note:', err); 
    res.status(500).send('Error creating note');
  }
};


// Edit a note (User can edit their own blog, Admins can edit any)
exports.editNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send('Note not found');

    // Allow admin or the blog owner to edit
    if (req.user._id.toString() !== note.user.toString() && req.user.role !== 'admin') {
      return res.status(403).send('You are not authorized to edit this blog');
    }

    res.render('edit-note', { note });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching note for editing');
  }
};

// Update a note (User can update their own blog, Admins can update any)
exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).send('Note not found');

    // Allow admin or the blog owner to update
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

// Delete a note (User can delete their own blog, Admins can delete any)
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send('Note not found');

    // Allow admin or the blog owner to delete
    if (req.user._id.toString() !== note.user.toString() && req.user.role !== 'admin') {
      return res.status(403).send('You are not authorized to delete this blog');
    }

    await Note.findByIdAndDelete(req.params.id);
    res.redirect('/notes?deleted=true');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting note');
  }
};


// View a single note
exports.viewNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    
    // Fetch the note by its ID and populate comments and the user in each comment
    const note = await Note.findById(noteId)
      .populate('comments')
      .populate('comments.user');  // Populate user in each comment

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Render the 'note' template and pass the note object and user
    res.render('note', { note, user: req.user });
  } catch (err) {
    console.error('Error fetching note:', err);
    res.status(500).json({ error: err.message });
  }
};


// Controller for My Blog page
exports.viewUserBlogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await Note.find({ user: userId });

    console.log("Fetched notes for user:", notes); // Debugging line

    res.render('myBlogPage', { notes });
  } catch (err) {
    console.error('Error fetching user blogs:', err);
    res.status(500).json({ error: err.message });
  }
};


// get hogepage
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

    // Check if user is logged in
    if (!req.user) {
      return res.status(401).json({ error: "You must be logged in to add a comment" });
    }

    // Validate comment text
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

    // Find the note
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Create and save comment
    const comment = new Comment({
      text,
      user: req.user._id,  // Associate the logged-in user
      note: noteId,
    });
    await comment.save();

    // Add comment to the note's comments array
    note.comments.push(comment._id);
    await note.save();

    // Send response with comment details
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

    // Check if user is logged in
    if (!req.user) return res.status(401).json({ error: "You must be logged in to delete comments" });

    // Find the comment to delete
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Check if user is authorized (admin or the comment's author)
    if (req.user.role !== 'admin' && comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }

    // Remove comment from the note's comments array and delete the comment
    await Note.findByIdAndUpdate(noteId, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Error deleting comment" });
  }
};



// Like a note (or unlike if already liked)
exports.likeNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user._id; // Get the logged-in user ID

    // Find the note
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if the user has already liked the note
    const likedIndex = note.likes.indexOf(userId);

    if (likedIndex === -1) {
      // User hasn't liked the note yet, so like it
      note.likes.push(userId);
    } else {
      // User has liked the note, so unlike it
      note.likes.splice(likedIndex, 1);
    }

    // Save the updated note
    await note.save();

    // Return the updated like count
    res.json({ success: true, likes: note.likes.length });
  } catch (err) {
    console.error("Error liking note:", err);
    res.status(500).json({ error: "Error liking note" });
  }
};

// Get like count for a note
exports.getLikeCount = async (req, res) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Return the like count and whether the user has liked it
    const liked = note.likes.includes(req.user._id); // Check if the current user has liked this note
    res.json({ likes: note.likes.length, liked });
  } catch (err) {
    console.error("Error fetching like count:", err);
    res.status(500).json({ error: "Error fetching like count" });
  }
};
