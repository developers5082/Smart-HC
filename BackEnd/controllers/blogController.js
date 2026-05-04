const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;

    let query = {};

    // Filter by category if provided
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search in title and description if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name profile.specialization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single blog with comments
// @route   GET /api/blogs/:id
// @access  Public
const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name profile.specialization')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name profile.specialization'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Doctors only)
const createBlog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create blogs'
      });
    }

    const { title, category, description, image } = req.body;

    // Validate required fields
    if (!title || !category || !description || !image) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const blog = await Blog.create({
      title,
      category,
      description,
      image,
      author: userId,
      authorName: user.name,
      authorRole: user.role
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Blog author only)
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not the author'
      });
    }

    const { title, category, description, image } = req.body;

    blog.title = title || blog.title;
    blog.category = category || blog.category;
    blog.description = description || blog.description;
    blog.image = image || blog.image;

    await blog.save();

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Blog author only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not the author'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Like/Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user already liked the blog
    const existingLike = blog.likes.find(like => like.user.toString() === userId);

    if (existingLike) {
      // Unlike the blog
      blog.likes = blog.likes.filter(like => like.user.toString() !== userId);
    } else {
      // Like the blog
      blog.likes.push({
        user: userId,
        userName: user.name
      });
    }

    await blog.save();

    res.json({
      success: true,
      message: existingLike ? 'Blog unliked' : 'Blog liked',
      likesCount: blog.likes.length
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
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog
};