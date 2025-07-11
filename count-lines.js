const fs = require('fs');
const path = require('path');

function getAllTsFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return 0;
  }
}

// Get all TypeScript files in src directory
const tsFiles = getAllTsFiles('src');
let totalLines = 0;

console.log('Line counts for TypeScript files:');
console.log('==================================');

tsFiles.forEach(file => {
  const lines = countLines(file);
  totalLines += lines;
  console.log(`${lines.toString().padStart(4)} ${file}`);
});

console.log('==================================');
console.log(`${totalLines.toString().padStart(4)} total`);