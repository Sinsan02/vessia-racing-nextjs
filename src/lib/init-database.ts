import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'vessia-racing.db');

export function initDatabase() {
  const db = new Database(dbPath);
  
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
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
    )
  `);
  
  // Create leagues table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leagues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create driver_points table
  db.exec(`
    CREATE TABLE IF NOT EXISTS driver_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      races_completed INTEGER DEFAULT 0,
      race_position INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (driver_id) REFERENCES users(id)
    )
  `);
  
  // Create league_drivers table (many-to-many relationship)
  db.exec(`
    CREATE TABLE IF NOT EXISTS league_drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (league_id) REFERENCES leagues(id),
      FOREIGN KEY (driver_id) REFERENCES users(id),
      UNIQUE(league_id, driver_id)
    )
  `);
  
  // Create points_history table for tracking points changes
  db.exec(`
    CREATE TABLE IF NOT EXISTS points_history (
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
    )
  `);
  
  console.log('Database initialized successfully');
  db.close();
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
}