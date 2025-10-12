import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

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
