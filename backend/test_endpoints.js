const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const tests = [
  { name: 'Health Check', endpoint: '/health', method: 'get' },
  { name: 'Public Stats', endpoint: '/public/stats', method: 'get' },
  { name: 'Auth Register (Invalid)', endpoint: '/auth/register', method: 'post', data: {}, expectedStatus: 400 },
  { name: 'Auth Login (Invalid)', endpoint: '/auth/login', method: 'post', data: { email: 'wrong@test.com', password: 'wrong' }, expectedStatus: 401 },
];

async function runTests() {
  console.log('🚀 Starting Automatic API Testing...');
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const res = await axios({
        method: test.method,
        url: `${BASE_URL}${test.endpoint}`,
        data: test.data,
        validateStatus: () => true
      });

      const expected = test.expectedStatus || 200;
      if (res.status === expected) {
        console.log(`✅ PASSED: ${test.name} (${res.status})`);
        passed++;
      } else {
        console.log(`❌ FAILED: ${test.name} (Expected ${expected}, got ${res.status})`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ERROR: ${test.name} - ${err.message}`);
      failed++;
    }
  }

  console.log('\n--- Test Summary ---');
  console.log(`Total: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests();
