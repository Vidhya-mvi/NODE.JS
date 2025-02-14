

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl:{
    type: String,
    required:true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment', 
    },
  ],
   likes: [
    { 
      type: mongoose.Schema.Types.ObjectId,
       ref: "User" 
      }],
  
});

module.exports = mongoose.model('Note', noteSchema);
