const fs = require('fs');

const insects500 = JSON.parse(fs.readFileSync('insects500.json', 'utf8'));
let html = fs.readFileSync('index.html', 'utf8');

// Calculate exact category and habitat counts from insects500
const orderCounts = {
  Lepidoptera: insects500.filter(i => i.order === 'Lepidoptera').length,
  Coleoptera: insects500.filter(i => i.order === 'Coleoptera').length,
  Hymenoptera: insects500.filter(i => i.order === 'Hymenoptera').length,
  Hemiptera: insects500.filter(i => i.order === 'Hemiptera').length,
  Orthoptera: insects500.filter(i => i.order === 'Orthoptera').length,
  Others: insects500.filter(i => !['Lepidoptera', 'Coleoptera', 'Hymenoptera', 'Hemiptera', 'Orthoptera'].includes(i.order)).length
};

const habCounts = {
  oak: insects500.filter(i => i.habitat === '숲').length,
  meadow: insects500.filter(i => i.habitat === '꽃밭').length,
  floor: insects500.filter(i => i.habitat === '연못 주변').length,
  jungle: insects500.filter(i => i.habitat === '풀밭').length
};

// 1. Update static UI texts (150종 / 50종 / 10종 -> 500종)
html = html.replace('<span class="world-edition-badge">도감 150종</span>', '<span class="world-edition-badge">도감 500종</span>');
html = html.replace('<span id="header-catch-count" class="brand-badge">0/150</span>', '<span id="header-catch-count" class="brand-badge">0/500</span>');
html = html.replace('<span class="book-title">📖 곤충 도감 (150종)</span>', '<span class="book-title">📖 곤충 도감 (500종)</span>');
html = html.replace('<span id="book-count-pill" class="book-count-pill">0 / 150종 발견 (0%)</span>', '<span id="book-count-pill" class="book-count-pill">0 / 500종 발견 (0%)</span>');

// Update Zone Tab titles
html = html.replace('title="참나무 숲 (18종)"', `title="참나무 숲 (${habCounts.oak}종)"`);
html = html.replace('title="야생화 꽃밭 (10종)"', `title="야생화 꽃밭 (${habCounts.meadow}종)"`);
html = html.replace('title="연못 주변 (9종)"', `title="연못 주변 (${habCounts.floor}종)"`);
html = html.replace('title="풀밭 (13종)"', `title="풀밭 (${habCounts.jungle}종)"`);

// Update Book Filter Tab labels
const oldFilterBar = `        <!-- Filter tabs: All (50) + 6 Insect Orders -->
        <div class="book-filter-bar">
          <button class="btn-book-filter active" data-filter="all">전체 (150종)</button>
          <button class="btn-book-filter" data-filter="Lepidoptera">나비·나방목 (10)</button>
          <button class="btn-book-filter" data-filter="Coleoptera">딱정벌레목 (12)</button>
          <button class="btn-book-filter" data-filter="Hymenoptera">벌목 (7)</button>
          <button class="btn-book-filter" data-filter="Hemiptera">노린재목 (7)</button>
          <button class="btn-book-filter" data-filter="Orthoptera">메뚜기목 (6)</button>
          <button class="btn-book-filter" data-filter="Others">잠자리·기타 (8)</button>
        </div>`;

const newFilterBar = `        <!-- Filter tabs: All (500) + 6 Insect Orders -->
        <div class="book-filter-bar">
          <button class="btn-book-filter active" data-filter="all">전체 (${insects500.length}종)</button>
          <button class="btn-book-filter" data-filter="Lepidoptera">나비·나방목 (${orderCounts.Lepidoptera})</button>
          <button class="btn-book-filter" data-filter="Coleoptera">딱정벌레목 (${orderCounts.Coleoptera})</button>
          <button class="btn-book-filter" data-filter="Hymenoptera">벌목 (${orderCounts.Hymenoptera})</button>
          <button class="btn-book-filter" data-filter="Hemiptera">노린재목 (${orderCounts.Hemiptera})</button>
          <button class="btn-book-filter" data-filter="Orthoptera">메뚜기목 (${orderCounts.Orthoptera})</button>
          <button class="btn-book-filter" data-filter="Others">잠자리·기타 (${orderCounts.Others})</button>
        </div>`;

if (html.includes(oldFilterBar)) {
  html = html.replace(oldFilterBar, newFilterBar);
}

// Update Admin Modal button text
html = html.replace('✨ 테스트용 전체 해금 (10종 모두 채집)', '✨ 테스트용 전체 해금 (500종 모두 채집)');

// 2. Replace INSECTS_50 array with 500 validated insects
const startMarker = '      const INSECTS_50 = [';
const endMarker = '      // Map by ID for quick O(1) lookup';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  throw new Error('Markers not found: startIdx=' + startIdx + ', endIdx=' + endIdx);
}

const formattedInsects = JSON.stringify(insects500, null, 2);
const newInsectsCode = `      const INSECTS_50 = ${formattedInsects};\n      const INSECTS_500 = INSECTS_50;\n      window.INSECTS_50 = INSECTS_50;\n      window.INSECTS_500 = INSECTS_500;\n\n`;

html = html.slice(0, startIdx) + newInsectsCode + html.slice(endIdx);

// 3. Upgrade renderInsectSVG50 to support all 500 species with rich parametric color/pattern/morphology
const svgStartMarker = '      // Fallback / Parametric SVG Engine for all 50 insects';
const svgEndMarker = '      function renderInsectSVG(insectId, options = {}) {';
const svgStartIdx = html.indexOf(svgStartMarker);
const svgEndIdx = html.indexOf(svgEndMarker);

