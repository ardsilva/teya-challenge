# Teya Challenge - Simple Ledger API 🏦

A simple ledger API built with Node.js and Express that allows you to record money movements (deposits and withdrawals), view current balance, and view transaction history.

## Features

- ✅ Record deposits and withdrawals
- ✅ View current balance
- ✅ View transaction history with pagination
- ✅ Get specific transaction details
- ✅ Health check endpoint
- ✅ Input validation and error handling
- ✅ CORS enabled for cross-origin requests

## Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Data Storage**: In-memory (arrays and variables)
- **Additional**: CORS middleware for cross-origin requests

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd teya-challenge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-restart)
   npm run dev
   ```

The server will start on `http://localhost:3000` by default. You can change the port by setting the `PORT` environment variable.

## API Endpoints

### Base URL
```
http://localhost:3000
```

### 1. Health Check
**GET** `/health`
- Check if the API is running
- **Response**: Status message and timestamp

### 2. Get Current Balance
**GET** `/balance`
- Get the current account balance
- **Response**: Current balance and currency

### 3. Get Transaction History
**GET** `/transactions`
- Get list of all transactions
- **Query Parameters**:
  - `limit` (optional): Number of transactions to return (default: 50)
  - `offset` (optional): Number of transactions to skip (default: 0)
- **Response**: Array of transactions with pagination info

### 4. Record a Deposit
**POST** `/deposit`
- Record a money deposit
- **Body**:
  ```json
  {
    "amount": 100.50,
    "description": "Salary payment" // optional
  }
  ```
- **Response**: Created transaction and new balance

### 5. Record a Withdrawal
**POST** `/withdraw`
- Record a money withdrawal
- **Body**:
  ```json
  {
    "amount": 25.00,
    "description": "Coffee purchase" // optional
  }
  ```
- **Response**: Created transaction and new balance

### 6. Get Specific Transaction
**GET** `/transactions/:id`
- Get details of a specific transaction by ID
- **Response**: Transaction details

## Usage Examples

### Using cURL

1. **Check API health**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Get current balance**:
   ```bash
   curl http://localhost:3000/balance
   ```

3. **Make a deposit**:
   ```bash
   curl -X POST http://localhost:3000/deposit \
     -H "Content-Type: application/json" \
     -d '{"amount": 1000, "description": "Initial deposit"}'
   ```

4. **Make a withdrawal**:
   ```bash
   curl -X POST http://localhost:3000/withdraw \
     -H "Content-Type: application/json" \
     -d '{"amount": 50, "description": "Grocery shopping"}'
   ```

5. **Get transaction history**:
   ```bash
   curl http://localhost:3000/transactions
   ```

6. **Get paginated transactions**:
   ```bash
   curl "http://localhost:3000/transactions?limit=5&offset=0"
   ```

### Using JavaScript/Fetch

```javascript
// Make a deposit
const depositResponse = await fetch('http://localhost:3000/deposit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 500,
    description: 'Freelance payment'
  })
});

const depositResult = await depositResponse.json();
console.log('New balance:', depositResult.newBalance);

// Get balance
const balanceResponse = await fetch('http://localhost:3000/balance');
const balanceResult = await balanceResponse.json();
console.log('Current balance:', balanceResult.balance);
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": "...",
  "message": "..." // optional
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Assumptions Made

1. **Currency**: All amounts are assumed to be in USD
2. **Precision**: Amounts are stored as floating-point numbers
3. **Data Persistence**: Data is stored in-memory and will be lost when the server restarts
4. **Transaction IDs**: Generated using timestamp + random string for uniqueness
5. **Validation**: Amounts must be positive numbers
6. **Withdrawals**: Cannot withdraw more than available balance
7. **Pagination**: Default limit of 50 transactions per page

## Error Handling

The API includes comprehensive error handling for:
- Invalid amounts (non-positive numbers)
- Insufficient funds for withdrawals
- Missing required fields
- Invalid transaction IDs
- General server errors

## Development

To run the server in development mode with auto-restart:
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## Testing the API

You can test all endpoints using tools like:
- cURL (command line)
- Postman
- Insomnia
- Browser (for GET requests)
- Any HTTP client

## Project Structure

```
teya-challenge/
├── server.js          # Main server file with all routes
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## Notes

- This is a simple implementation using in-memory storage
- Data will be lost when the server restarts
- No authentication or authorization is implemented
- No database is required - everything is stored in memory
- The API is designed to be simple and functional for demonstration purposes
