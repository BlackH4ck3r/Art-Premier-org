import { put } from '@vercel/blob';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    
    // Validate inputs
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upload to Vercel Blob
    const blob = await put(`user-${userId}-${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    // Store in database
    const dbResult = await pool.query(
      `INSERT INTO user_files (user_id, file_name, file_type, file_size, blob_url, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, file.name, file.type, file.size, blob.url, new Date()]
    );

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      fileName: file.name,
      fileId: dbResult.rows[0].id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