if (svgStartIdx === -1 || svgEndIdx === -1) {
  throw new Error('SVG markers not found: ' + svgStartIdx + ', ' + svgEndIdx);
}

const currentRenderInsectSVG50 = html.slice(svgStartIdx, svgEndIdx);
// Let's keep the dedicated 10 forest species at the top of renderInsectSVG50 and enhance the order-based parametric blocks
const order1Marker = '        // 1. 나비·나방류 (Lepidoptera)';
const order1Idx = currentRenderInsectSVG50.indexOf(order1Marker);
if (order1Idx === -1) {
  throw new Error('order1Marker not found in renderInsectSVG50');
}

const enhancedParametricSVGPart = `        // Helper: Deterministic Palette from Korean Name & ID for 500 Species Diversity
        const ko = data.koreanName || '';
        let hash = 0;
        for (let c = 0; c < insectId.length; c++) hash = ((hash << 5) - hash + insectId.charCodeAt(c)) | 0;
        hash = Math.abs(hash);

        const PALETTES = [
          { c1: '#fef08a', c2: '#eab308', accent: '#854d0e' }, // Golden Yellow
          { c1: '#fed7aa', c2: '#f97316', accent: '#7c2d12' }, // Warm Orange
          { c1: '#fecaca', c2: '#ef4444', accent: '#7f1d1d' }, // Ruby Red
          { c1: '#bbf7d0', c2: '#22c55e', accent: '#14532d' }, // Emerald Green
          { c1: '#99f6e4', c2: '#14b8a6', accent: '#134e4a' }, // Teal Jade
          { c1: '#bae6fd', c2: '#0284c7', accent: '#0c4a6e' }, // Sky Sapphire
          { c1: '#c7d2fe', c2: '#4f46e5', accent: '#1e1b4b' }, // Indigo Cobalt
          { c1: '#e9d5ff', c2: '#9333ea', accent: '#3b0764' }, // Royal Purple
          { c1: '#fbcfe8', c2: '#db2777', accent: '#831843' }, // Blossom Pink
          { c1: '#fde68a', c2: '#b45309', accent: '#451a03' }, // Amber Bronze
          { c1: '#d6d3d1', c2: '#57534e', accent: '#1c1917' }, // Stone Silver
          { c1: '#cbd5e1', c2: '#334155', accent: '#0f172a' }  // Obsidian Slate
        ];
        let pal = PALETTES[hash % PALETTES.length];
        if (/금빛|금강|황|노랑|노란|귤빛/.test(ko)) pal = PALETTES[0];
        else if (/주홍|주황|호박|감/.test(ko)) pal = PALETTES[1];
        else if (/붉은|홍|대추|팥|고추/.test(ko)) pal = PALETTES[2];
        else if (/초록|녹색|풀색|참나무|버들/.test(ko)) pal = PALETTES[3];
        else if (/청동|비단|길앞잡이/.test(ko)) pal = PALETTES[4];
        else if (/푸른|청|하늘|물/.test(ko)) pal = PALETTES[5];
        else if (/남색|남가뢰|루리/.test(ko)) pal = PALETTES[6];
        else if (/보라|오색|제비/.test(ko)) pal = PALETTES[7];
        else if (/꽃|복숭아|장미/.test(ko)) pal = PALETTES[8];
        else if (/갈색|차색|밤|사슴|풍뎅이/.test(ko)) pal = PALETTES[9];
        else if (/흰|백|은|유리창|모시/.test(ko)) pal = PALETTES[10];
        else if (/검정|검은|먹|흑/.test(ko)) pal = PALETTES[11];

        const hasSpots = /점박이|알락|별박이|네점|칠성|무늬|얼룩|표범|자나방/.test(ko) || (hash % 3 === 0);
        const hasStripes = /줄|띠|호랑|제일|각시/.test(ko) || (hash % 4 === 0);

        // 1. 나비·나방류 (Lepidoptera)
        if (data.order === 'Lepidoptera') {
          let wingColor1 = pal.c1, wingColor2 = pal.c2, dotColor = pal.accent;
          if (insectId === 'yellow_butterfly') { wingColor1 = '#fef08a'; wingColor2 = '#facc15'; dotColor = '#ca8a04'; }
          else if (insectId === 'asian_comma_butterfly') { wingColor1 = '#fb923c'; wingColor2 = '#ea580c'; dotColor = '#7c2d12'; }
          else if (insectId === 'red_admiral_butterfly') { wingColor1 = '#f87171'; wingColor2 = '#dc2626'; dotColor = '#450a0a'; }
          else if (insectId === 'spangle_butterfly') { wingColor1 = '#042f2e'; wingColor2 = '#0d9488'; dotColor = '#2dd4bf'; }
          else if (insectId === 'great_purple_emperor') { wingColor1 = '#581c87'; wingColor2 = '#9333ea'; dotColor = '#f3e8ff'; }
          else if (insectId === 'pale_grass_blue') { wingColor1 = '#bae6fd'; wingColor2 = '#38bdf8'; dotColor = '#0369a1'; }
          else if (insectId === 'silkworm_moth') { wingColor1 = '#f8fafc'; wingColor2 = '#cbd5e1'; dotColor = '#94a3b8'; }
          else if (insectId === 'hawk_moth') { wingColor1 = '#78350f'; wingColor2 = '#b45309'; dotColor = '#fef08a'; }

          const isMoth = ko.includes('나방') || ko.includes('박각시');
          const hasTail = ko.includes('호랑나비') || ko.includes('제비나비') || ko.includes('명주나비') || ko.includes('산누에');

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- Antennae & Head -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              <path d="M 56 35 Q 40 10 32 12" stroke="\${isMoth ? dotColor : '#1e293b'}" stroke-width="\${isMoth ? 3 : 2}" fill="none" />
              <path d="M 64 35 Q 80 10 88 12" stroke="\${isMoth ? dotColor : '#1e293b'}" stroke-width="\${isMoth ? 3 : 2}" fill="none" />
              <circle cx="60" cy="38" r="6" fill="#1e293b" stroke="\${isHeadActive ? '#facc15' : 'none'}" stroke-width="3" />
            </g>
            <!-- Wings & Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <!-- Forewings -->
              <path d="M 58 45 C 30 15, 0 25, 10 65 C 20 85, 55 60, 58 45 Z" fill="\${wingColor1}" stroke="\${wingColor2}" stroke-width="2.2" />
              <path d="M 62 45 C 90 15, 120 25, 110 65 C 100 85, 65 60, 62 45 Z" fill="\${wingColor1}" stroke="\${wingColor2}" stroke-width="2.2" />
              <!-- Hindwings -->
              <path d="M 58 55 C 35 65, 20 95, 45 105 C 55 105, 58 75, 58 55 Z" fill="\${wingColor2}" stroke="\${wingColor1}" stroke-width="2" />
              <path d="M 62 55 C 85 65, 100 95, 75 105 C 65 105, 62 75, 62 55 Z" fill="\${wingColor2}" stroke="\${wingColor1}" stroke-width="2" />
              \${hasTail ? \`
                <path d="M 42 102 L 34 116 M 78 102 L 86 116" stroke="\${dotColor}" stroke-width="3" stroke-linecap="round" />
              \` : ''}
              \${hasStripes ? \`
                <path d="M 22 42 L 52 54 M 98 42 L 68 54" stroke="\${dotColor}" stroke-width="2.2" opacity="0.75" />
                <path d="M 28 58 L 54 62 M 92 58 L 66 62" stroke="\${dotColor}" stroke-width="2" opacity="0.75" />
              \` : ''}
              <!-- Wing Spots -->
              <circle cx="35" cy="48" r="\${hasSpots ? 5.5 : 4}" fill="\${dotColor}" />
              <circle cx="85" cy="48" r="\${hasSpots ? 5.5 : 4}" fill="\${dotColor}" />
              \${hasSpots ? \`
                <circle cx="44" cy="82" r="3.5" fill="\${wingColor1}" stroke="\${dotColor}" stroke-width="1.5" />
                <circle cx="76" cy="82" r="3.5" fill="\${wingColor1}" stroke="\${dotColor}" stroke-width="1.5" />
              \` : ''}
              <!-- Thorax -->
              <ellipse cx="60" cy="52" rx="\${isMoth ? 7 : 5}" ry="9" fill="#1e293b" stroke="\${isThoraxActive ? '#facc15' : 'none'}" stroke-width="3" />
            </g>
            <!-- Abdomen -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <ellipse cx="60" cy="72" rx="\${isMoth ? 6 : 4}" ry="14" fill="#334155" stroke="\${isAbdomenActive ? '#facc15' : 'none'}" stroke-width="3" />
            </g>
          </svg>\`;
        }

        // 2. 딱정벌레류 (Coleoptera)
        if (data.order === 'Coleoptera') {
          let elyColor = pal.c2, headColor = pal.accent;
          if (insectId === 'firefly' || ko.includes('반딧불이') || ko.includes('개똥벌레')) { elyColor = '#18181b'; headColor = '#f97316'; }
          else if (insectId === 'tiger_beetle') { elyColor = '#059669'; headColor = '#4338ca'; }
          else if (insectId === 'spotted_flower_chafer') { elyColor = '#713f12'; headColor = '#1e1b4b'; }
          else if (insectId === 'white_spotted_longhorn_beetle') { elyColor = '#09090b'; headColor = '#09090b'; }
          else if (insectId === 'korean_large_weevil') { elyColor = '#78716c'; headColor = '#44403c'; }
          else if (insectId === 'diving_beetle') { elyColor = '#14532d'; headColor = '#052e16'; }
          else if (insectId === 'serricornis_stag_beetle') { elyColor = '#18181b'; headColor = '#18181b'; }

          const isStag = ko.includes('사슴벌레');
          const isWeevil = ko.includes('바구미') || ko.includes('거위벌레');
          const isLonghorn = ko.includes('하늘소');
          const isLadybug = ko.includes('무당벌레');

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- 6 Legs -->
            <g stroke="#292524" stroke-width="2.5" fill="none" opacity="\${isHeadActive || isAbdomenActive ? 0.35 : 1}">
              <path d="M 52 48 Q 25 35 15 25" />
              <path d="M 68 48 Q 95 35 105 25" />
              <path d="M 50 56 Q 20 60 12 70" />
              <path d="M 70 56 Q 100 60 108 70" />
              <path d="M 52 68 Q 25 90 18 105" />
              <path d="M 68 68 Q 95 90 102 105" />
            </g>
            <!-- Head & Mandibles / Antennae -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              \${isLonghorn ? \`
                <path d="M 54 32 C 30 10, 12 40, 10 85" stroke="\${headColor}" stroke-width="2.2" fill="none" />
                <path d="M 66 32 C 90 10, 108 40, 110 85" stroke="\${headColor}" stroke-width="2.2" fill="none" />
              \` : \`
                <path d="M 54 30 Q 44 18 38 16 M 66 30 Q 76 18 82 16" stroke="\${headColor}" stroke-width="2" fill="none" />
              \`}
              \${isStag ? \`
                <!-- Stag Mandibles -->
                <path d="M 54 30 Q 45 10 35 12 C 40 20, 50 25, 54 30 Z" fill="#09090b" stroke="#facc15" stroke-width="\${isHeadActive ? 2 : 0}" />
                <path d="M 66 30 Q 75 10 85 12 C 80 20, 70 25, 66 30 Z" fill="#09090b" stroke="#facc15" stroke-width="\${isHeadActive ? 2 : 0}" />
              \` : ''}
              \${isWeevil ? \`
                <!-- Long Weevil Snout -->
                <path d="M 60 30 Q 60 10 58 6" stroke="\${headColor}" stroke-width="4" stroke-linecap="round" />
              \` : ''}
              <ellipse cx="60" cy="34" rx="9" ry="7" fill="\${headColor}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <path d="M 48 40 L 72 40 L 75 52 L 45 52 Z" fill="\${headColor}" stroke="\${isThoraxActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Abdomen & Elytra -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <ellipse cx="60" cy="76" rx="\${isLadybug ? 23 : 19}" ry="\${isLadybug ? 23 : 26}" fill="\${elyColor}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2.5" />
              <line x1="60" y1="52" x2="60" y2="\${isLadybug ? 99 : 101}" stroke="#000" stroke-width="1.8" />
              \${(hasSpots || isLadybug) ? \`
                <circle cx="51" cy="65" r="2.8" fill="\${isLadybug ? '#18181b' : pal.c1}" />
                <circle cx="69" cy="65" r="2.8" fill="\${isLadybug ? '#18181b' : pal.c1}" />
                <circle cx="49" cy="78" r="3" fill="\${isLadybug ? '#18181b' : pal.c1}" />
                <circle cx="71" cy="78" r="3" fill="\${isLadybug ? '#18181b' : pal.c1}" />
                <circle cx="53" cy="90" r="2.5" fill="\${isLadybug ? '#18181b' : pal.c1}" />
                <circle cx="67" cy="90" r="2.5" fill="\${isLadybug ? '#18181b' : pal.c1}" />
              \` : ''}
              \${(insectId === 'diving_beetle' || ko.includes('물방개') || ko.includes('노랑테')) ? \`
                <path d="M 43 56 C 41 75, 45 92, 60 101" stroke="#facc15" stroke-width="2.5" fill="none" />
                <path d="M 77 56 C 79 75, 75 92, 60 101" stroke="#facc15" stroke-width="2.5" fill="none" />
              \` : ''}
              \${(insectId === 'firefly' || ko.includes('반딧불이') || ko.includes('개똥벌레')) ? \`
                <ellipse cx="60" cy="98" rx="8" ry="5" fill="#a3e635" filter="drop-shadow(0 0 8px #a3e635)" />
              \` : ''}
            </g>
          </svg>\`;
        }

        // 3. 벌·개미목 (Hymenoptera)
        if (data.order === 'Hymenoptera') {
          const isAnt = ko.includes('개미');
          let bodyColor = isAnt ? pal.accent : '#1c1917';
          let stripeColor = pal.c2 === '#1c1917' ? '#facc15' : pal.c2;
          if (insectId === 'asian_giant_hornet' || ko.includes('말벌')) { stripeColor = '#ea580c'; }
          else if (ko.includes('청벌')) { bodyColor = '#0284c7'; stripeColor = '#2dd4bf'; }

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- 6 Legs -->
            <g stroke="\${bodyColor}" stroke-width="2.2" fill="none" opacity="\${isHeadActive || isAbdomenActive ? 0.35 : 1}">
              <path d="M 52 48 Q 20 40 10 30" /><path d="M 68 48 Q 100 40 110 30" />
              <path d="M 50 56 Q 22 62 14 74" /><path d="M 70 56 Q 98 62 106 74" />
              <path d="M 52 64 Q 25 85 18 102" /><path d="M 68 64 Q 95 85 102 102" />
            </g>
            \${!isAnt ? \`
              <!-- Wings -->
              <g fill="rgba(224, 231, 255, 0.65)" stroke="#94a3b8" stroke-width="1.2">
                <ellipse cx="38" cy="46" rx="20" ry="8" transform="rotate(-30 38 46)" />
                <ellipse cx="82" cy="46" rx="20" ry="8" transform="rotate(30 82 46)" />
              </g>
            \` : ''}
            <!-- Head -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              <path d="M 55 24 L 46 14 L 38 18 M 65 24 L 74 14 L 82 18" stroke="\${bodyColor}" stroke-width="1.8" fill="none" />
              <ellipse cx="60" cy="30" rx="9" ry="8" fill="\${bodyColor}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
              <circle cx="53" cy="28" r="2.5" fill="#f8fafc" />
              <circle cx="67" cy="28" r="2.5" fill="#f8fafc" />
            </g>
            <!-- Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <ellipse cx="60" cy="48" rx="8" ry="9" fill="\${bodyColor}" stroke="\${isThoraxActive ? '#facc15' : '#000'}" stroke-width="2" />
              <!-- Waist -->
              <line x1="60" y1="57" x2="60" y2="64" stroke="#000" stroke-width="3" />
            </g>
            <!-- Striped Abdomen -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <ellipse cx="60" cy="78" rx="13" ry="17" fill="\${bodyColor}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2" />
              \${!isAnt ? \`
                <path d="M 48 70 Q 60 74 72 70" stroke="\${stripeColor}" stroke-width="3.5" fill="none" />
                <path d="M 47 78 Q 60 82 73 78" stroke="\${stripeColor}" stroke-width="3.5" fill="none" />
                <path d="M 50 86 Q 60 90 70 86" stroke="\${stripeColor}" stroke-width="3" fill="none" />
              \` : ''}
            </g>
          </svg>\`;
        }

        // 4. 노린재·매미류 (Hemiptera)
        if (data.order === 'Hemiptera') {
          let shieldColor = pal.c2, patternColor = pal.c1;
          if (insectId === 'shield_bug') { shieldColor = '#dc2626'; patternColor = '#000'; }
          else if (insectId === 'lanternfly') { shieldColor = '#a8a29e'; patternColor = '#dc2626'; }
          else if (insectId === 'water_strider' || ko.includes('소금쟁이')) { shieldColor = '#44403c'; patternColor = '#78716c'; }
          else if (insectId === 'giant_water_bug') { shieldColor = '#3f3f46'; patternColor = '#27272a'; }

          const isStrider = ko.includes('소금쟁이') || ko.includes('게아재비');

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- Legs -->
            <g stroke="#1c1917" stroke-width="2.2" fill="none" opacity="\${isHeadActive || isAbdomenActive ? 0.35 : 1}">
              \${isStrider ? \`
                <path d="M 52 45 L 8 15" stroke-width="3" />
                <path d="M 68 45 L 112 15" stroke-width="3" />
                <path d="M 50 55 L 2 75" stroke-width="2.5" />
                <path d="M 70 55 L 118 75" stroke-width="2.5" />
                <path d="M 52 65 L 12 115" stroke-width="2.5" />
                <path d="M 68 65 L 108 115" stroke-width="2.5" />
              \` : \`
                <path d="M 52 45 Q 25 35 15 25" />
                <path d="M 68 45 Q 95 35 105 25" />
                <path d="M 50 56 Q 22 62 14 74" />
                <path d="M 70 56 Q 98 62 106 74" />
                <path d="M 52 68 Q 25 90 18 105" />
                <path d="M 68 68 Q 95 90 102 105" />
              \`}
            </g>
            <!-- Head -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              <path d="M 55 28 L 44 14 M 65 28 L 76 14" stroke="#1c1917" stroke-width="1.8" fill="none" />
              <ellipse cx="60" cy="32" rx="7" ry="6" fill="\${pal.accent}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <polygon points="45,38 75,38 78,48 42,48" fill="\${pal.accent}" stroke="\${isThoraxActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Shield / Abdomen -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <path d="M 42 48 L 78 48 L 80 64 L 60 96 L 40 64 Z" fill="\${shieldColor}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2" />
              <polygon points="48,48 72,48 60,68" fill="\${pal.accent}" opacity="0.55" />
              \${hasSpots ? \`
                <circle cx="53" cy="60" r="3" fill="\${patternColor}" />
                <circle cx="67" cy="60" r="3" fill="\${patternColor}" />
              \` : ''}
            </g>
          </svg>\`;
        }

        // 5. 메뚜기·여치·귀뚜라미류 (Orthoptera)
        if (data.order === 'Orthoptera') {
          let bodyColor = pal.c2, legColor = pal.accent;
          if (insectId === 'oriental_cricket' || ko.includes('귀뚜라미') || ko.includes('방울벌레')) { bodyColor = '#292524'; legColor = '#1c1917'; }
          else if (insectId === 'mole_cricket' || ko.includes('땅강아지') || ko.includes('꼽등이')) { bodyColor = '#78350f'; legColor = '#92400e'; }
          else if (ko.includes('여치') || ko.includes('베짱이') || ko.includes('메뚜기') || ko.includes('방아깨비')) { bodyColor = '#16a34a'; legColor = '#15803d'; }

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- Long Antennae -->
            <path d="M 56 30 Q 30 10 15 5" stroke="#1c1917" stroke-width="1.8" fill="none" />
            <path d="M 64 30 Q 90 10 105 5" stroke="#1c1917" stroke-width="1.8" fill="none" />
            <!-- Giant Jumping Legs -->
            <g stroke="\${legColor}" stroke-width="5" fill="none" opacity="\${isHeadActive || isAbdomenActive ? 0.35 : 1}">
              <path d="M 52 65 Q 25 35 18 55 L 12 105" />
              <path d="M 68 65 Q 95 35 102 55 L 108 105" />
            </g>
            <!-- Head -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              \${(ko.includes('방아깨비') || ko.includes('섬서구') || ko.includes('여치')) ? \`
                <path d="M 52 38 L 60 14 L 68 38 Z" fill="\${bodyColor}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
              \` : \`
                <ellipse cx="60" cy="34" rx="9" ry="10" fill="\${bodyColor}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
              \`}
            </g>
            <!-- Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <rect x="52" y="42" width="16" height="15" rx="3" fill="\${legColor}" stroke="\${isThoraxActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Abdomen -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <ellipse cx="60" cy="80" rx="9" ry="25" fill="\${bodyColor}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
          </svg>\`;
        }

        // 6. 파리·등에·모기목 (Diptera)
        if (data.order === 'Diptera') {
          const isHoverfly = ko.includes('꽃등에');
          const isMosquito = ko.includes('모기') || ko.includes('각다귀') || ko.includes('깔따구');
          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- Legs -->
            <g stroke="#1e293b" stroke-width="\${isMosquito ? 1.5 : 2.2}" fill="none" opacity="\${isHeadActive || isAbdomenActive ? 0.35 : 1}">
              <path d="M 52 46 L 20 26 M 68 46 L 100 26" />
              <path d="M 50 54 L 16 64 M 70 54 L 104 64" />
              <path d="M 52 62 L 22 102 M 68 62 L 98 102" />
            </g>
            <!-- Single Pair of Forewings -->
            <g fill="rgba(241, 245, 249, 0.72)" stroke="#94a3b8" stroke-width="1.4" opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <ellipse cx="36" cy="52" rx="22" ry="9" transform="rotate(-28 36 52)" />
              <ellipse cx="84" cy="52" rx="22" ry="9" transform="rotate(28 84 52)" />
            </g>
            <!-- Head & Large Compound Eyes -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              \${isMosquito ? \`<line x1="60" y1="26" x2="60" y2="8" stroke="#0f172a" stroke-width="2" />\` : ''}
              <ellipse cx="60" cy="32" rx="11" ry="8" fill="#1e293b" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
              <circle cx="53" cy="31" r="4.5" fill="#b91c1c" />
              <circle cx="67" cy="31" r="4.5" fill="#b91c1c" />
            </g>
            <!-- Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <ellipse cx="60" cy="48" rx="10" ry="11" fill="\${pal.accent}" stroke="\${isThoraxActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Abdomen -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <ellipse cx="60" cy="76" rx="\${isMosquito ? 6 : 13}" ry="\${isMosquito ? 22 : 17}" fill="\${isHoverfly ? '#eab308' : pal.c2}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2" />
              \${isHoverfly ? \`
                <path d="M 48 70 L 72 70 M 47 78 L 73 78 M 50 85 L 70 85" stroke="#1c1917" stroke-width="3.2" />
              \` : ''}
            </g>
          </svg>\`;
        }

        // 7. 사마귀·대벌레·집게벌레목 (Mantodea, Phasmatodea, Dermaptera)
        if (data.order === 'Mantodea' || data.order === 'Phasmatodea' || data.order === 'Dermaptera') {
          const isMantis = data.order === 'Mantodea';
          const isEarwig = data.order === 'Dermaptera';
          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- Legs -->
            <g stroke="\${pal.accent}" stroke-width="2.6" fill="none" opacity="\${isHeadActive || isAbdomenActive ? 0.35 : 1}">
              \${isMantis ? \`
                <!-- Raptorial Forelegs -->
                <path d="M 54 38 L 32 28 L 24 14 L 38 18" stroke-width="3.5" />
                <path d="M 66 38 L 88 28 L 96 14 L 82 18" stroke-width="3.5" />
              \` : \`
                <path d="M 55 40 L 22 20 M 65 40 L 98 20" />
              \`}
              <path d="M 54 56 L 18 62 M 66 56 L 102 62" />
              <path d="M 55 70 L 22 102 M 65 70 L 98 102" />
            </g>
            <!-- Head -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              <polygon points="60,34 49,22 71,22" fill="\${pal.c2}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
              <circle cx="50" cy="22" r="3" fill="\${pal.accent}" />
              <circle cx="70" cy="22" r="3" fill="\${pal.accent}" />
            </g>
            <!-- Elongated Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <rect x="55" y="34" width="10" height="26" rx="4" fill="\${pal.c2}" stroke="\${isThoraxActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Abdomen -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <ellipse cx="60" cy="82" rx="\${isEarwig ? 10 : 8}" ry="22" fill="\${pal.c2}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2" />
              \${isEarwig ? \`
                <path d="M 55 102 C 50 114, 56 118, 59 114 M 65 102 C 70 114, 64 118, 61 114" stroke="#7c2d12" stroke-width="3" fill="none" />
              \` : ''}
            </g>
          </svg>\`;
        }

        // 8. 잠자리·하루살이·풀잠자리·날도래·기타목 (Odonata, Ephemeroptera, Neuroptera, etc.)
        let eyeColor = pal.accent, tailColor = pal.c2;
        if (insectId === 'globe_skimmer') { tailColor = '#d97706'; }
        else if (insectId === 'anax_dragonfly') { eyeColor = '#0284c7'; tailColor = '#059669'; }
        else if (insectId === 'damselfly') { tailColor = '#06b6d4'; }

        return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
          <!-- Transparent Wings -->
          <g fill="rgba(240, 249, 255, 0.72)" stroke="\${pal.c2}" stroke-width="1.3" opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
            <ellipse cx="32" cy="48" rx="28" ry="7" transform="rotate(-15 32 48)" />
            <ellipse cx="88" cy="48" rx="28" ry="7" transform="rotate(15 88 48)" />
            <ellipse cx="34" cy="60" rx="24" ry="6" transform="rotate(-5 34 60)" />
            <ellipse cx="86" cy="60" rx="24" ry="6" transform="rotate(5 86 60)" />
          </g>
          <!-- Compound Eyes & Head -->
          <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
            <circle cx="54" cy="30" r="7" fill="\${eyeColor}" stroke="\${isHeadActive ? '#facc15' : 'none'}" stroke-width="2" />
            <circle cx="66" cy="30" r="7" fill="\${eyeColor}" stroke="\${isHeadActive ? '#facc15' : 'none'}" stroke-width="2" />
          </g>
          <!-- Thorax -->
          <ellipse cx="60" cy="44" rx="7" ry="10" fill="#334155" stroke="\${isThoraxActive ? '#facc15' : 'none'}" stroke-width="2" opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}" />
          <!-- Slender Abdomen Tail -->
          <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
            <line x1="60" y1="54" x2="60" y2="108" stroke="\${tailColor}" stroke-width="5" stroke-linecap="round" />
          </g>
        </svg>\`;
      }

`;

