import 'dotenv/config';

const testAuthFlow = async () => {
  const BASE_URL = 'http://localhost:5000';
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to run this test');
  }
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    console.log('--- TEST 1: Admin Login ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword
      })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login status is 200');
    assert(adminLoginData.data?.role === 'admin', 'Admin role is "admin"');
    assert(!!adminLoginData.data?.token, 'Admin received JWT token');
    const adminToken = adminLoginData.data?.token;

    console.log('\n--- TEST 2: Admin Login with Incorrect Password ---');
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: 'WrongPassword@123'
      })
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 401, 'Bad login returns status 401');
    assert(badLoginData.message === 'Invalid email or password', 'Bad login message is "Invalid email or password"');

    console.log('\n--- TEST 3: Customer Registration ---');
    const randomEmail = `test.user.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kavitha Sundaram',
        email: randomEmail,
        phone: '+91 98401 54321',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Customer registration returns 201');
    assert(regData.data?.role === 'customer', 'New user role is "customer"');
    assert(!!regData.data?.token, 'Customer received JWT token');
    const customerToken = regData.data?.token;

    console.log('\n--- TEST 4: Duplicate Registration Rejection ---');
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kavitha Sundaram',
        email: randomEmail,
        password: 'Password@123'
      })
    });
    assert(dupRes.status === 400, 'Duplicate email registration returns 400');

    console.log('\n--- TEST 5: Customer Login with Valid Credentials ---');
    const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randomEmail,
        password: 'Password@123'
      })
    });
    const custLoginData = await custLoginRes.json();
    assert(custLoginRes.status === 200, 'Customer login returns 200');
    assert(custLoginData.data?.name === 'Kavitha Sundaram', 'Customer name returned correctly');

    console.log('\n--- TEST 6: Protected /api/auth/me Profile Fetch ---');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Profile fetch status is 200');
    assert(meData.data?.email === randomEmail, 'Profile email matches');

    console.log('\n--- TEST 7: Customer Profile Update ---');
    const updateRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        name: 'Kavitha S. Rajan',
        phone: '+91 99999 88888'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'Profile update returns 200');
    assert(updateData.data?.name === 'Kavitha S. Rajan', 'Updated name saved in DB');

    console.log('\n--- TEST 8: Address Management (Add, Update, Delete) ---');
    // Add Address
    const addAddrRes = await fetch(`${BASE_URL}/api/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        fullName: 'Kavitha S. Rajan',
        phone: '+91 99999 88888',
        houseBuilding: 'Flat 4B, Lotus Enclave',
        street: '12, Gandhi Mandapam Road',
        area: 'Kotturpuram',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600085',
        type: 'Home',
        isDefault: true
      })
    });
    const addAddrData = await addAddrRes.json();
    assert(addAddrRes.status === 201, 'Address add returns 201');
    assert(addAddrData.data?.length === 1, '1 address exists in profile');
    const addedAddressId = addAddrData.data[0]._id;

    // Update Address
    const updateAddrRes = await fetch(`${BASE_URL}/api/auth/addresses/${addedAddressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        houseBuilding: 'Flat 4B, Lotus Luxury Enclave'
      })
    });
    assert(updateAddrRes.status === 200, 'Address update returns 200');

    // Add Second Address
    const addSecondAddrRes = await fetch(`${BASE_URL}/api/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        fullName: 'Kavitha Office',
        phone: '+91 99999 88888',
        houseBuilding: 'Level 5, Ascendas IT Park',
        street: 'CSIR Road, Taramani',
        area: 'Taramani',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600113',
        type: 'Work',
        isDefault: false
      })
    });
    const secondAddrData = await addSecondAddrRes.json();
    assert(secondAddrData.data?.length === 2, '2 addresses now exist');
    const secondAddrId = secondAddrData.data[1]._id;

    // Set Second as Default
    const defaultRes = await fetch(`${BASE_URL}/api/auth/addresses/${secondAddrId}/default`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const defaultData = await defaultRes.json();
    const updatedSecond = defaultData.data.find(a => a._id === secondAddrId);
    assert(updatedSecond?.isDefault === true, 'Second address became default');

    // Delete First Address
    const delRes = await fetch(`${BASE_URL}/api/auth/addresses/${addedAddressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const delData = await delRes.json();
    assert(delRes.status === 200, 'Address delete returns 200');
    assert(delData.data?.length === 1, 'Only 1 address remains after deletion');

    console.log('\n--- TEST 9: Role-based Access Control (Customer vs Admin) ---');
    // Customer tries to access admin dashboard
    const custAdminAttempt = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(custAdminAttempt.status === 403, 'Customer blocked from /api/admin/dashboard (403 Forbidden)');

    // Admin accesses admin dashboard
    const adminDashboardAttempt = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminDashboardAttempt.status === 200, 'Admin successfully accesses /api/admin/dashboard (200 OK)');

    console.log('\n--- TEST 10: Customer Orders Endpoint ---');
    const myOrdersRes = await fetch(`${BASE_URL}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(myOrdersRes.status === 200, 'Customer /api/orders/my-orders returns 200');

    console.log(`\n================================`);
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`================================`);
  } catch (error) {
    console.error('Test execution failed with error:', error);
  }
};

testAuthFlow();
