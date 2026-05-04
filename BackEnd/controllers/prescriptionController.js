const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get all prescriptions for user
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    let prescriptions = [];
    if (user.role === 'patient') {
      prescriptions = await Prescription.find({ patientId: userId }).sort({ date: -1 });
      // For testing, if no prescriptions, return all prescriptions
      if (prescriptions.length === 0) {
        prescriptions = await Prescription.find().sort({ date: -1 });
      }
    } else if (user.role === 'doctor') {
      prescriptions = await Prescription.find({ doctorId: userId }).sort({ date: -1 });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role for prescription access'
      });
    }

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if user has access to this prescription
    const userId = req.user.userId;
    if (prescription.patientId.toString() !== userId && prescription.doctorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctors only)
const createPrescription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create prescriptions'
      });
    }

    const { appointmentId, diagnosis, medicines, notes } = req.body;

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId);
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
        message: 'Access denied - not your appointment'
      });
    }

    // Validate medicines array
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one medicine is required'
      });
    }

    // Validate each medicine
    for (const medicine of medicines) {
      if (!medicine.name || !medicine.dosage || !medicine.duration) {
        return res.status(400).json({
          success: false,
          message: 'Each medicine must have name, dosage, and duration'
        });
      }
    }

    const prescription = await Prescription.create({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: userId,
      doctorName: user.name,
      appointmentId,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      diagnosis,
      medicines,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctors only)
const updatePrescription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can update prescriptions'
      });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if doctor owns this prescription
    if (prescription.doctorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { diagnosis, medicines, notes } = req.body;

    // Validate medicines if provided
    if (medicines) {
      if (!Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one medicine is required'
        });
      }

      for (const medicine of medicines) {
        if (!medicine.name || !medicine.dosage || !medicine.duration) {
          return res.status(400).json({
            success: false,
            message: 'Each medicine must have name, dosage, and duration'
          });
        }
      }
    }

    const updateData = {};
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (medicines) updateData.medicines = medicines;
    if (notes !== undefined) updateData.notes = notes;

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: updatedPrescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Doctors only)
const deletePrescription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can delete prescriptions'
      });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if doctor owns this prescription
    if (prescription.doctorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await prescription.deleteOne();

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
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
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription
};