const newRenderInsectSVG50 = currentRenderInsectSVG50.slice(0, order1Idx) + enhancedParametricSVGPart;
html = html.slice(0, svgStartIdx) + newRenderInsectSVG50 + html.slice(svgEndIdx);

// 4. Upgrade getInsectAIType(id) to also inspect INSECTS_MAP[id] for all 500 species
const oldGetAIType = `      // 4 Behavioral Categories
      function getInsectAIType(id) {
        // 1. 나비류: 우아한 곡선 사인파 비행 & 펄럭임
        if (id === 'swallowtail_butterfly' || id === 'spangle_butterfly' || id === 'great_purple_emperor' ||
            id.includes('butterfly') || id.includes('moth')) return 'butterfly';

        // 2. 사슴벌레류: 턱을 앞세우고 신중하고 조심스러운 보행 & 위협 정지
        if (id === 'stag_beetle' || id === 'serricornis_stag_beetle' || id.includes('stag')) return 'stag';

        // 3. 벌류: 빠른 호버링 & 지그재그 비행 (beetle 제외)
        if (id === 'asian_giant_hornet' || id === 'carpenter_bee' || id === 'honeybee' ||
            id.endsWith('bee') || id.includes('_bee') || id.includes('wasp') || id.includes('hornet')) return 'bee';

        // 4. 개미류: 바닥과 줄기를 종종걸음으로 빠른 직진 & 분주한 탐색
        if (id === 'golden_tail_ant' || id.includes('ant')) return 'ant';

        // 5. 매미류: 나무줄기 장시간 정지 & 돌발 고속 직선 비행
        if (id === 'black_cicada' || id === 'robust_cicada' || id.includes('cicada')) return 'cicada';

        // 6. 사마귀류: 완벽한 위장 정지 & 0.05초 초고속 사냥 대시
        if (id === 'praying_mantis' || id === 'orchid_mantis' || id.includes('mantis')) return 'mantis';

        // 7. 거미류: 거미줄 타기 및 8다리 지그재그
        if (id === 'joro_spider' || id === 'goliath_birdeater' || id.includes('spider')) return 'spider';

        // 8. 기본 딱정벌레/풍뎅이류: 묵직한 보행 및 가끔 비행 대시
        return 'beetle';
      }`;

