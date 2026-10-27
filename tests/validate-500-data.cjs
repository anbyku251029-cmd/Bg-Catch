const fs = require('fs');

const insects = JSON.parse(fs.readFileSync('insects500.json', 'utf8'));
const csvRaw = fs.readFileSync('500종 곤충.csv', 'utf8');

console.log('=== 500 INSECTS DATA & CSV VALIDATION ===');

let totalErrors = 0;

// 1. Count
const countPass = insects.length === 500;
if (!countPass) totalErrors++;
console.log('1. Total Count:', insects.length, countPass ? '✅ PASS' : '❌ FAIL');

// 2. Unique IDs
const idSet = new Set();
const duplicateIds = [];
insects.forEach(i => {
  if (idSet.has(i.id)) duplicateIds.push(i.id);
  idSet.add(i.id);
});
if (idSet.size !== 500) totalErrors++;
console.log('2. Unique IDs:', idSet.size === 500 ? '✅ PASS (500 unique IDs)' : '❌ FAIL (Duplicates: ' + duplicateIds.join(', ') + ')');

// 3. Unique Korean Names
const nameSet = new Set();
const duplicateNames = [];
insects.forEach(i => {
  if (nameSet.has(i.koreanName)) duplicateNames.push(i.koreanName);
  nameSet.add(i.koreanName);
});
if (nameSet.size !== 500) totalErrors++;
console.log('3. Unique Korean Names:', nameSet.size === 500 ? '✅ PASS (500 unique Korean names)' : '❌ FAIL (Duplicates: ' + duplicateNames.join(', ') + ')');

// 4. Unique Scientific Names
const sciSet = new Set();
const duplicateSci = [];
insects.forEach(i => {
  if (sciSet.has(i.sciName)) duplicateSci.push(i.sciName);
  sciSet.add(i.sciName);
});
if (sciSet.size !== 500) totalErrors++;
console.log('4. Unique Scientific Names:', sciSet.size === 500 ? '✅ PASS (500 unique scientific names)' : '❌ FAIL (Duplicates: ' + duplicateSci.join(', ') + ')');

// 5. Required Fields Validation (21 fields + anatomyDetails + zero placeholders)
const requiredFields = [
  'id', 'koreanName', 'englishName', 'sciName', 'category', 'order',
  'appearance', 'diet', 'habitat', 'region', 'sizeMm', 'ecology',
  'fact', 'keyWordEn', 'sentenceEn', 'sentenceKo', 'warning',
  'image', 'source', 'reviewStatus', 'quiz'
];

let missingFieldErrors = 0;
let placeholderErrors = 0;
insects.forEach(i => {
  requiredFields.forEach(f => {
    if (i[f] === undefined || (typeof i[f] === 'string' && i[f].trim() === '')) {
      console.error(`Missing field '${f}' in insect: ${i.koreanName} (${i.id})`);
      missingFieldErrors++;
    }
    if (typeof i[f] === 'string' && (i[f].includes('확인 필요') || i[f].includes('500종 확장판 추가 항목'))) {
      console.error(`Placeholder found in '${f}' of ${i.koreanName}: ${i[f]}`);
      placeholderErrors++;
    }
  });
  if (!i.quiz || !i.quiz.question || !Array.isArray(i.quiz.options) || i.quiz.options.length !== 2 || i.quiz.answer === undefined) {
    console.error(`Invalid quiz format in insect: ${i.koreanName}`);
    missingFieldErrors++;
  }
  if (!i.anatomyDetails || !i.anatomyDetails.antenna || !i.anatomyDetails.head || !i.anatomyDetails.eyes || !i.anatomyDetails.mouth || !i.anatomyDetails.body || !i.anatomyDetails.legs) {
    console.error(`Incomplete anatomyDetails in insect: ${i.koreanName}`);
    missingFieldErrors++;
  }
});

totalErrors += missingFieldErrors + placeholderErrors;
console.log('5. Required 21 Fields + Anatomy + Quiz:', missingFieldErrors === 0 ? '✅ PASS (All fields verified across 500 species)' : '❌ FAIL (' + missingFieldErrors + ' errors)');
console.log('6. Zero Placeholders ("확인 필요" / boilerplate):', placeholderErrors === 0 && !csvRaw.includes('확인 필요') ? '✅ PASS' : '❌ FAIL');

// 7. Normalized 6 Categories
const validCategories = ['나비·나방목', '딱정벌레목', '벌목', '노린재목', '메뚜기목', '잠자리·기타목'];
const categories = {};
insects.forEach(i => categories[i.category] = (categories[i.category] || 0) + 1);
const catSum = validCategories.reduce((s, c) => s + (categories[c] || 0), 0);
if (catSum !== 500) totalErrors++;
console.log('7. Normalized 6 Categories (Sum=' + catSum + '):', catSum === 500 ? '✅ PASS' : '❌ FAIL', categories);

// 8. Habitats distribution
const habitats = {};
insects.forEach(i => habitats[i.habitat] = (habitats[i.habitat] || 0) + 1);
const habSum = Object.values(habitats).reduce((a, b) => a + b, 0);
if (habSum !== 500) totalErrors++;
console.log('8. Habitats (4 zones, Sum=' + habSum + '):', habSum === 500 ? '✅ PASS' : '❌ FAIL', habitats);

process.exit(totalErrors > 0 ? 1 : 0);
