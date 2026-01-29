import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full',
});

// Check all users and their roles
const client = await pool.connect();
try {
  const result = await client.query('SELECT id, full_name, email, role FROM users ORDER BY id');
  console.log('All users:');
  result.rows.forEach(user => {
    console.log(`ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}, Role: ${user.role}`);
  });
} catch (error) {
  console.error('Error:', error);
} finally {
  client.release();
  await pool.end();
}