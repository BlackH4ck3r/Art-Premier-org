import { Pool } from 'pg';
import { put } from '@vercel/blob';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// Handle all user-related operations
export async function POST(request) {
  try {
    const { email, phone, password, login_method } = await request.json();
    
    const result = await pool.query(
      `INSERT INTO users (email, phone, password, login_method, created_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, phone, login_method, created_at`,
      [email, phone, password, login_method, new Date()]
    );
    
    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    
    // Check if user exists by email/phone
    if (identifier && !action) {
      const result = await pool.query(
        `SELECT id, email, phone, login_method, created_at 
         FROM users 
         WHERE email = $1 OR phone = $1 
         LIMIT 1`,
        [identifier]
      );
      return Response.json({ user: result.rows[0] || null });
    }
    
    // Get user's uploaded files
    if (action === 'files' && userId) {
      const result = await pool.query(
        `SELECT id, file_name, file_type, file_size, blob_url, created_at 
         FROM user_files 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );
      return Response.json({ files: result.rows });
    }
    
    return Response.json({ error: 'Invalid request' }, { status: 400 });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
