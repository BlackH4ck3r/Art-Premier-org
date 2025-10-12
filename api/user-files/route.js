import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const result = await pool.query(
      `SELECT id, file_name, file_type, file_size, blob_url, created_at 
       FROM user_files 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    return Response.json({ files: result.rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
