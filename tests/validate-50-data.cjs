const fs = require('fs');

const insects = JSON.parse(fs.readFileSync('insects50.json', 'utf8'));

console.log('=== 50 INSECTS DATA VALIDATION ===');

// 1. Count
console.log('1. Total Count:', insects.length, insects.length === 50 ? '✅ PASS' : '❌ FAIL');

// 2. Unique IDs
const idSet = new Set();
const duplicateIds = [];
insects.forEach(i => {
  if (idSet.has(i.id)) duplicateIds.push(i.id);
  idSet.add(i.id);
});
console.log('2. Unique IDs:', idSet.size === 50 ? '✅ PASS' : '❌ FAIL (Duplicates: ' + duplicateIds.join(', ') + ')');

// 3. Unique Korean Names
const nameSet = new Set();
const duplicateNames = [];
insects.forEach(i => {
  if (nameSet.has(i.koreanName)) duplicateNames.push(i.koreanName);
  nameSet.add(i.koreanName);
});
console.log('3. Unique Korean Names:', nameSet.size === 50 ? '✅ PASS' : '❌ FAIL (Duplicates: ' + duplicateNames.join(', ') + ')');

// 4. Unique Scientific Names
const sciSet = new Set();
const duplicateSci = [];
insects.forEach(i => {
  if (sciSet.has(i.sciName)) duplicateSci.push(i.sciName);
  sciSet.add(i.sciName);
});
console.log('4. Unique Scientific Names:', sciSet.size === 50 ? '✅ PASS' : '❌ FAIL (Duplicates: ' + duplicateSci.join(', ') + ')');

// 5. Required Fields Validation
const requiredFields = [
  'id', 'koreanName', 'englishName', 'sciName', 'category', 'order',
  'appearance', 'diet', 'habitat', 'region', 'sizeMm', 'ecology',
  'fact', 'keyWordEn', 'sentenceEn', 'sentenceKo', 'warning',
  'image', 'source', 'reviewStatus', 'quiz'
];

let missingFieldErrors = 0;
insects.forEach(i => {
  requiredFields.forEach(f => {
    if (i[f] === undefined || i[f] === '') {
      console.error(`Missing field '${f}' in insect: ${i.id}`);
      missingFieldErrors++;
    }
  });
  if (!i.quiz || !i.quiz.question || !Array.isArray(i.quiz.options) || i.quiz.answer === undefined) {
    console.error(`Invalid quiz format in insect: ${i.id}`);
    missingFieldErrors++;
  }
});

console.log('5. Required Fields & Quiz:', missingFieldErrors === 0 ? '✅ PASS (All 21 fields verified)' : '❌ FAIL');

// 6. Category Breakdown
const catCounts = {};
insects.forEach(i => catCounts[i.category] = (catCounts[i.category] || 0) + 1);
console.log('6. Categories:');
for (const [cat, cnt] of Object.entries(catCounts)) {
  console.log(`   - ${cat}: ${cnt}종`);
}

// 7. Habitat Breakdown
const habCounts = {};
insects.forEach(i => habCounts[i.habitat] = (habCounts[i.habitat] || 0) + 1);
console.log('7. Habitats:');
for (const [hab, cnt] of Object.entries(habCounts)) {
  console.log(`   - ${hab}: ${cnt}종`);
}
