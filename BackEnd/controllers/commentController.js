const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const User = require('../models/User');

// @desc    Get all comments for a blog
// @route   GET /api/blogs/:blogId/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .populate('author', 'name profile.specialization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new comment
// @route   POST /api/blogs/:blogId/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const blogId = req.params.blogId;

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: userId,
      authorName: user.name,
      authorRole: user.role,
      blog: blogId
    });

    // Add comment to blog's comments array
    blog.comments.push(comment._id);
    await blog.save();

    // Populate the comment for response
    await comment.populate('author', 'name profile.specialization');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Comment author only)
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not the author'
      });
    }

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    comment.content = content.trim();
    await comment.save();

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author only)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not the author'
      });
    }

    // Remove comment from blog's comments array
    await Blog.findByIdAndUpdate(comment.blog, {
      $pull: { comments: comment._id }
    });

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked the comment
    const existingLike = comment.likes.find(like => like.user.toString() === userId);

    if (existingLike) {
      // Unlike the comment
      comment.likes = comment.likes.filter(like => like.user.toString() !== userId);
    } else {
      // Like the comment
      comment.likes.push({
        user: userId,
        userName: user.name
      });
    }

    await comment.save();

    res.json({
      success: true,
      message: existingLike ? 'Comment unliked' : 'Comment liked',
      likesCount: comment.likes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add reply to comment
// @route   POST /api/comments/:id/reply
// @access  Private
const addReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    comment.replies.push({
      content: content.trim(),
      author: userId,
      authorName: user.name,
      authorRole: user.role
    });

    await comment.save();

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: comment.replies[comment.replies.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  addReply
};