const newGetAIType = `      // 8 Behavioral Categories across all 500 species
      function getInsectAIType(id) {
        const meta = (typeof INSECTS_MAP !== 'undefined' && INSECTS_MAP[id]) ? INSECTS_MAP[id] : null;
        const ko = meta ? (meta.koreanName || '') : '';
        const order = meta ? (meta.order || '') : '';

        // 1. 나비·나방류: 우아한 곡선 사인파 비행 & 펄럭임
        if (order === 'Lepidoptera' || id.includes('butterfly') || id.includes('moth')) return 'butterfly';

        // 2. 사슴벌레류: 턱을 앞세우고 신중하고 조심스러운 보행 & 위협 정지
        if (ko.includes('사슴벌레') || id.includes('stag')) return 'stag';

        // 3. 개미류: 바닥과 줄기를 종종걸음으로 빠른 직진 & 분주한 탐색
        if (ko.includes('개미') || id === 'golden_tail_ant' || id.endsWith('_ant')) return 'ant';

        // 4. 벌·파리·잠자리류: 빠른 호버링 & 지그재그 비행
        if (order === 'Hymenoptera' || order === 'Diptera' || order === 'Odonata' ||
            id.endsWith('bee') || id.includes('_bee') || id.includes('wasp') || id.includes('hornet')) return 'bee';

        // 5. 매미류: 나무줄기 장시간 정지 & 돌발 고속 직선 비행
        if ((ko.includes('매미') && !ko.includes('충')) || id.includes('cicada')) return 'cicada';

        // 6. 사마귀·대벌레류: 완벽한 위장 정지 & 초고속 사냥 대시
        if (order === 'Mantodea' || order === 'Phasmatodea' || id.includes('mantis')) return 'mantis';

        // 7. 거미류: 거미줄 타기 및 8다리 지그재그
        if (id === 'joro_spider' || id === 'goliath_birdeater' || id.includes('spider')) return 'spider';

        // 8. 기본 딱정벌레/노린재/메뚜기류: 보행 및 비행 대시
        return 'beetle';
      }`;

