import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full',
});

// Sjekk hvilken bruker som nylig logget inn
const client = await pool.connect();
try {
  console.log('🔍 CHECKING RECENT LOGIN ACTIVITY');
  console.log('==================================');
  
  // Get recent users (since login creates updated timestamps)
  const recentUsers = await client.query(`
    SELECT id, full_name, email, role, is_driver, 
           created_at, updated_at
    FROM users 
    ORDER BY updated_at DESC, created_at DESC
  `);
  
  console.log('👥 Recent users (by activity):');
  recentUsers.rows.forEach((user, index) => {
    const indicator = index === 0 ? '🔥 MOST RECENT' : `   ${index + 1}.`;
    console.log(`${indicator} ${user.full_name} (${user.email})`);
    console.log(`     Role: ${user.role}, Driver: ${user.is_driver ? 'Yes' : 'No'}`);
    console.log(`     Created: ${user.created_at}`);
    console.log(`     Updated: ${user.updated_at}`);
    console.log('');
  });
  
  // Check if the most recently active user has admin role
  const mostRecent = recentUsers.rows[0];
  if (mostRecent) {
    console.log('📋 LOGIN TROUBLESHOOTING:');
    if (mostRecent.role === 'admin') {
      console.log(`✅ ${mostRecent.full_name} HAS admin role in database`);
      console.log('🔄 Problem: JWT token in browser is outdated');
      console.log('💡 Solution: User must logout and login again');
    } else {
      console.log(`❌ ${mostRecent.full_name} does NOT have admin role`);
      console.log('🔧 Need to make this user admin first');
    }
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  client.release();
  await pool.end();
}