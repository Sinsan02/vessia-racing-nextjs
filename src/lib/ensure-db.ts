import { initializeTables } from './database';

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (!isInitialized && process.env.NODE_ENV === 'production') {
    try {
      await initializeTables();
      isInitialized = true;
      console.log('Database initialized in production');
    } catch (error) {
      console.error('Failed to initialize database in production:', error);
      throw error;
    }
  }
}