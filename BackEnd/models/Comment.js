const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required']
  },
  authorRole: {
    type: String,
    required: [true, 'Author role is required']
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Blog reference is required']
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
  replies: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, 'Reply cannot exceed 300 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorRole: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
commentSchema.index({ blog: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);