const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  }
});

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required']
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment ID is required']
  },
  date: {
    type: String,
    required: [true, 'Prescription date is required']
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  medicines: [medicineSchema],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
prescriptionSchema.index({ patientId: 1, date: -1 });
prescriptionSchema.index({ doctorId: 1, date: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);