if (html.includes(oldGetAIType)) {
  html = html.replace(oldGetAIType, newGetAIType);
}

// 5. Upgrade spawnWildSafariInsects() so all 500 species in the current habitat zone can spawn alongside iconic species
const oldSpawnBlockStart = '        const currentHab = habitatMap[currentZone] || habitatMap[\'oak\'];';
const oldSpawnBlockEnd = '          wildInsects.push(entity);\n        }\n      }';
const sIdx = html.indexOf(oldSpawnBlockStart);
const eIdx = html.indexOf(oldSpawnBlockEnd);

if (sIdx !== -1 && eIdx !== -1) {
  const newSpawnLogic = `        const currentHab = habitatMap[currentZone] || habitatMap['oak'];
        const zoneKoMap = { oak: '숲', meadow: '꽃밭', floor: '연못 주변', jungle: '풀밭' };
        const targetHabKo = zoneKoMap[currentZone] || '숲';
        const zone500Ids = INSECTS_50.filter(ins => ins.habitat === targetHabKo).map(ins => ins.id);
        const uncaughtZoneIds = zone500Ids.filter(id => !(appData && appData.caught && appData.caught[id] > 0));
        const dynamicZonePool = uncaughtZoneIds.length >= 20 ? uncaughtZoneIds : zone500Ids;

        const speciesPool = [];

        // 1) Iconic Primary & Secondary species (20마리 보장 스폰으로 대표 곤충/미션 타깃 완벽 유지)
        for (let i = 0; i < 12; i++) {
          speciesPool.push(currentHab.primary[i % currentHab.primary.length]);
        }
        for (let i = 0; i < 8; i++) {
          speciesPool.push(currentHab.secondary[i % currentHab.secondary.length]);
        }
        // 2) Full 500-species Zone Pool (30마리 서식지별 500종 도감 곤충 골고루 스폰)
        for (let i = 0; i < 30; i++) {
          if (dynamicZonePool.length > 0) {
            const randId = dynamicZonePool[Math.floor(Math.random() * dynamicZonePool.length)];
            speciesPool.push(randId);
          } else {
            speciesPool.push(currentHab.primary[i % currentHab.primary.length]);
          }
        }

        // Shuffle
        for (let i = speciesPool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [speciesPool[i], speciesPool[j]] = [speciesPool[j], speciesPool[i]];
        }

        for (let i = 0; i < MAX_WILD_INSECTS; i++) {
          const chosenId = speciesPool[i] || allIds[i % allIds.length];
          const startX = 25 + Math.random() * Math.max(100, bounds.width - 100);
          const startY = 70 + Math.random() * Math.max(100, bounds.height - 140);
          const entity = new WildInsectEntity(i + '_' + Date.now(), chosenId, startX, startY);
          wildInsects.push(entity);
        }
      }`;
  html = html.slice(0, sIdx) + newSpawnLogic + html.slice(eIdx + oldSpawnBlockEnd.length);
}

