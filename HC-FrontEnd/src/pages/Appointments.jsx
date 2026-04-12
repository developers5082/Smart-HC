// pages/Appointments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAppointmentsByPatient, getAppointmentsByDoctor, updateAppointmentStatus } from '../data/dummyData';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAppointments();
  }, [user.id, user.role]);

  const fetchAppointments = () => {
    setLoading(true);
    setTimeout(() => {
      const data = user.role === 'patient' 
        ? getAppointmentsByPatient(user.id)
        : getAppointmentsByDoctor(user.id);
      setAppointments(data);
      setLoading(false);
    }, 500);
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      setMessage({ type: 'success', text: `Appointment ${status}!` });
      fetchAppointments();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update appointment' });
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading appointments...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Time</th>
                {user.role === 'patient' ? (
                  <th className="py-3 px-4 text-left">Doctor</th>
                ) : (
                  <th className="py-3 px-4 text-left">Patient</th>
                )}
                <th className="py-3 px-4 text-left">Reason</th>
                <th className="py-3 px-4 text-left">Status</th>
                {user.role === 'doctor' && <th className="py-3 px-4 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b">
                  <td className="py-3 px-4">{apt.date}</td>
                  <td className="py-3 px-4">{apt.time}</td>
                  <td className="py-3 px-4">
                    {user.role === 'patient' ? apt.doctorName : apt.patientName}
                  </td>
                  <td className="py-3 px-4">{apt.reason || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  {user.role === 'doctor' && apt.status === 'pending' && (
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 mr-2"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Appointments;