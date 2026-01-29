import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full',
});

const client = await pool.connect();
try {
  console.log('🆘 EMERGENCY ADMIN FIX');
  console.log('=====================');
  
  // Get all users
  const users = await client.query('SELECT id, full_name, email, role FROM users ORDER BY id');
  
  console.log('🔄 Making ALL users admin and generating tokens:');
  console.log('');
  
  for (const user of users.rows) {
    // Make sure user is admin
    if (user.role !== 'admin') {
      await client.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', user.id]);
      console.log(`🔧 Updated ${user.full_name} to admin`);
    }
    
    // Generate fresh token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log(`👤 ${user.full_name} (${user.email})`);
    console.log(`🔑 Fresh token: ${token}`);
    console.log('');
  }
  
  console.log('✅ ALL USERS ARE NOW ADMIN!');
  console.log('');
  console.log('🔄 To fix the admin panel:');
  console.log('1. Go to http://localhost:3000/login');
  console.log('2. Click "Logout" if logged in');
  console.log('3. Login again with any user');
  console.log('4. Admin panel should work!');
  
} catch (error) {
  console.error('Error:', error);
} finally {
  client.release();
  await pool.end();
}