// 6. Fix single insect release in Lab View to trigger missionEngine.onInsectReleased(currentLabInsectId)
const oldReleaseBlock = `        // Release 1 insect
        terrariumList.splice(foundIdx, 1);
        appData.points = (appData.points || 0) + 50;
        saveExpeditionData(appData);
        updateTerrariumCountUI();`;

const newReleaseBlock = `        // Release 1 insect
        terrariumList.splice(foundIdx, 1);
        appData.points = (appData.points || 0) + 50;
        saveExpeditionData(appData);
        updateTerrariumCountUI();
        if (typeof missionEngine !== 'undefined') {
          missionEngine.onInsectReleased(currentLabInsectId);
        }`;

if (html.includes(oldReleaseBlock)) {
  html = html.replace(oldReleaseBlock, newReleaseBlock);
}

// 7. Remove duplicate updateHeaderCatchCount and add dynamic filter tab count updater
const dupUpdateHeader = `      function updateHeaderCatchCount() {
        const totalSpecies = Object.keys(CREATURES).length;
        const caughtSpecies = Object.keys(CREATURES).filter(id => appData.caught[id] > 0).length;
        headerCatchCount.textContent = \`\${caughtSpecies}/\${totalSpecies}\`;
        bookCountPill.textContent = \`\${caughtSpecies} / \${totalSpecies} 채집 (\${Math.round((caughtSpecies / totalSpecies) * 100)}%)\`;
      }`;

