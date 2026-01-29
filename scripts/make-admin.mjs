#!/usr/bin/env node

/**
 * Script for å gjøre en bruker til admin
 */

import { Pool } from 'pg';

const DATABASE_URL = 'postgresql://neondb_owner:npg_91ULmisIhGRv@ep-misty-lake-ahhlcdx4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function makeAdmin(email) {
  const client = await pool.connect();
  try {
    // Finn brukeren
    const userResult = await client.query('SELECT id, full_name, email, role FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      console.error(`❌ Bruker med epost ${email} ikke funnet`);
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`👤 Funnet bruker: ${user.full_name} (${user.email})`);
    console.log(`📝 Nåværende rolle: ${user.role}`);
    
    if (user.role === 'admin') {
      console.log('✅ Bruker er allerede admin');
      return;
    }
    
    // Oppdater til admin
    await client.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', user.id]);
    
    console.log(`✅ ${user.full_name} er nå admin!`);
    
  } catch (error) {
    console.error('❌ Feil:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

const email = process.argv[2] || 'sindre.brendemo@outlook.com';
console.log(`🚀 Gjør ${email} til admin...`);

makeAdmin(email);