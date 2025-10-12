import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

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
    
    const result = await pool.query(
      `SELECT id, email, phone, login_method, created_at 
       FROM users 
       WHERE email = $1 OR phone = $1 
       LIMIT 1`,
      [identifier]
    );
    
    return Response.json({ user: result.rows[0] || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
