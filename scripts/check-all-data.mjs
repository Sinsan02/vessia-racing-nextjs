import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full' 
});

const client = await pool.connect();
try {
  console.log('=== All Users ===');
  const users = await client.query('SELECT id, full_name, email, gamertag, is_driver, role FROM users ORDER BY id');
  users.rows.forEach(user => console.log('ID:', user.id, 'Name:', user.full_name, 'Email:', user.email, 'Gamertag:', user.gamertag, 'Is Driver:', user.is_driver, 'Role:', user.role));
  
  console.log('\n=== All Leagues ===');
  const leagues = await client.query('SELECT id, name, description FROM leagues ORDER BY id');
  leagues.rows.forEach(league => console.log('ID:', league.id, 'Name:', league.name, 'Description:', league.description));
  
  console.log('\n=== League Drivers ===');
  const leagueDrivers = await client.query('SELECT ld.league_id, ld.driver_id, u.full_name, u.gamertag, l.name as league_name FROM league_drivers ld JOIN users u ON ld.driver_id = u.id JOIN leagues l ON ld.league_id = l.id ORDER BY ld.league_id');
  if (leagueDrivers.rows.length === 0) {
    console.log('No drivers assigned to leagues');
  } else {
    leagueDrivers.rows.forEach(ld => console.log('League:', ld.league_name, 'Driver ID:', ld.driver_id, 'Name:', ld.full_name, 'Gamertag:', ld.gamertag));
  }
  
  console.log('\n=== Points ===');
  const points = await client.query('SELECT p.driver_id, p.league_id, p.points, p.races_completed, u.full_name, l.name as league_name FROM points p JOIN users u ON p.driver_id = u.id JOIN leagues l ON p.league_id = l.id ORDER BY p.league_id, p.points DESC');
  if (points.rows.length === 0) {
    console.log('No points recorded');
  } else {
    points.rows.forEach(p => console.log('League:', p.league_name, 'Driver:', p.full_name, 'Points:', p.points, 'Races:', p.races_completed));
  }
} finally {
  client.release(); 
  await pool.end();
}