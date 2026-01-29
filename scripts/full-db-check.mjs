import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full',
});

// Comprehensive database check
const client = await pool.connect();
try {
  console.log('🔍 DATABASE CHECK FOR ADMIN PANEL');
  console.log('==================================');
  
  // Check all users
  const users = await client.query('SELECT id, full_name, email, role, is_driver, created_at FROM users ORDER BY id');
  console.log('\n📊 ALL USERS:');
  if (users.rows.length === 0) {
    console.log('❌ NO USERS FOUND!');
  } else {
    users.rows.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}, Role: ${user.role}, Driver: ${user.is_driver ? 'Yes' : 'No'}, Created: ${user.created_at}`);
    });
  }
  
  // Check leagues
  const leagues = await client.query('SELECT id, name, description, is_active, created_at FROM leagues ORDER BY id');
  console.log('\n🏆 ALL LEAGUES:');
  if (leagues.rows.length === 0) {
    console.log('❌ NO LEAGUES FOUND!');
  } else {
    leagues.rows.forEach(league => {
      console.log(`ID: ${league.id}, Name: ${league.name}, Description: ${league.description}, Active: ${league.is_active ? 'Yes' : 'No'}, Created: ${league.created_at}`);
    });
  }
  
  // Check drivers specifically
  const drivers = await client.query('SELECT id, full_name, email FROM users WHERE is_driver = 1 ORDER BY id');
  console.log('\n🏁 DRIVERS:');
  if (drivers.rows.length === 0) {
    console.log('❌ NO DRIVERS FOUND!');
  } else {
    drivers.rows.forEach(driver => {
      console.log(`Driver ID: ${driver.id}, Name: ${driver.full_name}, Email: ${driver.email}`);
    });
  }
  
  // Check admins specifically
  const admins = await client.query('SELECT id, full_name, email FROM users WHERE role = $1 ORDER BY id', ['admin']);
  console.log('\n👑 ADMINS:');
  if (admins.rows.length === 0) {
    console.log('❌ NO ADMINS FOUND!');
  } else {
    admins.rows.forEach(admin => {
      console.log(`Admin ID: ${admin.id}, Name: ${admin.full_name}, Email: ${admin.email}`);
    });
  }
  
  console.log('\n🔧 SUMMARY:');
  console.log(`Total Users: ${users.rows.length}`);
  console.log(`Total Drivers: ${drivers.rows.length}`);
  console.log(`Total Admins: ${admins.rows.length}`);
  console.log(`Total Leagues: ${leagues.rows.length}`);
  
} catch (error) {
  console.error('❌ Database Error:', error);
} finally {
  client.release();
  await pool.end();
}