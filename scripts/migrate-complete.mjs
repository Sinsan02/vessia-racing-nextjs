#!/usr/bin/env node

/**
 * Komplett SQLite til PostgreSQL migrering for API routes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Finn alle TypeScript filer i API folder
const apiDir = path.join(__dirname, '../src/app/api');

function findTSFiles(dir) {
  const files = [];
  
  function searchDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  searchDir(dir);
  return files;
}

function migrateAPIFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;
  
  // 1. Erstatt imports
  if (content.includes("import Database from 'better-sqlite3'")) {
    content = content.replace(
      /import Database from 'better-sqlite3';[\r\n]/g,
      ''
    );
    content = content.replace(
      /import jwt from 'jsonwebtoken';[\r\n]/g,
      "import jwt from 'jsonwebtoken';\nimport { dbQuery, dbGet, dbRun, initializeTables } from '@/lib/database';\n"
    );
    modified = true;
  }
  
  // 2. Fjern db path deklarasjoner
  content = content.replace(/const dbPath = path\.join\(process\.cwd\(\), '[^']+'\);[\r\n]/g, '');
  content = content.replace(/import path from 'path';[\r\n]/g, '');
  
  // 3. Erstatt Database operasjoner
  // Erstatt db.prepare(...).get() med dbGet()
  content = content.replace(
    /const db = new Database\(dbPath\);[\r\n\s]*const (\w+) = db\.prepare\('([^']+)'\)\.get\(([^)]+)\)/g,
    'const $1 = await dbGet(`$2`, [$3])'
  );
  
  content = content.replace(
    /db\.prepare\('([^']+)'\)\.get\(([^)]+)\)/g,
    'await dbGet(`$1`, [$2])'
  );
  
  // Erstatt db.prepare(...).all() med dbQuery()
  content = content.replace(
    /db\.prepare\('([^']+)'\)\.all\(([^)]*)\)/g,
    'await dbQuery(`$1`, [$2])'
  );
  
  content = content.replace(
    /db\.prepare\(`([^`]+)`\)\.all\(\)/g,
    'await dbQuery(`$1`)'
  );
  
  // Erstatt db.prepare(...).run() med dbRun()
  content = content.replace(
    /db\.prepare\('([^']+)'\)\.run\(([^)]+)\)/g,
    'await dbRun(`$1`, [$2])'
  );
  
  content = content.replace(
    /db\.prepare\(`([^`]+)`\)\.run\(([^)]*)\)/g,
    'await dbRun(`$1`, [$2])'
  );
  
  // 4. Fjern db.close() calls
  content = content.replace(/db\.close\(\);[\r\n\s]*/g, '');
  
  // 5. Legg til initializeTables() i GET requests
  if (content.includes('export async function GET')) {
    content = content.replace(
      /(export async function GET[^{]*{[\r\n\s]*try {)/g,
      '$1\n    await initializeTables(); // Ensure tables exist\n'
    );
  }
  
  // 6. Konverter ? til $1, $2, etc. i query strings
  content = content.replace(/(`[^`]*`)/g, (match) => {
    let paramCounter = 0;
    return match.replace(/\?/g, () => {
      paramCounter++;
      return `$${paramCounter}`;
    });
  });
  
  // 7. Gjør funksjoner async
  content = content.replace(
    /export async function (GET|POST|PUT|DELETE)/g,
    'export async function $1'
  );
  
  // 8. PostgreSQL spesifikke endringer
  content = content.replace(/lastInsertRowid/g, 'lastID');
  content = content.replace(/SQLITE_CONSTRAINT_UNIQUE/g, '23505');
  content = content.replace(/result\.lastInsertRowid/g, 'result.lastID');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

// Kjør migrering
console.log('🚀 Starting comprehensive SQLite to PostgreSQL migration...');

const files = findTSFiles(apiDir);
console.log(`Found ${files.length} TypeScript files`);

let migratedCount = 0;

for (const file of files) {
  if (migrateAPIFile(file)) {
    migratedCount++;
  }
}

console.log(`✅ Migration completed! Migrated ${migratedCount} files.`);