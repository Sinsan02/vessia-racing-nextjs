#!/usr/bin/env node

/**
 * Fikser alle ? parametere til PostgreSQL $1, $2, etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function fixParameters(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Finn alle SQL queries med ? parametere og erstatt med $1, $2, etc.
  content = content.replace(/('[^']*'|`[^`]*`)/g, (match) => {
    let paramCounter = 0;
    return match.replace(/\?/g, () => {
      paramCounter++;
      return `$${paramCounter}`;
    });
  });
  
  // Spesielle tilfeller som ikke ble fanget opp
  content = content.replace(/datetime\('now'\)/g, 'CURRENT_TIMESTAMP');
  content = content.replace(/datetime\("now"\)/g, 'CURRENT_TIMESTAMP');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed parameters in: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

console.log('🚀 Fixing SQL parameter syntax...');

const files = findTSFiles(apiDir);
let fixedCount = 0;

for (const file of files) {
  if (fixParameters(file)) {
    fixedCount++;
  }
}

console.log(`✅ Fixed parameters in ${fixedCount} files.`);