// pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAppointmentsByDoctor } from '../data/dummyData';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setTimeout(() => {
        const doctorAppointments = getAppointmentsByDoctor(user.id);
        setAppointments(doctorAppointments.slice(0, 5));
        setLoading(false);
      }, 500);
    };
    fetchData();
  }, [user.id]);

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, Dr. {user.profile?.name || user.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Appointments</h2>
          {pendingAppointments.length === 0 ? (
            <p className="text-gray-500">No pending appointments.</p>
          ) : (
            <div className="space-y-3">
              {pendingAppointments.map(apt => (
                <div key={apt.id} className="border-b pb-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{apt.patientName}</p>
                    <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                  </div>
                  <Link
                    to={`/create-prescription/${apt.id}`}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Create Prescription
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          {confirmedAppointments.length === 0 ? (
            <p className="text-gray-500">No appointments for today.</p>
          ) : (
            <div className="space-y-3">
              {confirmedAppointments.map(apt => (
                <div key={apt.id} className="border-b pb-3">
                  <p className="font-medium">{apt.patientName}</p>
                  <p className="text-sm text-gray-600">{apt.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
            <p className="text-gray-600">Total Appointments</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{confirmedAppointments.length}</p>
            <p className="text-gray-600">Confirmed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;