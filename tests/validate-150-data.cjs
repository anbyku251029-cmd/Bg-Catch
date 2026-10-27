const fs = require('fs');

const insects = JSON.parse(fs.readFileSync('insects150.json', 'utf8'));

console.log('=== 150 INSECTS DATA VALIDATION ===');

// 1. Count
console.log('1. Total Count:', insects.length, insects.length === 150 ? '✅ PASS' : '❌ FAIL');

// 2. Unique IDs
const idSet = new Set();
const duplicateIds = [];
insects.forEach(i => {
  if (idSet.has(i.id)) duplicateIds.push(i.id);
  idSet.add(i.id);
});
console.log('2. Unique IDs:', idSet.size === 150 ? '✅ PASS' : '❌ FAIL (Duplicates: ' + duplicateIds.join(', ') + ')');

// 3. Unique Korean Names
const nameSet = new Set();
const duplicateNames = [];
insects.forEach(i => {
  if (nameSet.has(i.koreanName)) duplicateNames.push(i.koreanName);
  nameSet.add(i.koreanName);
});
console.log('3. Unique Korean Names:', nameSet.size === 150 ? '✅ PASS' : '❌ FAIL (Duplicates: ' + duplicateNames.join(', ') + ')');

// 4. Unique Scientific Names
const sciSet = new Set();
const duplicateSci = [];
insects.forEach(i => {
  if (sciSet.has(i.sciName)) duplicateSci.push(i.sciName);
  sciSet.add(i.sciName);
});
console.log('4. Unique Scientific Names:', sciSet.size === 150 ? '✅ PASS' : '❌ FAIL (Duplicates: ' + duplicateSci.join(', ') + ')');

// 5. Required Fields Validation (21 fields)
const requiredFields = [
  'id', 'koreanName', 'englishName', 'sciName', 'category', 'order',
  'appearance', 'diet', 'habitat', 'region', 'sizeMm', 'ecology',
  'fact', 'keyWordEn', 'sentenceEn', 'sentenceKo', 'warning',
  'image', 'source', 'reviewStatus', 'quiz'
];

let missingFieldErrors = 0;
insects.forEach(i => {
  requiredFields.forEach(f => {
    if (i[f] === undefined || (typeof i[f] === 'string' && i[f].trim() === '')) {
      console.error(`Missing field '${f}' in insect: ${i.koreanName} (${i.id})`);
      missingFieldErrors++;
    }
  });
  if (!i.quiz || !i.quiz.question || !Array.isArray(i.quiz.options) || i.quiz.options.length !== 2 || i.quiz.answer === undefined) {
    console.error(`Invalid quiz format in insect: ${i.koreanName}`);
    missingFieldErrors++;
  }
});

console.log('5. Required Fields & Quiz:', missingFieldErrors === 0 ? '✅ PASS (All 21 fields verified across 150 species)' : '❌ FAIL (' + missingFieldErrors + ' errors)');

// 6. Habitats distribution
const habitats = {};
insects.forEach(i => habitats[i.habitat] = (habitats[i.habitat] || 0) + 1);
console.log('6. Habitats (4 zones):', habitats);
