const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointmentStatus)
  .delete(deleteAppointment);

module.exports = router;