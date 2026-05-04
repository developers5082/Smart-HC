const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Private
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name profile.specialization profile.qualification');

    const doctorList = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.name,
      specialization: doctor.profile?.specialization || 'General Medicine',
      qualification: doctor.profile?.qualification || ''
    }));

    res.json({
      success: true,
      count: doctorList.length,
      data: doctorList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
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
  getDoctors,
  getUser
};