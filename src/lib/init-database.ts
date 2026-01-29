import { initializeTables } from './database';

export async function initDatabase() {
  try {
    await initializeTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
}