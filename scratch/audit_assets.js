import fs from 'fs';
import path from 'path';

const mappingPath = path.resolve('/Users/asifimrankhan/Documents/Projects/ReactNative/yumly/src/constants/recipe-images.ts');
const assetsDir = path.resolve('/Users/asifimrankhan/Documents/Projects/ReactNative/yumly/assets/images/recipes/');

const mappingContent = fs.readFileSync(mappingPath, 'utf8');
const files = fs.readdirSync(assetsDir);

console.log(`Checking ${files.length} images...`);

const unused = [];
const used = [];

files.forEach(file => {
  // Check if the filename is mentioned in the mapping file
  if (mappingContent.includes(file)) {
    used.push(file);
  } else {
    unused.push(file);
  }
});

console.log(`Used: ${used.length}`);
console.log(`Unused: ${unused.length}`);
console.log('Unused files:', unused);

// Optional: Output total size of unused files
let totalSize = 0;
unused.forEach(file => {
    const stats = fs.statSync(path.join(assetsDir, file));
    totalSize += stats.size;
});
console.log(`Potential space saving: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
