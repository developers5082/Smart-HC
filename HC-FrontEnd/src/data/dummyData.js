// data/dummyData.js
// Dummy data store - in a real app, this would be API calls

export let dummyUsers = [
  {
    id: '1',
    name: 'Ali Patient',
    email: 'patient@example.com',
    password: '1234',
    role: 'patient',
    profile: {
      name: 'Ali Patient',
      email: 'patient@example.com',
      phone: '+1234567890',
      address: '123 Main St, City',
      dateOfBirth: '1990-01-01',
      bloodGroup: 'O+'
    }
  },
  {
    id: '2',
    name: 'Sarah Doctor',
    email: 'doctor@example.com',
    password: '1234',
    role: 'doctor',
    profile: {
      name: 'Sarah Doctor',
      email: 'doctor@example.com',
      phone: '+0987654321',
      address: '456 Medical Center, City',
      specialization: 'Cardiology',
      qualification: 'MD, Cardiology',
      experience: 10
    }
  },
  {
    id: '3',
    name: 'Farhan Doctor',
    email: 'michael@example.com',
    password: '1234',
    role: 'doctor',
    profile: {
      name: 'Farhan Doctor',
      email: 'Farhan@example.com',
      phone: '+1122334455',
      address: '789 Health Blvd',
      specialization: 'Neurology',
      qualification: 'MD, Neurology',
      experience: 8
    }
  }
];

export let appointments = [
  {
    id: '101',
    patientId: '1',
    patientName: 'Ali Patient',
    doctorId: '2',
    doctorName: 'Sarah Doctor',
    date: '2024-03-20',
    time: '10:00 AM',
    reason: 'Chest pain',
    status: 'confirmed'
  },
  {
    id: '102',
    patientId: '1',
    patientName: 'Ali Patient',
    doctorId: '3',
    doctorName: 'Farhan Doctor',
    date: '2024-03-22',
    time: '2:30 PM',
    reason: 'Headache and dizziness',
    status: 'pending'
  }
];

export let prescriptions = [
  {
    id: '201',
    patientId: '1',
    patientName: 'Ali Patient',
    doctorId: '2',
    doctorName: 'Sarah Doctor',
    appointmentId: '101',
    date: '2024-03-20',
    diagnosis: 'Mild hypertension',
    medicines: [
      { name: 'Lisinopril', dosage: '10mg once daily', duration: '30 days' }
    ],
    notes: 'Monitor blood pressure regularly'
  }
];

// Helper functions
export const getDoctors = () => {
  return dummyUsers.filter(user => user.role === 'doctor').map(doctor => ({
    id: doctor.id,
    name: doctor.profile?.name || doctor.name,
    specialization: doctor.profile?.specialization || 'General Medicine'
  }));
};

export const getAppointmentsByPatient = (patientId) => {
  return appointments.filter(apt => apt.patientId === patientId);
};

export const getAppointmentsByDoctor = (doctorId) => {
  return appointments.filter(apt => apt.doctorId === doctorId);
};

export const getAppointmentById = (id) => {
  return appointments.find(apt => apt.id === id);
};

export const getPrescriptionsByPatient = (patientId) => {
  return prescriptions.filter(pres => pres.patientId === patientId);
};

export const getPrescriptionsByDoctor = (doctorId) => {
  return prescriptions.filter(pres => pres.doctorId === doctorId);
};

export const createAppointment = async (appointmentData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAppointment = {
        id: Date.now().toString(),
        ...appointmentData,
        status: 'pending'
      };
      appointments.push(newAppointment);
      resolve(newAppointment);
    }, 500);
  });
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = appointments.findIndex(apt => apt.id === appointmentId);
      if (index !== -1) {
        appointments[index].status = status;
        resolve(appointments[index]);
      } else {
        reject('Appointment not found');
      }
    }, 500);
  });
};

export const createPrescription = async (prescriptionData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPrescription = {
        id: Date.now().toString(),
        ...prescriptionData
      };
      prescriptions.push(newPrescription);
      
      // Update appointment status to completed
      const aptIndex = appointments.findIndex(apt => apt.id === prescriptionData.appointmentId);
      if (aptIndex !== -1) {
        appointments[aptIndex].status = 'completed';
      }
      resolve(newPrescription);
    }, 500);
  });
};