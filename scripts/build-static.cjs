const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
fs.mkdirSync(distDir, { recursive: true });

// Copy index.html to dist/index.html
const indexSrc = path.join(rootDir, 'index.html');
const indexDest = path.join(distDir, 'index.html');
fs.copyFileSync(indexSrc, indexDest);
console.log(`Copied index.html -> dist/index.html (${fs.statSync(indexDest).size} bytes)`);

// Copy assets directory if present
const assetsSrc = path.join(rootDir, 'assets');
const assetsDest = path.join(distDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
  console.log('Copied assets directory to dist/assets');
}

// Copy JSON data files if present
['insects150.json', 'insects50.json', 'missions.json'].forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} -> dist/${file}`);
  }
});

console.log('Static site build complete! Ready for Vercel deployment.');
