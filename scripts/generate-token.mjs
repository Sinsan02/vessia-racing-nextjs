import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full',
});

// Find admin user and generate token
const client = await pool.connect();
try {
  const result = await client.query('SELECT id, email, role FROM users WHERE role = $1 LIMIT 1', ['admin']);
  
  if (result.rows.length > 0) {
    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Admin user found:', user);
    console.log('New token:', token);
  } else {
    console.log('No admin user found');
  }
} finally {
  client.release();
  await pool.end();
}