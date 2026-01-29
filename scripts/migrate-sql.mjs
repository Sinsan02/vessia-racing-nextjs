#!/usr/bin/env node

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

// SQLite til PostgreSQL migrerings-map
const migrations = {
  // SQLite datetime functions til PostgreSQL
  "datetime('now')": "CURRENT_TIMESTAMP",
  "DATETIME('now')": "CURRENT_TIMESTAMP",
  
  // Parameterized queries ($1, $2 istedenfor ?)
  // Dette må håndteres separat per fil siden det avhenger av antall parametere
};

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Erstatt datetime functions
  for (const [sqlite, postgres] of Object.entries(migrations)) {
    if (content.includes(sqlite)) {
      content = content.replace(new RegExp(sqlite, 'g'), postgres);
      modified = true;
    }
  }
  
  // Konverter ? til $1, $2, etc.
  content = content.replace(/(\`[^`]*\`)/g, (match, quotedString) => {
    let paramCounter = 0;
    return quotedString.replace(/\?/g, () => {
      paramCounter++;
      return `$${paramCounter}`;
    });
  });
  
  if (content !== fs.readFileSync(filePath, 'utf8')) {
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated: ${path.relative(process.cwd(), filePath)}`);
  }
}

// Kjør migrering
console.log('🚀 Starting SQLite to PostgreSQL migration...');

const files = findTSFiles(apiDir);
console.log(`Found ${files.length} TypeScript files`);

for (const file of files) {
  migrateFile(file);
}

console.log('✅ Migration completed!');