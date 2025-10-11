const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create users table if not exists
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        phone VARCHAR(20),
        password VARCHAR(255),
        login_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table ready');
  } catch (error) {
    console.error('Table creation error:', error);
  }
};
createTable();

// API routes
app.post('/api/users', async (req, res) => {
  try {
    const { email, phone, password, loginMethod } = req.body;
    const result = await pool.query(
      'INSERT INTO users (email, phone, password, login_method) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, phone, password, loginMethod]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $1 LIMIT 1',
      [identifier]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = app;
