import sqlite3 from 'sqlite3';
import path from 'path';

// Initialize SQLite database
// In production, use a persistent database solution like PlanetScale or Supabase
const isDevelopment = process.env.NODE_ENV !== 'production';
const dbPath = isDevelopment 
  ? path.join(process.cwd(), 'vessia-racing.db')
  : '/tmp/vessia-racing.db'; // Temporary storage for serverless

let db: sqlite3.Database;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath);
    
    // Initialize tables if they don't exist (important for serverless)
    if (!isDevelopment) {
      initializeTables();
    }
  }
  return db;
}

function initializeTables() {
  // This ensures tables exist in serverless environment
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      gamertag TEXT UNIQUE,
      experience_level TEXT DEFAULT 'beginner',
      role TEXT DEFAULT 'user',
      is_driver INTEGER DEFAULT 0,
      bio TEXT,
      profile_picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS leagues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS driver_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      races_completed INTEGER DEFAULT 0,
      race_position INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (driver_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS league_drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (driver_id) REFERENCES users(id),
      UNIQUE(league_id, driver_id)
    )`,
    `CREATE TABLE IF NOT EXISTS points_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES users(id),
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (admin_id) REFERENCES users(id)
    )`
  ];
  
  tables.forEach(tableSQL => {
    db.exec(tableSQL);
  });
}

// Promisify database operations
export const dbQuery = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const dbRun = (sql: string, params: any[] = []): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export default getDatabase();