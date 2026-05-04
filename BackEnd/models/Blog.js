const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    enum: [
      'World Cancer Day',
      'World Hepatitis Day',
      'World Polio Day',
      'World AIDS Day',
      'World Diabetes Day',
      'World TB Day',
      'World Heart Day',
      'World Malaria Day'
    ]
  },
  description: {
    type: String,
    required: [true, 'Blog description is required'],
    trim: true
  },
  image: {
    type: String, // URL or path to the uploaded image
    required: [true, 'Blog image is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required']
  },
  authorRole: {
    type: String,
    required: [true, 'Author role is required']
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
blogSchema.index({ category: 1, createdAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);