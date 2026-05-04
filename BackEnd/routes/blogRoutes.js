const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog
} = require('../controllers/blogController');

const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  addReply
} = require('../controllers/commentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/')
  .get(getBlogs);

router.route('/:id')
  .get(getBlog);

// Protected routes (require authentication)
router.use(protect);

router.route('/')
  .post(createBlog);

router.route('/:id')
  .put(updateBlog)
  .delete(deleteBlog);

router.route('/:id/like')
  .post(likeBlog);

// Comment routes
router.route('/:blogId/comments')
  .get(getComments)
  .post(createComment);

router.route('/comments/:id')
  .put(updateComment)
  .delete(deleteComment);

router.route('/comments/:id/like')
  .post(likeComment);

router.route('/comments/:id/reply')
  .post(addReply);

module.exports = router;