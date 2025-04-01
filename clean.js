const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const rmdir = promisify(fs.rm);

const cleanDirs = [
  '.next',
  'out',
  '.cache',
  'node_modules/.cache'
];

async function cleanup() {
  for (const dir of cleanDirs) {
    const fullPath = path.join(__dirname, dir);
    try {
      await rmdir(fullPath, { recursive: true, force: true });
      console.log(`Cleaned ${dir}`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error(`Error cleaning ${dir}:`, err);
      }
    }
  }
}

cleanup().catch(console.error);
