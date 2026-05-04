const express = require('express');
const {
  getDoctors,
  getUser
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/doctors', getDoctors);
router.get('/:id', getUser);

module.exports = router;