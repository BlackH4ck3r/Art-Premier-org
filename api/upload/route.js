import { put } from '@vercel/blob';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    
    if (!file || !userId) {
      return Response.json({ error: 'File and userId are required' }, { status: 400 });
    }

    // Upload file to Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Store file info in Neon database
    await pool.query(
      `INSERT INTO user_files (user_id, file_name, file_type, file_size, blob_url, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, file.name, file.type, file.size, blob.url, new Date()]
    );

    return Response.json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      fileName: file.name
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
