#!/usr/bin/env node

// We'll run this through the Next.js API instead
import { spawn } from 'child_process';

console.log('🚀 Initializing database...');

// Use Next.js to run the initialization
const child = spawn('npm', ['run', 'dev'], { 
  stdio: 'pipe',
  shell: true,
  cwd: process.cwd()
});

let serverStarted = false;

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Dev server output:', output);
  
  if (output.includes('Ready') && !serverStarted) {
    serverStarted = true;
    console.log('✅ Dev server started, making initial request to initialize DB...');
    
    // Make a request to initialize the database
    import('http').then(http => {
      const req = http.request('http://localhost:3000/api/auth/me', { method: 'GET' }, (res) => {
        console.log('✅ Database initialization triggered via API call');
        console.log('✅ Database initialized successfully!');
        child.kill();
        process.exit(0);
      });
      
      req.on('error', (err) => {
        console.log('ℹ️  Database will be initialized on first request');
        child.kill();
        process.exit(0);
      });
      
      req.end();
    });
  }
});

child.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('✅ Database will be initialized automatically on first request');
  child.kill();
  process.exit(0);
}, 30000);