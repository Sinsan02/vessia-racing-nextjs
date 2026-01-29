import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full',
});

// Test driver promotion logic
const client = await pool.connect();
try {
  // Get sindre's user info
  const user = await client.query('SELECT id, full_name, gamertag FROM users WHERE email = $1', ['sindre.brendemo@outlook.com']);
  
  if (user.rows.length > 0) {
    console.log('User found:', user.rows[0]);
    
    const userInfo = user.rows[0];
    const displayName = userInfo.gamertag || userInfo.full_name;
    
    console.log('Display name would be:', displayName);
  } else {
    console.log('User not found');
  }
} catch (error) {
  console.error('Error:', error);
} finally {
  client.release();
  await pool.end();
}