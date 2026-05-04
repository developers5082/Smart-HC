const getFetch = async () => {
  if (typeof fetch !== 'undefined') return fetch;
  const nodeFetch = await import('node-fetch');
  return nodeFetch.default;
};

const run = async () => {
  const fetch = await getFetch();
  const baseUrl = 'http://localhost:5000/api';

  const signupUser = async (body) => {
    const res = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => null);
    console.log('SIGNUP', body.email, res.status, JSON.stringify(data));
    return data;
  };

  const loginUser = async (body) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => null);
    console.log('LOGIN', body.email, res.status, JSON.stringify(data));
    return data;
  };

  const bookAppointment = async (token, doctorId) => {
    const res = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ doctorId, date: '2026-04-20', time: '10:30', reason: 'Test booking' })
    });
    const data = await res.json().catch(() => null);
    console.log('BOOK', res.status, JSON.stringify(data));
    return data;
  };

  let patient = await signupUser({ name: 'Test Patient', email: 'testpatient123@example.com', password: 'password123', role: 'patient' });
  let doctor = await signupUser({ name: 'Test Doctor', email: 'testdoctor123@example.com', password: 'password123', role: 'doctor', specialization: 'General Medicine' });

  if (doctor?.success && doctor.data?.user?.email) {
    const doctorRes = await fetch(`${baseUrl}/users/doctors`, { headers: { Authorization: `Bearer ${doctor.data.token}` } });
    const doctorList = await doctorRes.json().catch(() => null);
    console.log('DOCTOR LIST', doctorRes.status, JSON.stringify(doctorList));
  }

  const patientLogin = await loginUser({ email: 'testpatient123@example.com', password: 'password123', role: 'patient' });
  const token = patientLogin?.data?.token;
  if (!token) {
    console.error('Patient login failed, cannot book appointment.');
    process.exit(1);
  }

  const doctorsRes = await fetch(`${baseUrl}/users/doctors`, { headers: { Authorization: `Bearer ${token}` } });
  const doctorsData = await doctorsRes.json().catch(() => null);
  console.log('FETCH DOCTORS', doctorsRes.status, JSON.stringify(doctorsData));
  const docId = doctorsData?.data?.[0]?.id;
  if (!docId) {
    console.error('No doctor id found from doctor list.');
    process.exit(1);
  }

  await bookAppointment(token, docId);
};

run().catch((err) => {
  console.error('RUN ERROR', err);
  process.exit(1);
});
