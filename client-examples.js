/**
 * Ledger Client Examples
 * Demonstrates how to use the LedgerClient library
 */

const LedgerClient = require('./ledger-client');

// Create a new client instance
const client = new LedgerClient('http://localhost:3000');

/**
 * Basic API Operations Examples
 */
async function basicOperations() {
  console.log('🚀 Basic API Operations Examples\n');

  try {
    // 1. Check API health
    console.log('1. Checking API health...');
    const health = await client.checkHealth();
    console.log('✅ Health check:', health.message);
    console.log('Timestamp:', health.timestamp);
    console.log('');

    // 2. Get current balance
    console.log('2. Getting current balance...');
    const balance = await client.getBalance();
    console.log(`💰 Current balance: $${balance.balance} ${balance.currency}`);
    console.log('');

    // 3. Make a deposit
    console.log('3. Making a deposit...');
    const deposit = await client.deposit(500, 'Salary payment');
    console.log(`📥 Deposit successful: $${deposit.transaction.amount}`);
    console.log(`📊 New balance: $${deposit.newBalance}`);
    console.log('');

    // 4. Make a withdrawal
    console.log('4. Making a withdrawal...');
    const withdrawal = await client.withdraw(100, 'Grocery shopping');
    console.log(`📤 Withdrawal successful: $${withdrawal.transaction.amount}`);
    console.log(`📊 New balance: $${withdrawal.newBalance}`);
    console.log('');

    // 5. Get transaction history
    console.log('5. Getting transaction history...');
    const transactions = await client.getTransactions({ limit: 5 });
    console.log(`📝 Found ${transactions.total} total transactions`);
    console.log(`📄 Showing ${transactions.transactions.length} recent transactions:`);
    
    transactions.transactions.forEach((tx, index) => {
      const type = tx.type === 'deposit' ? '📥' : '📤';
      const date = new Date(tx.timestamp).toLocaleString();
      console.log(`   ${index + 1}. ${type} $${tx.amount} - ${tx.description} (${date})`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error in basic operations:', error.message);
  }
}

/**
 * Advanced Operations Examples
 */
async function advancedOperations() {
  console.log('🔧 Advanced Operations Examples\n');

  try {
    // 1. Get account summary
    console.log('1. Getting account summary...');
    const summary = await client.getAccountSummary(3);
    console.log(`💰 Balance: $${summary.balance} ${summary.currency}`);
    console.log(`📊 Total transactions: ${summary.totalTransactions}`);
    console.log(`📝 Recent transactions: ${summary.recentTransactions.length}`);
    console.log('');

    // 2. Get transaction statistics
    console.log('2. Getting transaction statistics...');
    const stats = await client.getTransactionStats();
    console.log('📈 Transaction Statistics:');
    console.log(`   Total transactions: ${stats.totalTransactions}`);
    console.log(`   Deposits: ${stats.depositCount} ($${stats.totalDeposits.toFixed(2)})`);
    console.log(`   Withdrawals: ${stats.withdrawalCount} ($${stats.totalWithdrawals.toFixed(2)})`);
    console.log(`   Average deposit: $${stats.averageDeposit.toFixed(2)}`);
    console.log(`   Average withdrawal: $${stats.averageWithdrawal.toFixed(2)}`);
    console.log(`   Net flow: $${stats.netFlow.toFixed(2)}`);
    console.log('');

    // 3. Get specific transaction
    console.log('3. Getting specific transaction...');
    const transactions = await client.getTransactions({ limit: 1 });
    if (transactions.transactions.length > 0) {
      const firstTx = transactions.transactions[0];
      const specificTx = await client.getTransaction(firstTx.id);
      console.log(`📋 Transaction details for ${firstTx.id}:`);
      console.log(`   Type: ${specificTx.transaction.type}`);
      console.log(`   Amount: $${specificTx.transaction.amount}`);
      console.log(`   Description: ${specificTx.transaction.description}`);
      console.log(`   Date: ${new Date(specificTx.transaction.timestamp).toLocaleString()}`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error in advanced operations:', error.message);
  }
}

/**
 * Error Handling Examples
 */
async function errorHandlingExamples() {
  console.log('⚠️ Error Handling Examples\n');

  try {
    // 1. Try to deposit negative amount
    console.log('1. Trying to deposit negative amount...');
    try {
      await client.deposit(-100, 'Invalid deposit');
    } catch (error) {
      console.log('✅ Correctly caught error:', error.message);
    }
    console.log('');

    // 2. Try to withdraw more than balance
    console.log('2. Trying to withdraw more than available balance...');
    try {
      await client.withdraw(10000, 'Large withdrawal');
    } catch (error) {
      console.log('✅ Correctly caught error:', error.message);
    }
    console.log('');

    // 3. Try to get non-existent transaction
    console.log('3. Trying to get non-existent transaction...');
    try {
      await client.getTransaction('non-existent-id');
    } catch (error) {
      console.log('✅ Correctly caught error:', error.message);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

/**
 * Batch Operations Example
 */
async function batchOperations() {
  console.log('📦 Batch Operations Example\n');

  try {
    console.log('Performing batch operations...');
    
    // Perform multiple operations in parallel
    const operations = [
      client.deposit(200, 'Freelance payment'),
      client.deposit(150, 'Side project'),
      client.withdraw(75, 'Restaurant'),
      client.withdraw(25, 'Coffee')
    ];

    const results = await Promise.all(operations);
    
    console.log('✅ Batch operations completed:');
    results.forEach((result, index) => {
      const operation = operations[index];
      const type = result.transaction.type === 'deposit' ? '📥' : '📤';
      console.log(`   ${index + 1}. ${type} $${result.transaction.amount} - ${result.transaction.description}`);
    });

    // Get final balance
    const finalBalance = await client.getBalance();
    console.log(`\n💰 Final balance: $${finalBalance.balance}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error in batch operations:', error.message);
  }
}

/**
 * Real-world Usage Example
 */
async function realWorldExample() {
  console.log('🌍 Real-world Usage Example\n');

  try {
    console.log('Simulating a typical day of transactions...\n');

    // Morning routine
    console.log('🌅 Morning:');
    await client.deposit(1000, 'Salary deposit');
    await client.withdraw(15, 'Breakfast');
    await client.withdraw(5, 'Coffee');
    console.log('   ✅ Morning transactions completed\n');

    // Afternoon activities
    console.log('🌞 Afternoon:');
    await client.withdraw(25, 'Lunch');
    await client.deposit(200, 'Freelance payment');
    await client.withdraw(50, 'Gas station');
    console.log('   ✅ Afternoon transactions completed\n');

    // Evening activities
    console.log('🌙 Evening:');
    await client.withdraw(80, 'Dinner');
    await client.withdraw(30, 'Movie tickets');
    await client.deposit(150, 'Consulting fee');
    console.log('   ✅ Evening transactions completed\n');

    // Get daily summary
    console.log('📊 Daily Summary:');
    const summary = await client.getAccountSummary(10);
    const stats = await client.getTransactionStats();
    
    console.log(`   Starting balance: $${summary.balance - stats.netFlow}`);
    console.log(`   Ending balance: $${summary.balance}`);
    console.log(`   Net change: $${stats.netFlow.toFixed(2)}`);
    console.log(`   Total transactions today: ${summary.recentTransactions.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error in real-world example:', error.message);
  }
}

/**
 * Main function to run all examples
 */
async function runAllExamples() {
  console.log('🎯 Ledger Client Examples\n');
  console.log('=' .repeat(50));

  await basicOperations();
  console.log('=' .repeat(50));

  await advancedOperations();
  console.log('=' .repeat(50));

  await errorHandlingExamples();
  console.log('=' .repeat(50));

  await batchOperations();
  console.log('=' .repeat(50));

  await realWorldExample();
  console.log('=' .repeat(50));

  console.log('🎉 All examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  basicOperations,
  advancedOperations,
  errorHandlingExamples,
  batchOperations,
  realWorldExample,
  runAllExamples
};
