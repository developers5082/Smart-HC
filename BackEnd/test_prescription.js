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

  const getJson = async (url, token) => {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const data = await res.text();
    console.log('GET', url, res.status, data);
    return { status: res.status, data: JSON.parse(data) };
  };

  // Login as patient
  const patientLogin = await postJson(`${baseUrl}/auth/login`, {
    email: 'testpatient123@example.com',
    password: 'password123',
    role: 'patient'
  });
  const patientToken = patientLogin.data?.data?.token;
  console.log('Patient token:', patientToken ? 'YES' : 'NO');

  // Get prescriptions
  const presRes = await getJson(`${baseUrl}/prescriptions`, patientToken);
  console.log('Prescriptions fetched:', presRes);
};

run().catch((err) => {
  console.error('RUN ERROR', err);
  process.exit(1);
});