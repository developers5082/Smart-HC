// pages/CreatePrescription.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, prescriptionsAPI } from '../services/api';

const CreatePrescription = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', duration: '' }],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await appointmentsAPI.getById(appointmentId);
        const apt = response.data.data;
        if (apt && apt.doctorId === user._id) {
          setAppointment(apt);
        } else {
          setMessage({ type: 'error', text: 'Appointment not found or unauthorized' });
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setMessage({ type: 'error', text: 'Failed to load appointment' });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId, user._id]);

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', duration: '' }]
    }));
  };

  const removeMedicine = (index) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required';
    formData.medicines.forEach((med, idx) => {
      if (!med.name.trim()) newErrors[`medicine_${idx}_name`] = 'Medicine name required';
      if (!med.dosage.trim()) newErrors[`medicine_${idx}_dosage`] = 'Dosage required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await prescriptionsAPI.create({
        appointmentId,
        diagnosis: formData.diagnosis,
        medicines: formData.medicines.filter(m => m.name.trim()),
        notes: formData.notes
      });
      setMessage({ type: 'success', text: 'Prescription created successfully!' });
      setTimeout(() => navigate('/appointments'), 2000);
    } catch (error) {
      console.error('Error creating prescription:', error);
      setMessage({ type: 'error', text: 'Failed to create prescription' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!appointment) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-red-600">Appointment not found or you don't have permission.</p>
        <button onClick={() => navigate('/appointments')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Prescription</h1>
      <p className="text-gray-600 mb-6">
        Patient: {appointment.patientName} | Date: {appointment.date}
      </p>

      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Diagnosis</label>
          <textarea
            value={formData.diagnosis}
            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg ${errors.diagnosis ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter diagnosis..."
          ></textarea>
          {errors.diagnosis && <p className="text-red-500 text-xs mt-1">{errors.diagnosis}</p>}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-gray-700 text-sm font-bold">Medicines</label>
            <button type="button" onClick={addMedicine} className="text-blue-600 text-sm hover:underline">
              + Add Medicine
            </button>
          </div>
          
          {formData.medicines.map((med, idx) => (
            <div key={idx} className="border rounded-lg p-4 mb-3 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">Medicine {idx + 1}</h3>
                {formData.medicines.length > 1 && (
                  <button type="button" onClick={() => removeMedicine(idx)} className="text-red-600 text-sm">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Name</label>
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                    className={`w-full px-2 py-1 border rounded ${errors[`medicine_${idx}_name`] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Medicine name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Dosage</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                    className={`w-full px-2 py-1 border rounded ${errors[`medicine_${idx}_dosage`] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 500mg twice daily"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Duration</label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="e.g., 7 days"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Additional Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Any additional instructions for the patient..."
          ></textarea>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Prescription'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/appointments')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;