// pages/Prescriptions.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { prescriptionsAPI } from '../services/api';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await prescriptionsAPI.getAll();
        if (!response.data) {
          throw new Error('No response data received');
        }
        if (response.data?.success === false) {
          throw new Error(response.data.message || 'Failed to fetch prescriptions');
        }
        const prescriptionsData = response.data?.data || [];
        setPrescriptions(prescriptionsData);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch prescriptions');
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading prescriptions...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Prescriptions</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {prescriptions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{error ? 'Unable to load prescriptions.' : 'No prescriptions found.'}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((pres) => (
            <div key={pres._id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-lg">
                    {user.role === 'patient' ? `Dr. ${pres.doctorName}` : `Patient: ${pres.patientName}`}
                  </p>
                  <p className="text-sm text-gray-500">{pres.date}</p>
                </div>
                <button
                  onClick={() => setSelectedPrescription(selectedPrescription?._id === pres._id ? null : pres)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  {selectedPrescription?._id === pres._id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              {selectedPrescription?._id === pres._id && (
                <div className="mt-4 pt-3 border-t">
                  <p className="font-medium mb-2">Diagnosis:</p>
                  <p className="text-gray-700 mb-3">{pres.diagnosis}</p>
                  
                  <p className="font-medium mb-2">Medicines:</p>
                  <div className="space-y-2 mb-3">
                    {(pres.medicines || []).map((med, idx) => (
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