const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to run seed script
function seedDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🌱 Seeding database for clean test state...');
    const seedProc = spawn('node', ['utils/seed.js'], {
      cwd: __dirname,
      env: { ...process.env, USE_MOCK_DB: 'true' }
    });

    seedProc.stdout.on('data', (data) => {
      // Console output logging if needed
    });

    seedProc.stderr.on('data', (data) => {
      console.error(`Seed error output: ${data}`);
    });

    seedProc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database seeded successfully.');
        resolve();
      } else {
        reject(new Error(`Seed process failed with code ${code}`));
      }
    });
  });
}

// Helper to start server
function startServer() {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting backend server on port ${PORT}...`);
    const serverProc = spawn('node', ['server.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: PORT, USE_MOCK_DB: 'true' }
    });

    let started = false;

    serverProc.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('running on port') || output.includes('server running')) {
        started = true;
        resolve(serverProc);
      }
    });

    serverProc.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    serverProc.on('close', (code) => {
      if (!started) {
        reject(new Error(`Server failed to start, exited with code ${code}`));
      }
    });

    // Timeout if server doesn't start in 5 seconds
    setTimeout(() => {
      if (!started) {
        serverProc.kill();
        reject(new Error('Server start timed out after 5 seconds'));
      }
    }, 5000);
  });
}

// Assertion helper
let failedTestsCount = 0;
let passedTestsCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  🟢 PASS: ${message}`);
    passedTestsCount++;
  } else {
    console.log(`  🔴 FAIL: ${message}`);
    failedTestsCount++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING LOGISTICS TRACKER API SUITE');
  console.log('==================================================\n');

  // Tokens & Shared variables across requests
  let adminToken = '';
  let customerToken = '';
  let agent1Token = '';
  let agent2Token = '';
  
  let adminId = '';
  let customerId = '';
  let agent1Id = '';
  let agent2Id = '';
  
  let createdOrderId = '';
  let createdOrderNum = '';
  let rateCardId = '';
  let zoneId = '';

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert(res.status === 200, 'GET /health returns 200 status');
    assert(data.success === true, 'GET /health returns success=true');
    assert(data.mode === 'Mock File Database', 'GET /health shows Mock DB active');
  } catch (err) {
    assert(false, `GET /health request failed: ${err.message}`);
  }

  // 2. Register a new customer user (POST /api/auth/register)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Registered Customer',
        email: 'new_customer@tracker.com',
        password: 'Password123',
        role: 'customer'
      })
    });
    const data = await res.json();
    assert(res.status === 201, 'POST /api/auth/register returns 201 for valid customer data');
    assert(data.success === true, 'POST /api/auth/register returns success=true');
    assert(data.data.role === 'customer', 'POST /api/auth/register user role is customer');
    assert(!!data.data.token, 'POST /api/auth/register returns JWT token');
  } catch (err) {
    assert(false, `POST /api/auth/register customer failed: ${err.message}`);
  }

  // 3. Register a new agent user (POST /api/auth/register)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Registered Agent',
        email: 'new_agent@tracker.com',
        password: 'Password123',
        role: 'agent'
      })
    });
    const data = await res.json();
    assert(res.status === 201, 'POST /api/auth/register returns 201 for valid agent data');
    assert(data.data.role === 'agent', 'POST /api/auth/register user role is agent');
  } catch (err) {
    assert(false, `POST /api/auth/register agent failed: ${err.message}`);
  }

  // 4. Login seeded Admin (POST /api/auth/login)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@tracker.com',
        password: 'Password123'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/auth/login returns 200 for Admin');
    assert(data.success === true, 'POST /api/auth/login success is true');
    assert(data.data.role === 'admin', 'POST /api/auth/login role is admin');
    adminToken = data.data.token;
    adminId = data.data._id;
  } catch (err) {
    assert(false, `POST /api/auth/login Admin failed: ${err.message}`);
  }

  // 5. Login seeded Customer (POST /api/auth/login)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@tracker.com',
        password: 'Password123'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/auth/login returns 200 for Customer');
    assert(data.data.role === 'customer', 'POST /api/auth/login role is customer');
    customerToken = data.data.token;
    customerId = data.data._id;
  } catch (err) {
    assert(false, `POST /api/auth/login Customer failed: ${err.message}`);
  }

  // 6. Login seeded Agent A (POST /api/auth/login)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'agent1@tracker.com',
        password: 'Password123'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/auth/login returns 200 for Agent 1');
    assert(data.data.role === 'agent', 'POST /api/auth/login role is agent');
    agent1Token = data.data.token;
    agent1Id = data.data._id;
  } catch (err) {
    assert(false, `POST /api/auth/login Agent 1 failed: ${err.message}`);
  }

  // 7. Login seeded Agent B (POST /api/auth/login)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'agent2@tracker.com',
        password: 'Password123'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/auth/login returns 200 for Agent 2');
    agent2Token = data.data.token;
    agent2Id = data.data._id;
  } catch (err) {
    assert(false, `POST /api/auth/login Agent 2 failed: ${err.message}`);
  }

  // 8. Get current profile (GET /api/auth/me)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/auth/me returns 200');
    assert(data.data.email === 'customer@tracker.com', 'GET /api/auth/me matches current logged in email');
  } catch (err) {
    assert(false, `GET /api/auth/me failed: ${err.message}`);
  }

  // 9. Calculate quote (POST /api/orders/calculate-quote)
  try {
    const res = await fetch(`${BASE_URL}/api/orders/calculate-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupPincode: '110001',
        dropPincode: '110002',
        length: 10,
        breadth: 10,
        height: 10,
        weight: 2,
        customerType: 'B2C',
        paymentMethod: 'Prepaid'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/orders/calculate-quote returns 200');
    assert(data.data.pickupZone === 'Zone A', 'Quote resolves correct pickup zone');
    assert(data.data.totalRate === 5.00, 'Quote calculates correct rate for standard criteria');
  } catch (err) {
    assert(false, `POST /api/orders/calculate-quote failed: ${err.message}`);
  }

  // 10. Book a package delivery order (POST /api/orders)
  // By default Agent 1 is online and in Zone A. Our pickup is 110001 (Zone A).
  // So it should trigger auto-assignment and match Agent 1 immediately.
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        pickupAddress: {
          street: '123 Customer St',
          city: 'Delhi',
          pincode: '110001'
        },
        dropAddress: {
          street: '456 Delivery Ave',
          city: 'Delhi',
          pincode: '110002'
        },
        packageDetails: {
          length: 10,
          breadth: 10,
          height: 10,
          weight: 2
        },
        paymentMethod: 'Prepaid',
        customerType: 'B2C'
      })
    });
    const data = await res.json();
    assert(res.status === 201, 'POST /api/orders returns 201 Created');
    assert(data.success === true, 'POST /api/orders returns success=true');
    assert(data.data.status === 'Assigned', 'Order auto-assigned immediately');
    assert(data.data.assignedAgent._id === agent1Id, 'Order assigned to agent1 (Zone A courier)');
    createdOrderId = data.data._id;
    createdOrderNum = data.data.orderNumber;
  } catch (err) {
    assert(false, `POST /api/orders failed: ${err.message}`);
  }

  // 11. List orders - Customer (GET /api/orders)
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/orders for customer returns 200');
    assert(data.data.length >= 1, 'GET /api/orders returns user orders');
    assert(data.data.every(o => o.customer._id === customerId), "All returned orders belong to customer");
  } catch (err) {
    assert(false, `GET /api/orders customer failed: ${err.message}`);
  }

  // 12. List orders - Agent 1 (GET /api/orders)
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${agent1Token}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/orders for Agent 1 returns 200');
    assert(data.data.every(o => o.assignedAgent._id === agent1Id), "All returned orders assigned to agent1");
  } catch (err) {
    assert(false, `GET /api/orders agent failed: ${err.message}`);
  }

  // 13. List orders - Admin (GET /api/orders)
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/orders for Admin returns 200');
    assert(data.data.length >= 1, 'Admin lists all orders in system');
  } catch (err) {
    assert(false, `GET /api/orders admin failed: ${err.message}`);
  }

  // 14. Get individual order spec (GET /api/orders/:id)
  try {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/orders/:id returns 200');
    assert(data.data.orderNumber === createdOrderNum, 'Fetched order matches the created order number');
  } catch (err) {
    assert(false, `GET /api/orders/:id failed: ${err.message}`);
  }

  // 15. Manage Zones - Admin lists zones (GET /api/admin/zones)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/zones`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/admin/zones returns 200');
    assert(data.data.length >= 3, 'Returns at least 3 default zones');
  } catch (err) {
    assert(false, `GET /api/admin/zones failed: ${err.message}`);
  }

  // 16. Manage Zones - Admin creates zone (POST /api/admin/zones)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Zone D',
        pincodes: ['700001', '700002']
      })
    });
    const data = await res.json();
    assert(res.status === 201, 'POST /api/admin/zones returns 201 Created');
    assert(data.data.name === 'Zone D', 'Zone D successfully registered');
    zoneId = data.data._id;
  } catch (err) {
    assert(false, `POST /api/admin/zones failed: ${err.message}`);
  }

  // 17. Manage Rate Cards - Admin lists rate cards (GET /api/admin/ratecards)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/ratecards`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/admin/ratecards returns 200');
    assert(data.data.length >= 10, 'Returns multiple seeded rate cards');
  } catch (err) {
    assert(false, `GET /api/admin/ratecards failed: ${err.message}`);
  }

  // 18. Manage Rate Cards - Admin creates rate card (POST /api/admin/ratecards)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/ratecards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        pickupZone: 'Zone A',
        dropZone: 'Zone C',
        customerType: 'B2C',
        paymentMethod: 'Prepaid',
        baseWeightLimit: 3,
        baseRate: 8.50,
        perKgIncrementalRate: 2.00,
        extraCharge: 0
      })
    });
    const data = await res.json();
    assert(res.status === 201, 'POST /api/admin/ratecards returns 201 Created');
    assert(data.data.baseRate === 8.50, 'Rate card created with baseRate 8.50');
    rateCardId = data.data._id;
  } catch (err) {
    assert(false, `POST /api/admin/ratecards failed: ${err.message}`);
  }

  // 19. Manage Rate Cards - Admin updates rate card (PUT /api/admin/ratecards/:id)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/ratecards/${rateCardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        baseRate: 9.75
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'PUT /api/admin/ratecards/:id returns 200');
    assert(data.data.baseRate === 9.75, 'Rate card baseRate updated successfully');
  } catch (err) {
    assert(false, `PUT /api/admin/ratecards/:id failed: ${err.message}`);
  }

  // 20. Manage Rate Cards - Admin deletes rate card (DELETE /api/admin/ratecards/:id)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/ratecards/${rateCardId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'DELETE /api/admin/ratecards/:id returns 200');
  } catch (err) {
    assert(false, `DELETE /api/admin/ratecards/:id failed: ${err.message}`);
  }

  // 21. Admin gets courier roster (GET /api/admin/agents)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/agents`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/admin/agents returns 200');
    assert(data.data.length >= 2, 'Admin retrieves courier agents profile roster');
  } catch (err) {
    assert(false, `GET /api/admin/agents failed: ${err.message}`);
  }

  // 22. Toggle agent availability (PUT /api/agent/availability)
  // Turn Agent 1 offline
  try {
    const res = await fetch(`${BASE_URL}/api/agent/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent1Token}`
      },
      body: JSON.stringify({
        availability: false
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'PUT /api/agent/availability returns 200');
    assert(data.data.availability === false, 'Agent 1 successfully toggled Offline');
  } catch (err) {
    assert(false, `PUT /api/agent/availability offline failed: ${err.message}`);
  }

  // 23. Test auto-assignment deferral when no agent is online
  // Create another order. Since Agent 1 is offline, status should be Created (not Assigned)
  let order2Id = '';
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        pickupAddress: { street: '123 Customer St', city: 'Delhi', pincode: '110001' },
        dropAddress: { street: '456 Delivery Ave', city: 'Delhi', pincode: '110002' },
        packageDetails: { length: 10, breadth: 10, height: 10, weight: 2 },
        paymentMethod: 'Prepaid',
        customerType: 'B2C'
      })
    });
    const data = await res.json();
    assert(res.status === 201, 'POST /api/orders created second order');
    assert(data.data.status === 'Created', 'Second order status remains Created (no available agents in Zone A)');
    assert(data.data.assignedAgent === null || data.data.assignedAgent === undefined, 'Second order has no agent assigned');
    order2Id = data.data._id;
  } catch (err) {
    assert(false, `Order creation during agent offline failed: ${err.message}`);
  }

  // 24. Admin manually assigns agent (POST /api/admin/assign)
  // Let's assign Agent 2 manually to the second order
  try {
    const res = await fetch(`${BASE_URL}/api/admin/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        orderId: order2Id,
        agentId: agent2Id
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/admin/assign returns 200');
    assert(data.data.status === 'Assigned', 'Manually assigned order status is Assigned');
    assert(data.data.assignedAgent === agent2Id, 'Manually assigned agent is Agent 2');
  } catch (err) {
    assert(false, `POST /api/admin/assign failed: ${err.message}`);
  }

  // 25. Agent active dispatches - Agent 2 lists assigned orders (GET /api/agent/orders)
  try {
    const res = await fetch(`${BASE_URL}/api/agent/orders`, {
      headers: { 'Authorization': `Bearer ${agent2Token}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/agent/orders returns 200');
    assert(data.data.some(o => o._id === order2Id), 'Agent 2 active orders lists the manually assigned order');
  } catch (err) {
    assert(false, `GET /api/agent/orders failed: ${err.message}`);
  }

  // 26. Agent updates order status (PUT /api/agent/orders/:id/status)
  // Advance status from Assigned to Picked Up
  try {
    const res = await fetch(`${BASE_URL}/api/agent/orders/${order2Id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent2Token}`
      },
      body: JSON.stringify({
        status: 'Picked Up',
        remarks: 'Picked up order from warehouse'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'PUT /api/agent/orders/:id/status transitions to Picked Up');
    assert(data.data.status === 'Picked Up', 'Order status is now Picked Up');
  } catch (err) {
    assert(false, `PUT /api/agent/orders/:id/status Picked Up failed: ${err.message}`);
  }

  // Agent updates order status: Out For Delivery
  try {
    const res = await fetch(`${BASE_URL}/api/agent/orders/${order2Id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent2Token}`
      },
      body: JSON.stringify({
        status: 'Out For Delivery',
        remarks: 'Courier is out for delivery'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'PUT /api/agent/orders/:id/status transitions to Out For Delivery');
    assert(data.data.status === 'Out For Delivery', 'Order status is now Out For Delivery');
  } catch (err) {
    assert(false, `PUT /api/agent/orders/:id/status Out For Delivery failed: ${err.message}`);
  }

  // Agent updates order status to Failed: MUST fail if remarks are empty
  try {
    const res = await fetch(`${BASE_URL}/api/agent/orders/${order2Id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent2Token}`
      },
      body: JSON.stringify({
        status: 'Failed',
        remarks: ''
      })
    });
    const data = await res.json();
    assert(res.status === 400, 'PUT /api/agent/orders/:id/status to Failed returns 400 if remarks empty');
  } catch (err) {
    assert(false, `Failed remarks validation test crashed: ${err.message}`);
  }

  // Agent updates order status to Failed: succeed with remarks
  try {
    const res = await fetch(`${BASE_URL}/api/agent/orders/${order2Id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent2Token}`
      },
      body: JSON.stringify({
        status: 'Failed',
        remarks: 'Customer lock door, unreachable phone'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'PUT /api/agent/orders/:id/status to Failed succeeds with remarks');
    assert(data.data.status === 'Failed', 'Order status is now Failed');
  } catch (err) {
    assert(false, `PUT /api/agent/orders/:id/status Failed with remarks failed: ${err.message}`);
  }

  // 27. Reschedule order - Customer reschedules failed order (PUT /api/orders/:id/reschedule)
  try {
    const res = await fetch(`${BASE_URL}/api/orders/${order2Id}/reschedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        rescheduleDate: '2026-07-10T10:00:00.000Z'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'PUT /api/orders/:id/reschedule returns 200');
    assert(data.data.status === 'Rescheduled', 'Rescheduled order status is now Rescheduled');
    assert(data.data.assignedAgent === null, 'Agent has been unassigned for rescheduling auto-matching queue');
  } catch (err) {
    assert(false, `PUT /api/orders/:id/reschedule failed: ${err.message}`);
  }

  // 28. Toggle Agent 1 back Online
  try {
    const res = await fetch(`${BASE_URL}/api/agent/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent1Token}`
      },
      body: JSON.stringify({ availability: true })
    });
    assert(res.status === 200, 'Agent 1 toggled back Online successfully');
  } catch (err) {
    assert(false, `Toggling Agent 1 online failed: ${err.message}`);
  }

  // 29. Admin triggers auto-assign API for rescheduled order (POST /api/admin/assign/auto/:orderId)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/assign/auto/${order2Id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/admin/assign/auto/:orderId returns 200');
    assert(data.success === true, 'Auto-assignment succeeds');
    assert(data.agent._id === agent1Id, 'Assigned agent matches Agent 1 (Zone A)');
  } catch (err) {
    assert(false, `POST /api/admin/assign/auto/:orderId failed: ${err.message}`);
  }

  // 30. Admin status override (PUT /api/admin/orders/:id/override)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/orders/${order2Id}/override`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Delivered',
        remarks: 'Admin verified drop-off with customer manually'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'PUT /api/admin/orders/:id/override returns 200');
    assert(data.data.status === 'Delivered', 'Order status overridden to Delivered');
  } catch (err) {
    assert(false, `PUT /api/admin/orders/:id/override failed: ${err.message}`);
  }

  // 31. Get tracking history (GET /api/tracking/:orderId)
  try {
    const res = await fetch(`${BASE_URL}/api/tracking/${order2Id}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/tracking/:orderId returns 200');
    assert(data.data.length >= 6, 'Tracking history logs all transition milestones chronologically');
    
    // Verify milestones sequence
    const statuses = data.data.map(item => item.status);
    console.log('  Milestones transition trail:', statuses.join(' -> '));
  } catch (err) {
    assert(false, `GET /api/tracking/:orderId failed: ${err.message}`);
  }

  console.log('\n==================================================');
  console.log(`📊 TESTS COMPLETED: ${passedTestsCount} Passed, ${failedTestsCount} Failed`);
  console.log('==================================================\n');
}

async function main() {
  let serverProcess = null;
  try {
    await seedDatabase();
    serverProcess = await startServer();
    await runTests();
  } catch (err) {
    console.error('Fatal Test Run Error:', err.message);
  } finally {
    if (serverProcess) {
      console.log('⏹️ Shutting down backend test server...');
      serverProcess.kill();
    }
    process.exit(failedTestsCount > 0 ? 1 : 0);
  }
}

main();
