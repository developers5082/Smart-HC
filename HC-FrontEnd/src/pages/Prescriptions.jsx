// pages/Prescriptions.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPrescriptionsByPatient, getPrescriptionsByDoctor } from '../data/dummyData';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        const data = user.role === 'patient'
          ? getPrescriptionsByPatient(user.id)
          : getPrescriptionsByDoctor(user.id);
        setPrescriptions(data);
        setLoading(false);
      }, 500);
    };
    fetchData();
  }, [user.id, user.role]);

  if (loading) {
    return <div className="text-center py-10">Loading prescriptions...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Prescriptions</h1>
      
      {prescriptions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No prescriptions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((pres) => (
            <div key={pres.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-lg">
                    {user.role === 'patient' ? `Dr. ${pres.doctorName}` : `Patient: ${pres.patientName}`}
                  </p>
                  <p className="text-sm text-gray-500">{pres.date}</p>
                </div>
                <button
                  onClick={() => setSelectedPrescription(selectedPrescription?.id === pres.id ? null : pres)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  {selectedPrescription?.id === pres.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              {selectedPrescription?.id === pres.id && (
                <div className="mt-4 pt-3 border-t">
                  <p className="font-medium mb-2">Diagnosis:</p>
                  <p className="text-gray-700 mb-3">{pres.diagnosis}</p>
                  
                  <p className="font-medium mb-2">Medicines:</p>
                  <div className="space-y-2 mb-3">
                    {pres.medicines.map((med, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded">
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                        <p className="text-sm text-gray-600">Duration: {med.duration}</p>
                      </div>
                    ))}
                  </div>
                  
                  {pres.notes && (
                    <>
                      <p className="font-medium mb-2">Additional Notes:</p>
                      <p className="text-gray-700">{pres.notes}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;