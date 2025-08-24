/**
 * Ledger API Client
 * A JavaScript client library for interacting with the Teya Challenge Ledger API
 */

class LedgerClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  /**
   * Make an HTTP request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Check if the API is running
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    return this.request('/health');
  }

  /**
   * Get current account balance
   * @returns {Promise<Object>} Balance information
   */
  async getBalance() {
    return this.request('/balance');
  }

  /**
   * Get transaction history
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Number of transactions to return (default: 50)
   * @param {number} options.offset - Number of transactions to skip (default: 0)
   * @returns {Promise<Object>} Transaction history with pagination
   */
  async getTransactions(options = {}) {
    const { limit = 50, offset = 0 } = options;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    return this.request(`/transactions?${queryParams}`);
  }

  /**
   * Get a specific transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Transaction details
   */
  async getTransaction(transactionId) {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }
    return this.request(`/transactions/${transactionId}`);
  }

  /**
   * Record a deposit
   * @param {number} amount - Amount to deposit (must be positive)
   * @param {string} description - Optional description
   * @returns {Promise<Object>} Created transaction and new balance
   */
  async deposit(amount, description = 'Deposit') {
    if (!amount || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    return this.request('/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, description })
    });
  }

  /**
   * Record a withdrawal
   * @param {number} amount - Amount to withdraw (must be positive)
   * @param {string} description - Optional description
   * @returns {Promise<Object>} Created transaction and new balance
   */
  async withdraw(amount, description = 'Withdrawal') {
    if (!amount || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    return this.request('/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, description })
    });
  }

  /**
   * Get account summary (balance + recent transactions)
   * @param {number} transactionLimit - Number of recent transactions to include
   * @returns {Promise<Object>} Account summary
   */
  async getAccountSummary(transactionLimit = 5) {
    try {
      const [balance, transactions] = await Promise.all([
        this.getBalance(),
        this.getTransactions({ limit: transactionLimit })
      ]);

      return {
        success: true,
        balance: balance.balance,
        currency: balance.currency,
        recentTransactions: transactions.transactions,
        totalTransactions: transactions.total
      };
    } catch (error) {
      throw new Error(`Failed to get account summary: ${error.message}`);
    }
  }

  /**
   * Transfer money (withdrawal + deposit in sequence)
   * @param {number} amount - Amount to transfer
   * @param {string} description - Transfer description
   * @returns {Promise<Object>} Transfer result
   */
  async transfer(amount, description = 'Transfer') {
    if (!amount || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    try {
      // First withdraw the amount
      const withdrawal = await this.withdraw(amount, `Transfer out: ${description}`);
      
      // Then deposit it back (simulating a transfer)
      const deposit = await this.deposit(amount, `Transfer in: ${description}`);

      return {
        success: true,
        transferAmount: amount,
        description,
        withdrawal: withdrawal.transaction,
        deposit: deposit.transaction,
        finalBalance: deposit.newBalance
      };
    } catch (error) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  /**
   * Get transaction statistics
   * @returns {Promise<Object>} Transaction statistics
   */
  async getTransactionStats() {
    try {
      const transactions = await this.getTransactions({ limit: 1000 }); // Get all transactions
      const balance = await this.getBalance();

      const deposits = transactions.transactions.filter(t => t.type === 'deposit');
      const withdrawals = transactions.transactions.filter(t => t.type === 'withdrawal');

      const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
      const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);
      const averageDeposit = deposits.length > 0 ? totalDeposits / deposits.length : 0;
      const averageWithdrawal = withdrawals.length > 0 ? totalWithdrawals / withdrawals.length : 0;

      return {
        success: true,
        currentBalance: balance.balance,
        totalTransactions: transactions.total,
        totalDeposits,
        totalWithdrawals,
        depositCount: deposits.length,
        withdrawalCount: withdrawals.length,
        averageDeposit,
        averageWithdrawal,
        netFlow: totalDeposits - totalWithdrawals
      };
    } catch (error) {
      throw new Error(`Failed to get transaction stats: ${error.message}`);
    }
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LedgerClient;
}

// Export for browser
if (typeof window !== 'undefined') {
  window.LedgerClient = LedgerClient;
}
