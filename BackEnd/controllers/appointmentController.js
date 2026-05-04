const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get all appointments for user
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    let appointments;
    if (user.role === 'patient') {
      appointments = await Appointment.find({ patientId: userId }).sort({ date: -1, time: -1 });
    } else if (user.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: userId }).sort({ date: -1, time: -1 });
    }

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    const userId = req.user.userId;
    if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patients only)
const createAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can book appointments'
      });
    }

    const { doctorId, date, time, reason } = req.body;

    // Verify doctor exists and is a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor selected'
      });
    }

    const appointment = await Appointment.create({
      patientId: userId,
      patientName: user.name,
      doctorId,
      doctorName: doctor.name,
      date,
      time,
      reason,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Doctors only)
const updateAppointmentStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can update appointment status'
      });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if doctor owns this appointment
    if (appointment.doctorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    // Allow deletion if user is the patient or doctor
    if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
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
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment
};