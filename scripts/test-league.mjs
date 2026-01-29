import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full',
});

// Test league creation directly
const client = await pool.connect();
try {
  // Test the INSERT RETURNING syntax
  const result = await client.query(
    'INSERT INTO leagues (name, description) VALUES ($1, $2) RETURNING id',
    ['Test League Direct', 'Direct test of league creation']
  );
  
  console.log('League created successfully:', result.rows[0]);
  console.log('Full result:', result);
  
  // Clean up - remove test league
  await client.query('DELETE FROM leagues WHERE name = $1', ['Test League Direct']);
  console.log('Test league cleaned up');
  
} catch (error) {
  console.error('Error in league creation:', error);
} finally {
  client.release();
  await pool.end();
}