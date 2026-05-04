const run = async () => {
  const fetch = global.fetch || (await import('node-fetch')).default;
  const baseUrl = 'http://localhost:5000/api';

  const postJson = async (url, body, token) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    const data = await res.text();
    console.log('POST', url, res.status, data);
    return { status: res.status, data: JSON.parse(data) };
  };

  const putJson = async (url, body, token) => {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.text();
    console.log('PUT', url, res.status, data);
    return { status: res.status, data: JSON.parse(data) };
  };

  const signup = async (body) => {
    return await postJson(`${baseUrl}/auth/signup`, body);
  };
  const login = async (body) => {
    return await postJson(`${baseUrl}/auth/login`, body);
  };

  const doctorSignup = await signup({ name: 'Upd Doctor', email: 'upd_doctor@example.com', password: 'password123', role: 'doctor', specialization: 'General Medicine' });
  const patientSignup = await signup({ name: 'Upd Patient', email: 'upd_patient@example.com', password: 'password123', role: 'patient' });

  const doctorLogin = await login({ email: 'upd_doctor@example.com', password: 'password123', role: 'doctor' });
  const patientLogin = await login({ email: 'upd_patient@example.com', password: 'password123', role: 'patient' });
  const patientToken = patientLogin.data?.token;
  const doctorToken = doctorLogin.data?.token;

  const doctorListRes = await fetch(`${baseUrl}/users/doctors`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const doctorListData = await doctorListRes.json();
  console.log('DOCTORS', doctorListRes.status, JSON.stringify(doctorListData));

  const doctorId = doctorListData.data?.find((d) => d.email === 'upd_doctor@example.com')?.id || doctorLogin.data.user._id;
  console.log('SELECT DOCTOR ID', doctorId);

  const appointRes = await postJson(`${baseUrl}/appointments`, { doctorId, date: '2026-04-25', time: '11:00', reason: 'Update test' }, patientToken);
  const appointmentId = appointRes.data?.data?._id;
  console.log('BOOKED APPOINTMENT ID', appointmentId);

  if (!appointmentId) {
    console.error('No appointment ID created.');
    return;
  }

  const updateRes = await putJson(`${baseUrl}/appointments/${appointmentId}`, { status: 'confirmed' }, doctorToken);
  console.log('UPDATE RESULT', JSON.stringify(updateRes));
};

run().catch((err) => {
  console.error('RUN ERROR', err);
  process.exit(1);
});
