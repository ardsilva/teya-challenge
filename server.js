const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage
let transactions = [];
let balance = 0;

// Helper function to generate transaction ID
const generateTransactionId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Helper function to validate amount
const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

// Routes

// GET /balance - Get current balance
app.get('/balance', (req, res) => {
  res.json({
    success: true,
    balance: balance,
    currency: 'USD'
  });
});

// GET /transactions - Get transaction history
app.get('/transactions', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  
  const limitedTransactions = transactions
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
    .map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      timestamp: transaction.timestamp
    }));

  res.json({
    success: true,
    transactions: limitedTransactions,
    total: transactions.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// POST /deposit - Record a deposit
app.post('/deposit', (req, res) => {
  const { amount, description = 'Deposit' } = req.body;

  if (!amount || !validateAmount(amount)) {
    return res.status(400).json({
      success: false,
      error: 'Valid amount is required (must be a positive number)'
    });
  }

  const numAmount = parseFloat(amount);
  const transaction = {
    id: generateTransactionId(),
    type: 'deposit',
    amount: numAmount,
    description,
    timestamp: new Date().toISOString()
  };

  transactions.push(transaction);
  balance += numAmount;

  res.status(201).json({
    success: true,
    transaction,
    newBalance: balance
  });
});

// POST /withdraw - Record a withdrawal
app.post('/withdraw', (req, res) => {
  const { amount, description = 'Withdrawal' } = req.body;

  if (!amount || !validateAmount(amount)) {
    return res.status(400).json({
      success: false,
      error: 'Valid amount is required (must be a positive number)'
    });
  }

  const numAmount = parseFloat(amount);

  if (numAmount > balance) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient funds'
    });
  }

  const transaction = {
    id: generateTransactionId(),
    type: 'withdrawal',
    amount: numAmount,
    description,
    timestamp: new Date().toISOString()
  };

  transactions.push(transaction);
  balance -= numAmount;

  res.status(201).json({
    success: true,
    transaction,
    newBalance: balance
  });
});

// GET /transactions/:id - Get specific transaction
app.get('/transactions/:id', (req, res) => {
  const { id } = req.params;
  const transaction = transactions.find(t => t.id === id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found'
    });
  }

  res.json({
    success: true,
    transaction
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ledger API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Ledger API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Balance: http://localhost:${PORT}/balance`);
  console.log(`📝 Transactions: http://localhost:${PORT}/transactions`);
});
