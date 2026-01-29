import { Pool } from 'pg';

// PostgreSQL connection - optimized for Vercel serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // Limit connections for serverless
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  allowExitOnIdle: true, // Important for serverless
});

export async function getDatabase() {
  return pool;
}

// Initialize database tables
export async function initializeTables() {
  console.log('🔧 Initializing database tables...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await createTables(client);
    await client.query('COMMIT');
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function createTables(client: any) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      gamertag TEXT UNIQUE,
      experience_level TEXT DEFAULT 'beginner',
      role TEXT DEFAULT 'user',
      is_driver INTEGER DEFAULT 0,
      bio TEXT,
      profile_picture TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS leagues (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS driver_points (
      id SERIAL PRIMARY KEY,
      league_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      races_completed INTEGER DEFAULT 0,
      race_position INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (driver_id) REFERENCES users(id),
      UNIQUE(driver_id, league_id)
    )`,
    `CREATE TABLE IF NOT EXISTS league_drivers (
      id SERIAL PRIMARY KEY,
      league_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (driver_id) REFERENCES users(id),
      UNIQUE(league_id, driver_id)
    )`,
    `CREATE TABLE IF NOT EXISTS points_history (
      id SERIAL PRIMARY KEY,
      driver_id INTEGER NOT NULL,
      league_id INTEGER NOT NULL,
      points_change INTEGER DEFAULT 0,
      races_change INTEGER DEFAULT 0,
      admin_id INTEGER,
      reason TEXT,
      old_points INTEGER DEFAULT 0,
      new_points INTEGER DEFAULT 0,
      old_races INTEGER DEFAULT 0,
      new_races INTEGER DEFAULT 0,
      action_type TEXT DEFAULT 'MANUAL',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES users(id),
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (admin_id) REFERENCES users(id)
    )`
  ];
  
  for (const tableSQL of tables) {
    await client.query(tableSQL);
  }
}

// Database query functions
export const dbQuery = async (sql: string, params: any[] = []): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export const dbRun = async (sql: string, params: any[] = []): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return { 
      lastID: result.rows.length > 0 ? result.rows[0].id : null,
      changes: result.rowCount,
      rows: result.rows
    };
  } finally {
    client.release();
  }
};

export const dbGet = async (sql: string, params: any[] = []): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};