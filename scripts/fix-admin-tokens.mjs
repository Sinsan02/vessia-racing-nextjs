import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full',
});

// Generate new tokens for all admin users
const client = await pool.connect();
try {
  const users = await client.query('SELECT id, full_name, email, role FROM users WHERE role = $1', ['admin']);
  console.log('Generating new admin tokens:');
  console.log('');
  
  for (const user of users.rows) {
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log(`👤 ${user.full_name} (${user.email})`);
    console.log(`🔑 Token: ${token}`);
    console.log('');
  }
  
  console.log('📋 For å fikse admin panelet:');
  console.log('1. Gå til /login siden');
  console.log('2. Logg ut hvis du er innlogget');
  console.log('3. Logg inn på nytt med din admin bruker');
  console.log('4. Admin panelet burde nå fungere!');
  
} catch (error) {
  console.error('Error:', error);
} finally {
  client.release();
  await pool.end();
}