import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Handle CORS - ONLY CHANGE THIS PART
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // KEEP YOUR ORIGINAL FIELDS
      const { email, phone, password, loginMethod } = req.body;
      
      // Create table if not exists - KEEP ORIGINAL
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
      
      // KEEP ORIGINAL QUERY
      const result = await pool.query(
        'INSERT INTO users (email, phone, password, login_method) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, phone, password, loginMethod]
      );
      
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