if (html.includes(dupUpdateHeader)) {
  html = html.replace(dupUpdateHeader, '// (Consolidated updateHeaderCatchCount below)');
}

// 8. Upgrade btnAdminUnlock & btnAdminReset for 500 species
const oldAdminHandlers = `      // Test Unlock All 10 Species
      btnAdminUnlock.addEventListener('click', () => {
        Object.keys(CREATURES).forEach(id => {
          appData.caught[id] = (appData.caught[id] || 0) + 1;
        });
        saveExpeditionData(appData);
        updateHeaderCatchCount();
        audio.playFanfare();
        triggerConfetti();
        adminModal.style.display = 'none';
        renderBookGrid();
      });

      // Reset Data
      btnAdminReset.addEventListener('click', () => {
        if (confirm('도감에 기록된 10종의 모든 채집 데이터를 초기화할까요?')) {
          appData = { caught: {}, lastPlayed: Date.now() };
          saveExpeditionData(appData);
          updateHeaderCatchCount();
          audio.playTap();
          adminModal.style.display = 'none';
          renderBookGrid();
          renderZoneStage(currentZone);
        }
      });`;

const newAdminHandlers = `      // Test Unlock All 500 Species
      btnAdminUnlock.addEventListener('click', () => {
        if (!appData.firstCaughtDate) appData.firstCaughtDate = {};
        const nowIso = new Date().toISOString();
        INSECTS_50.forEach(ins => {
          appData.caught[ins.id] = (appData.caught[ins.id] || 0) + 1;
          if (!appData.firstCaughtDate[ins.id]) appData.firstCaughtDate[ins.id] = nowIso;
        });
        Object.keys(CREATURES).forEach(id => {
          appData.caught[id] = (appData.caught[id] || 0) + 1;
        });
        saveExpeditionData(appData);
        updateHeaderCatchCount();
        audio.playFanfare();
        triggerConfetti();
        adminModal.style.display = 'none';
        renderBookGrid();
      });

      // Reset Data
      btnAdminReset.addEventListener('click', () => {
        if (confirm('도감에 기록된 500종의 모든 채집 데이터를 초기화할까요?')) {
          appData = { caught: {}, firstCaughtDate: {}, terrarium: [], points: 0, lastPlayed: Date.now() };
          saveExpeditionData(appData);
          updateHeaderCatchCount();
          updateTerrariumCountUI();
          audio.playTap();
          adminModal.style.display = 'none';
          renderBookGrid();
          renderZoneStage(currentZone);
        }
      });`;

if (html.includes(oldAdminHandlers)) {
  html = html.replace(oldAdminHandlers, newAdminHandlers);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with 500 species and bug fixes!');
