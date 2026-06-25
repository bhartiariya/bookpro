async function runTests() {
  const baseUrl = 'http://localhost:5000/api/v1';

  try {
    const emailStr = `provider_${Date.now()}@test.com`;
    // 1. Register a provider
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Provider',
        email: emailStr,
        password: 'password123',
        role: 'provider'
      })
    });
    
    // Wait, the route might not be /auth/register exactly. Let's assume it is.
    const registerData = await registerRes.json();
    console.log('Register Response:', registerData);

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailStr,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
    
    const token = loginData.data?.token || loginData.token;
    
    if (!token) {
       console.log('No token found in login response, stopping test.');
       return;
    }

    // 2. Create a service
    console.log('\n--- Create Service ---');
    const createServiceRes = await fetch(`${baseUrl}/services`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: 'Test Service',
        description: 'A great service',
        price: 100,
        duration_mins: 60,
        category: 'Test'
      })
    });
    const serviceData = await createServiceRes.json();
    console.log('Create Service Response:', serviceData);
    const serviceId = serviceData.data?.id;

    if (!serviceId) {
      console.log('Failed to create service, stopping test.');
      return;
    }

    // 3. Get all services
    console.log('\n--- Get All Services ---');
    const getAllRes = await fetch(`${baseUrl}/services`);
    const allServices = await getAllRes.json();
    console.log('Get All Services Response:', allServices);

    // 4. Get my services
    console.log('\n--- Get My Services ---');
    const getMyRes = await fetch(`${baseUrl}/services/my/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const myServices = await getMyRes.json();
    console.log('Get My Services Response:', myServices);

    // 5. Update service
    console.log('\n--- Update Service ---');
    const updateRes = await fetch(`${baseUrl}/services/${serviceId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: 'Updated Test Service',
        price: 150
      })
    });
    const updateData = await updateRes.json();
    console.log('Update Service Response:', updateData);

    // 6. Delete service
    console.log('\n--- Delete Service ---');
    const deleteRes = await fetch(`${baseUrl}/services/${serviceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const deleteData = await deleteRes.json();
    console.log('Delete Service Response:', deleteData);

  } catch (error) {
    console.error('Test Error:', error);
  }
}

runTests();
