const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { status: 500, data: { success: false, error: error.message } };
  }
}

// Test functions
async function testHealth() {
  console.log('\n🏥 Testing Health Check...');
  const result = await apiCall('/health');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testBalance() {
  console.log('\n💰 Testing Get Balance...');
  const result = await apiCall('/balance');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testDeposit(amount, description) {
  console.log(`\n📥 Testing Deposit: $${amount} - ${description}`);
  const result = await apiCall('/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount, description })
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testWithdraw(amount, description) {
  console.log(`\n📤 Testing Withdrawal: $${amount} - ${description}`);
  const result = await apiCall('/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, description })
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testTransactions() {
  console.log('\n📝 Testing Get Transactions...');
  const result = await apiCall('/transactions');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testInvalidDeposit() {
  console.log('\n❌ Testing Invalid Deposit (negative amount)...');
  const result = await apiCall('/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount: -100, description: 'Invalid deposit' })
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testInsufficientFunds() {
  console.log('\n❌ Testing Insufficient Funds...');
  const result = await apiCall('/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount: 10000, description: 'Large withdrawal' })
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Ledger API Tests...\n');
  
  await testHealth();
  await testBalance();
  
  // Test deposits
  await testDeposit(500, 'Salary payment');
  await testDeposit(200, 'Freelance work');
  
  // Test withdrawals
  await testWithdraw(100, 'Grocery shopping');
  await testWithdraw(50, 'Coffee and lunch');
  
  // Check balance after transactions
  await testBalance();
  
  // Get transaction history
  await testTransactions();
  
  // Test error cases
  await testInvalidDeposit();
  await testInsufficientFunds();
  
  console.log('\n✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealth,
  testBalance,
  testDeposit,
  testWithdraw,
  testTransactions,
  testInvalidDeposit,
  testInsufficientFunds
};
