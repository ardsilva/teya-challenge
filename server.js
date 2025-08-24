/**
 * @fileoverview Ledger API Server
 * A simple Express.js server that provides RESTful API endpoints for managing
 * a financial ledger with deposits, withdrawals, balance tracking, and transaction history.
 * 
 * @author Teya Challenge
 * @version 1.0.0
 * @since 2025-08-24
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage
/** @type {Array<Object>} Array to store all transactions */
let transactions = [];
/** @type {number} Current account balance */
let balance = 0;

/**
 * Generates a unique transaction ID using timestamp and random string
 * @returns {string} A unique transaction identifier
 * @example
 * const id = generateTransactionId(); // "17560602820235ni1fk1dl"
 */
const generateTransactionId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Validates if the provided amount is a valid positive number
 * @param {number|string} amount - The amount to validate
 * @returns {boolean} True if amount is valid, false otherwise
 * @example
 * validateAmount(100); // true
 * validateAmount(-50); // false
 * validateAmount("abc"); // false
 */
const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * @route GET /balance
 * @description Retrieves the current account balance
 * @returns {Object} JSON response with current balance and currency
 * @returns {boolean} returns.success - Always true for successful requests
 * @returns {number} returns.balance - Current account balance
 * @returns {string} returns.currency - Currency code (USD)
 * 
 * @example
 * // Request
 * GET /balance
 * 
 * // Response
 * {
 *   "success": true,
 *   "balance": 1250.50,
 *   "currency": "USD"
 * }
 */
app.get('/balance', (req, res) => {
  res.json({
    success: true,
    balance: balance,
    currency: 'USD'
  });
});

/**
 * @route GET /transactions
 * @description Retrieves transaction history with pagination support
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=50] - Maximum number of transactions to return
 * @param {number} [req.query.offset=0] - Number of transactions to skip
 * @returns {Object} JSON response with transactions and pagination info
 * @returns {boolean} returns.success - Always true for successful requests
 * @returns {Array<Object>} returns.transactions - Array of transaction objects
 * @returns {number} returns.total - Total number of transactions
 * @returns {number} returns.limit - Number of transactions returned
 * @returns {number} returns.offset - Number of transactions skipped
 * 
 * @example
 * // Request
 * GET /transactions?limit=10&offset=0
 * 
 * // Response
 * {
 *   "success": true,
 *   "transactions": [
 *     {
 *       "id": "17560602820235ni1fk1dl",
 *       "type": "deposit",
 *       "amount": 1000,
 *       "description": "Salary payment",
 *       "timestamp": "2025-08-24T18:31:22.023Z"
 *     }
 *   ],
 *   "total": 15,
 *   "limit": 10,
 *   "offset": 0
 * }
 */
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

/**
 * @route POST /deposit
 * @description Records a new deposit transaction
 * @param {Object} req.body - Request body
 * @param {number} req.body.amount - Amount to deposit (must be positive)
 * @param {string} [req.body.description="Deposit"] - Optional description for the deposit
 * @returns {Object} JSON response with created transaction and updated balance
 * @returns {boolean} returns.success - True if deposit was successful
 * @returns {Object} returns.transaction - The created transaction object
 * @returns {number} returns.newBalance - Updated account balance after deposit
 * 
 * @throws {400} If amount is missing, invalid, or not positive
 * 
 * @example
 * // Request
 * POST /deposit
 * {
 *   "amount": 500,
 *   "description": "Salary payment"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "transaction": {
 *     "id": "17560602820235ni1fk1dl",
 *     "type": "deposit",
 *     "amount": 500,
 *     "description": "Salary payment",
 *     "timestamp": "2025-08-24T18:31:22.023Z"
 *   },
 *   "newBalance": 1500
 * }
 */
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

/**
 * @route POST /withdraw
 * @description Records a new withdrawal transaction
 * @param {Object} req.body - Request body
 * @param {number} req.body.amount - Amount to withdraw (must be positive)
 * @param {string} [req.body.description="Withdrawal"] - Optional description for the withdrawal
 * @returns {Object} JSON response with created transaction and updated balance
 * @returns {boolean} returns.success - True if withdrawal was successful
 * @returns {Object} returns.transaction - The created transaction object
 * @returns {number} returns.newBalance - Updated account balance after withdrawal
 * 
 * @throws {400} If amount is missing, invalid, not positive, or exceeds available balance
 * 
 * @example
 * // Request
 * POST /withdraw
 * {
 *   "amount": 100,
 *   "description": "Grocery shopping"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "transaction": {
 *     "id": "17560602913735so21klfo",
 *     "type": "withdrawal",
 *     "amount": 100,
 *     "description": "Grocery shopping",
 *     "timestamp": "2025-08-24T18:31:31.373Z"
 *   },
 *   "newBalance": 1400
 * }
 */
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

/**
 * @route GET /transactions/:id
 * @description Retrieves a specific transaction by its ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Transaction ID to retrieve
 * @returns {Object} JSON response with the requested transaction
 * @returns {boolean} returns.success - True if transaction was found
 * @returns {Object} returns.transaction - The transaction object
 * 
 * @throws {404} If transaction with the specified ID is not found
 * 
 * @example
 * // Request
 * GET /transactions/17560602820235ni1fk1dl
 * 
 * // Response
 * {
 *   "success": true,
 *   "transaction": {
 *     "id": "17560602820235ni1fk1dl",
 *     "type": "deposit",
 *     "amount": 1000,
 *     "description": "Salary payment",
 *     "timestamp": "2025-08-24T18:31:22.023Z"
 *   }
 * }
 */
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

/**
 * @route GET /health
 * @description Health check endpoint to verify API is running
 * @returns {Object} JSON response with health status and timestamp
 * @returns {boolean} returns.success - Always true if API is running
 * @returns {string} returns.message - Health status message
 * @returns {string} returns.timestamp - Current server timestamp
 * 
 * @example
 * // Request
 * GET /health
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Ledger API is running",
 *   "timestamp": "2025-08-24T18:31:02.777Z"
 * }
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ledger API is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * @route *
 * @description 404 handler for undefined routes
 * @returns {Object} JSON response indicating endpoint not found
 * @returns {boolean} returns.success - Always false for 404 errors
 * @returns {string} returns.error - Error message
 * 
 * @example
 * // Request to undefined endpoint
 * GET /undefined-endpoint
 * 
 * // Response
 * {
 *   "success": false,
 *   "error": "Endpoint not found"
 * }
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

/**
 * @description Global error handler for unhandled exceptions
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object} JSON response with error message
 * @returns {boolean} returns.success - Always false for errors
 * @returns {string} returns.error - Generic error message
 * 
 * @example
 * // Response for unhandled errors
 * {
 *   "success": false,
 *   "error": "Internal server error"
 * }
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * @description Starts the Express server and logs available endpoints
 * @fires server:started - When server successfully starts
 * @example
 * // Server startup output
 * 🚀 Ledger API server running on port 3000
 * 📊 Health check: http://localhost:3000/health
 * 💰 Balance: http://localhost:3000/balance
 * 📝 Transactions: http://localhost:3000/transactions
 */
app.listen(PORT, () => {
  console.log(`🚀 Ledger API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Balance: http://localhost:${PORT}/balance`);
  console.log(`📝 Transactions: http://localhost:${PORT}/transactions`);
});
