import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full' 
});

const client = await pool.connect();
try {
  console.log('Adding Sindre (user ID 1) to CSL Academy league (league ID 1)...');
  
  // Check if already exists in league_drivers
  const existingLeagueDriver = await client.query(
    'SELECT * FROM league_drivers WHERE league_id = $1 AND driver_id = $2',
    [1, 1]
  );
  
  if (existingLeagueDriver.rows.length === 0) {
    await client.query(
      'INSERT INTO league_drivers (league_id, driver_id) VALUES ($1, $2)',
      [1, 1]
    );
    console.log('✅ Added to league_drivers');
  } else {
    console.log('✅ Already in league_drivers');
  }
  
  // Check if already exists in driver_points
  const existingDriverPoints = await client.query(
    'SELECT * FROM driver_points WHERE league_id = $1 AND driver_id = $2',
    [1, 1]
  );
  
  if (existingDriverPoints.rows.length === 0) {
    await client.query(
      'INSERT INTO driver_points (league_id, driver_id, points, races_completed) VALUES ($1, $2, $3, $4)',
      [1, 1, 0, 0]
    );
    console.log('✅ Added to driver_points');
  } else {
    console.log('✅ Already in driver_points');
  }
  
  console.log('✅ Successfully added Sindre to CSL Academy league');
  
  // Verify the additions
  console.log('\nVerifying additions:');
  const leagueDrivers = await client.query('SELECT * FROM league_drivers');
  console.log('League drivers:', leagueDrivers.rows);
  
  const driverPoints = await client.query('SELECT * FROM driver_points');
  console.log('Driver points:', driverPoints.rows);
  
} catch (error) {
  console.error('Error:', error);
} finally {
  client.release(); 
  await pool.end();
}