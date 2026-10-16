const fs = require('fs');

const insects150 = JSON.parse(fs.readFileSync('insects150.json', 'utf8'));

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update static UI texts (50종 -> 150종)
html = html.replace('PHASE 2 도감 50종', '도감 150종');
html = html.replace('<span id="header-catch-count" class="brand-badge">0/50</span>', '<span id="header-catch-count" class="brand-badge">0/150</span>');
html = html.replace('📖 곤충 도감 (50종)', '📖 곤충 도감 (150종)');
html = html.replace('0 / 50종 발견 (0%)', '0 / 150종 발견 (0%)');
html = html.replace('전체 (50종)', '전체 (150종)');

// 2. Replace INSECTS_50 array
const startMarker = '      const INSECTS_50 = [';
const endMarker = '      // Map by ID for quick O(1) lookup';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  throw new Error('Markers not found: startIdx=' + startIdx + ', endIdx=' + endIdx);
}

const formattedInsects = JSON.stringify(insects150, null, 2);
const newInsectsCode = `      const INSECTS_50 = ${formattedInsects};\n\n`;

html = html.slice(0, startIdx) + newInsectsCode + html.slice(endIdx);

// 3. Update INSECTS_MAP & CREATURES population
const oldMapCode = `      // Map by ID for quick O(1) lookup\n      const INSECTS_MAP = {};\n      INSECTS_50.forEach(i => { INSECTS_MAP[i.id] = i; });`;

const newMapCode = `      // Map by ID for quick O(1) lookup & CREATURES auto-registration (150종)
      const INSECTS_MAP = {};
      INSECTS_50.forEach(i => {
        INSECTS_MAP[i.id] = i;
        if (!CREATURES[i.id]) {
          CREATURES[i.id] = {
            id: i.id,
            koreanName: i.koreanName,
            englishName: i.englishName,
            sciName: i.sciName,
            category: i.category,
            isSpider: false,
            legCount: 6,
            zone: i.habitat === '꽃밭' ? 'meadow' : i.habitat === '연못 주변' ? 'floor' : i.habitat === '풀밭' ? 'jungle' : 'oak',
            sizeMm: i.sizeMm,
            rulerPercent: Math.min(100, Math.max(20, parseInt(i.sizeMm) || 50)),
            gaugeSpeed: 1.0,
            catchWidth: 30,
            rarity: '자연의 친구 ★★★',
            region: i.region || '한국 전역',
            appearance: i.appearance,
            habitat: i.habitat,
            diet: i.diet,
            fact: i.fact,
            nameOriginTip: '',
            exampleSentenceEn: i.sentenceEn,
            exampleSentenceKo: i.sentenceKo,
            ttsKo: \`\${i.koreanName}! \${i.appearance} \${i.fact}\`,
            anatomy: {
              all: (i.anatomyDetails && i.anatomyDetails.body) ? \`\${i.appearance} (\${i.anatomyDetails.body})\` : i.appearance,
              head: (i.anatomyDetails && i.anatomyDetails.head) ? i.anatomyDetails.head : (i.anatomyDetails && i.anatomyDetails.antenna ? i.anatomyDetails.antenna : \`\${i.koreanName}의 머리와 감각기관이에요.\`),
              thorax: (i.anatomyDetails && i.anatomyDetails.legs) ? \`\${i.anatomyDetails.legs} \${i.anatomyDetails.body || ''}\` : \`\${i.koreanName}의 가슴과 6개의 다리예요.\`,
              abdomen: (i.anatomyDetails && i.anatomyDetails.body) ? i.anatomyDetails.body : \`\${i.koreanName}의 배마디예요.\`
            },
            quiz: i.quiz
          };
        }
      });`;

html = html.replace(oldMapCode, newMapCode);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with 150 insects!');
