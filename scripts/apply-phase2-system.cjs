const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Load 50 insects data
const insects50 = JSON.parse(fs.readFileSync('insects50.json', 'utf8'));

// =========================================================================
// 1. UPDATE CSS STYLES FOR PHASE 2 (Search, Filter, Cards, Tablet optimization)
// =========================================================================
const phase2Styles = `
      /* --- PHASE 2 50-INSECTS ENCYCLOPEDIA STYLES --- */
      .book-search-bar {
        padding: 8px 14px;
        background: rgba(15, 23, 42, 0.7);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .book-search-input {
        flex: 1;
        padding: 9px 14px;
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.4);
        color: #ffffff;
        font-size: 0.88rem;
        font-weight: 600;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .book-search-input:focus {
        border-color: #38bdf8;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
      }

      .book-search-input::placeholder {
        color: #94a3b8;
      }

      .book-filter-bar {
        display: flex;
        gap: 6px;
        padding: 8px 12px;
        background: rgba(15, 23, 42, 0.85);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        overflow-x: auto;
        scrollbar-width: none;
      }
      .book-filter-bar::-webkit-scrollbar { display: none; }

      .btn-book-filter {
        flex-shrink: 0;
        padding: 6px 12px;
        border-radius: 9999px;
        font-size: 0.78rem;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #cbd5e1;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .btn-book-filter.active {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        border-color: #38bdf8;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
      }

      /* Book Grid & Cards (Responsive for Android Tablets) */
      .book-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
        gap: 12px;
        padding: 14px;
        overflow-y: auto;
        flex: 1;
        -webkit-overflow-scrolling: touch;
      }

      @media (min-width: 768px) {
        .book-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          padding: 18px;
        }
      }

      .book-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 12px 8px;
        border-radius: 16px;
        background: rgba(30, 41, 59, 0.7);
        border: 2px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease;
        user-select: none;
      }

      .book-card:hover {
        transform: translateY(-4px);
        border-color: #38bdf8;
      }

      .book-card.locked {
        background: rgba(15, 23, 42, 0.55);
        border-color: rgba(255, 255, 255, 0.06);
        cursor: default;
      }

      .book-card.locked:hover {
        transform: none;
        border-color: rgba(255, 255, 255, 0.06);
      }

      .book-card-thumb {
        width: 82px;
        height: 82px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
      }

      .book-card.locked .book-card-thumb svg {
        filter: brightness(0.2) grayscale(1);
        opacity: 0.35;
      }

      .book-card-name-ko {
        font-size: 0.88rem;
        font-weight: 800;
        color: #f8fafc;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }

      .book-card.locked .book-card-name-ko {
        color: #64748b;
      }

      .book-card-name-en {
        font-size: 0.72rem;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }

      .book-card-type-tag {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
      }

      .book-card.caught .book-card-type-tag {
        background: #0284c7;
        color: #ffffff;
      }

      .book-card-count {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.65rem;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 9999px;
        background: #f59e0b;
        color: #1c1917;
      }

      .book-card-date {
        font-size: 0.62rem;
        color: #94a3b8;
        margin-top: 4px;
      }

      /* Lab View Warning and Metadata Badges */
      .lab-meta-tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
        margin-bottom: 8px;
      }

      .badge-source {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        background: #065f46;
        color: #a7f3d0;
        border: 1px solid #10b981;
      }

      .badge-habitat {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        background: #1e3a8a;
        color: #bfdbfe;
        border: 1px solid #3b82f6;
      }

      .lab-warning-box {
        margin-top: 10px;
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(245, 158, 11, 0.15);
        border: 1.5px solid #f59e0b;
        color: #fef08a;
        font-size: 0.8rem;
        line-height: 1.45;
      }
`;

// Inject into styles
html = html.replace('</style>', phase2Styles + '\n    </style>');

// =========================================================================
// 2. UPDATE HTML MARKUP: HEADER, TABS, SEARCH, AND LAB METADATA
// =========================================================================

// Update Header Catch Count ID to 0/50
html = html.replace('<span id="header-catch-count" class="brand-badge">0/10</span>', '<span id="header-catch-count" class="brand-badge">0/50</span>');
html = html.replace('<span class="world-edition-badge">v0.2 월드&이중언어</span>', '<span class="world-edition-badge">PHASE 2 도감 50종</span>');

// Update 4 Habitat Exploration Tabs (숲, 꽃밭, 연못 주변, 풀밭) + 5 World themes compatible
const habitatTabs = `
      <!-- 4 Exploration Habitats & Themes -->
      <nav class="zone-bar">
        <button class="zone-tab active" data-zone="oak" title="참나무 숲 (18종)">
          <span>🌳</span>
          <span>숲 (참나무·밀림)</span>
        </button>
        <button class="zone-tab" data-zone="meadow" title="야생화 꽃밭 (10종)">
          <span>🌼</span>
          <span>꽃밭 (들꽃·꿀벌)</span>
        </button>
        <button class="zone-tab" data-zone="floor" title="연못 주변 (9종)">
          <span>💧</span>
          <span>연못 주변 (잠자리·물방개)</span>
        </button>
        <button class="zone-tab" data-zone="jungle" title="풀밭 (13종)">
          <span>🌾</span>
          <span>풀밭 (메뚜기·노린재)</span>
        </button>
      </nav>
`;
html = html.replace(/<!-- 5 World Ecosystem Tabs -->[\s\S]*?<\/nav>/, habitatTabs);

// Update Book Modal Header & Filter Bar
const bookModalHeaderAndFilters = `
        <div class="book-header">
          <div class="book-title-box">
            <span class="book-title">📖 곤충 도감 (50종)</span>
            <span id="book-count-pill" class="book-count-pill">0 / 50종 발견 (0%)</span>
          </div>
          <button id="btn-close-book" class="btn-close-modal">✕</button>
        </div>

        <!-- Book Real-Time Search Bar -->
        <div class="book-search-bar">
          <input type="text" id="book-search-input" class="book-search-input" placeholder="🔍 곤충 이름 또는 영어 검색 (예: 호랑나비, Beetle, 벌, 사슴)..." autocomplete="off" />
        </div>

        <!-- Filter tabs: All (50) + 6 Insect Orders -->
        <div class="book-filter-bar">
          <button class="btn-book-filter active" data-filter="all">전체 (50종)</button>
          <button class="btn-book-filter" data-filter="Lepidoptera">나비·나방목 (10)</button>
          <button class="btn-book-filter" data-filter="Coleoptera">딱정벌레목 (12)</button>
          <button class="btn-book-filter" data-filter="Hymenoptera">벌목 (7)</button>
          <button class="btn-book-filter" data-filter="Hemiptera">노린재목 (7)</button>
          <button class="btn-book-filter" data-filter="Orthoptera">메뚜기목 (6)</button>
          <button class="btn-book-filter" data-filter="Others">잠자리·기타 (8)</button>
        </div>
`;
html = html.replace(/<div class="book-header">[\s\S]*?<!-- Filter tabs[\s\S]*?<\/div>/, bookModalHeaderAndFilters);

// Update Lab View Detail Card Metadata (Warning, source, key words)
const labMetaHtml = `
          <!-- Exploration Metadata & Verification Badges -->
          <div class="lab-meta-tags-row">
            <span class="badge-source" id="lab-badge-source">공공데이터 검증 완료</span>
            <span class="badge-habitat" id="lab-badge-habitat">서식지: 숲</span>
            <span class="badge-habitat" id="lab-badge-keyword" style="background:#5b21b6; border-color:#8b5cf6;">핵심 단어: Beetle</span>
          </div>
`;
html = html.replace('<div class="ruler-box">', labMetaHtml + '\n          <div class="ruler-box">');

const labWarningHtml = `
          <!-- Observation Safety Warning -->
          <div class="lab-warning-box" id="lab-warning-box">
            <strong>⚠️ 어린이 관찰 안전 가이드:</strong> <span id="lab-warning-text">손으로 세게 잡지 말고 눈으로 관찰해요.</span>
          </div>
`;
html = html.replace('<!-- Kid-Friendly Ecology Fact Sheet -->', labWarningHtml + '\n          <!-- Kid-Friendly Ecology Fact Sheet -->');

// =========================================================================
// 3. INJECT 50 INSECTS DATA & ADVANCED PARAMETRIC SVG RENDERER
// =========================================================================
const insects50JsonString = JSON.stringify(insects50, null, 2);

const parametricSvgRendererCode = `
      /* ==========================================================================
         PHASE 2: 50 VERIFIED INSECTS MASTER DATA & PARAMETRIC SVG ENGINE
         ========================================================================== */
      const INSECTS_50 = ${insects50JsonString};

      // Map by ID for quick O(1) lookup
      const INSECTS_MAP = {};
      INSECTS_50.forEach(i => { INSECTS_MAP[i.id] = i; });

      // Fallback / Parametric SVG Engine for all 50 insects
      function renderInsectSVG50(insectId, options = {}) {
        // If legacy master SVG exists, use it
        if (typeof renderInsectSVG === 'function' && ['rhinoceros_beetle', 'hercules_beetle', 'caucasus_beetle', 'stag_beetle', 'swallowtail_butterfly', 'ladybug', 'praying_mantis', 'orchid_mantis'].includes(insectId)) {
          return renderInsectSVG(insectId, options);
        }

        const data = INSECTS_MAP[insectId];
        const w = options.width || '100%';
        const h = options.height || '100%';
        const activePart = options.activePart || 'all';

        if (!data) {
          // Clean Fallback Graphic
          return \`<svg viewBox="0 0 100 100" width="\${w}" height="\${h}">
            <circle cx="50" cy="50" r="42" fill="#334155" stroke="#64748b" stroke-width="3" />
            <text x="50" y="55" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle">곤충</text>
          </svg>\`;
        }

        const isHeadActive = (activePart === 'head');
        const isThoraxActive = (activePart === 'thorax');
        const isAbdomenActive = (activePart === 'abdomen');

        // 1. 나비·나방류 (Lepidoptera)
        if (data.order === 'Lepidoptera') {
          let wingColor1 = '#f8fafc', wingColor2 = '#e2e8f0', dotColor = '#1e293b';
          if (insectId === 'yellow_butterfly') { wingColor1 = '#fef08a'; wingColor2 = '#facc15'; dotColor = '#ca8a04'; }
          else if (insectId === 'asian_comma_butterfly') { wingColor1 = '#fb923c'; wingColor2 = '#ea580c'; dotColor = '#7c2d12'; }
          else if (insectId === 'red_admiral_butterfly') { wingColor1 = '#f87171'; wingColor2 = '#dc2626'; dotColor = '#450a0a'; }
          else if (insectId === 'spangle_butterfly') { wingColor1 = '#042f2e'; wingColor2 = '#0d9488'; dotColor = '#2dd4bf'; }
          else if (insectId === 'great_purple_emperor') { wingColor1 = '#581c87'; wingColor2 = '#9333ea'; dotColor = '#f3e8ff'; }
          else if (insectId === 'pale_grass_blue') { wingColor1 = '#bae6fd'; wingColor2 = '#38bdf8'; dotColor = '#0369a1'; }
          else if (insectId === 'silkworm_moth') { wingColor1 = '#f8fafc'; wingColor2 = '#cbd5e1'; dotColor = '#94a3b8'; }
          else if (insectId === 'hawk_moth') { wingColor1 = '#78350f'; wingColor2 = '#b45309'; dotColor = '#fef08a'; }

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- Antennae & Head -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              <path d="M 56 35 Q 40 10 32 12" stroke="#1e293b" stroke-width="2" fill="none" />
              <path d="M 64 35 Q 80 10 88 12" stroke="#1e293b" stroke-width="2" fill="none" />
              <circle cx="60" cy="38" r="6" fill="#1e293b" stroke="\${isHeadActive ? '#facc15' : 'none'}" stroke-width="3" />
            </g>
            <!-- Wings & Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <!-- Forewings -->
              <path d="M 58 45 C 30 15, 0 25, 10 65 C 20 85, 55 60, 58 45 Z" fill="\${wingColor1}" stroke="\${wingColor2}" stroke-width="2" />
              <path d="M 62 45 C 90 15, 120 25, 110 65 C 100 85, 65 60, 62 45 Z" fill="\${wingColor1}" stroke="\${wingColor2}" stroke-width="2" />
              <!-- Hindwings -->
              <path d="M 58 55 C 35 65, 20 95, 45 105 C 55 105, 58 75, 58 55 Z" fill="\${wingColor2}" stroke="\${wingColor1}" stroke-width="2" />
              <path d="M 62 55 C 85 65, 100 95, 75 105 C 65 105, 62 75, 62 55 Z" fill="\${wingColor2}" stroke="\${wingColor1}" stroke-width="2" />
              <!-- Wing Spots -->
              <circle cx="35" cy="50" r="5" fill="\${dotColor}" />
              <circle cx="85" cy="50" r="5" fill="\${dotColor}" />
              <!-- Thorax -->
              <ellipse cx="60" cy="52" rx="5" ry="9" fill="#1e293b" stroke="\${isThoraxActive ? '#facc15' : 'none'}" stroke-width="3" />
            </g>
            <!-- Abdomen -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <ellipse cx="60" cy="72" rx="4" ry="14" fill="#334155" stroke="\${isAbdomenActive ? '#facc15' : 'none'}" stroke-width="3" />
            </g>
          </svg>\`;
        }

        // 2. 딱정벌레류 (Coleoptera)
        if (data.order === 'Coleoptera') {
          let elyColor = '#451a03', headColor = '#1f1107';
          if (insectId === 'firefly') { elyColor = '#18181b'; headColor = '#f97316'; }
          else if (insectId === 'tiger_beetle') { elyColor = '#059669'; headColor = '#4338ca'; }
          else if (insectId === 'spotted_flower_chafer') { elyColor = '#713f12'; headColor = '#1e1b4b'; }
          else if (insectId === 'white_spotted_longhorn_beetle') { elyColor = '#09090b'; headColor = '#09090b'; }
          else if (insectId === 'korean_large_weevil') { elyColor = '#78716c'; headColor = '#44403c'; }
          else if (insectId === 'diving_beetle') { elyColor = '#14532d'; headColor = '#052e16'; }
          else if (insectId === 'serricornis_stag_beetle') { elyColor = '#18181b'; headColor = '#18181b'; }

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
            <!-- Head & Mandibles -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              \${insectId === 'serricornis_stag_beetle' ? \`
                <!-- Broad Stag Mandibles -->
                <path d="M 54 30 Q 45 10 35 12 C 40 20, 50 25, 54 30 Z" fill="#09090b" stroke="#facc15" stroke-width="\${isHeadActive ? 2 : 0}" />
                <path d="M 66 30 Q 75 10 85 12 C 80 20, 70 25, 66 30 Z" fill="#09090b" stroke="#facc15" stroke-width="\${isHeadActive ? 2 : 0}" />
              \` : ''}
              \${insectId === 'korean_large_weevil' ? \`
                <!-- Long Weevil Snout -->
                <path d="M 60 30 Q 60 10 58 6" stroke="#44403c" stroke-width="4" stroke-linecap="round" />
              \` : ''}
              <ellipse cx="60" cy="34" rx="9" ry="7" fill="\${headColor}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Thorax -->
            <g opacity="\${isHeadActive || isAbdomenActive ? 0.4 : 1}">
              <path d="M 48 40 L 72 40 L 75 52 L 45 52 Z" fill="\${headColor}" stroke="\${isThoraxActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <!-- Abdomen & Elytra -->
            <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
              <ellipse cx="60" cy="76" rx="19" ry="26" fill="\${elyColor}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2.5" />
              <line x1="60" y1="52" x2="60" y2="101" stroke="#000" stroke-width="1.8" />
              \${insectId === 'spotted_flower_chafer' || insectId === 'white_spotted_longhorn_beetle' ? \`
                <!-- Dots -->
                <circle cx="53" cy="65" r="2.2" fill="#fff" /><circle cx="67" cy="65" r="2.2" fill="#fff" />
                <circle cx="50" cy="80" r="2.2" fill="#fff" /><circle cx="70" cy="80" r="2.2" fill="#fff" />
                <circle cx="54" cy="92" r="2.2" fill="#fff" /><circle cx="66" cy="92" r="2.2" fill="#fff" />
              \` : ''}
              \${insectId === 'diving_beetle' ? \`
                <!-- Yellow Edge Rim -->
                <path d="M 43 56 C 41 75, 45 92, 60 101" stroke="#facc15" stroke-width="2.5" fill="none" />
                <path d="M 77 56 C 79 75, 75 92, 60 101" stroke="#facc15" stroke-width="2.5" fill="none" />
              \` : ''}
              \${insectId === 'firefly' ? \`
                <!-- Glowing Tail -->
                <ellipse cx="60" cy="98" rx="8" ry="5" fill="#a3e635" filter="drop-shadow(0 0 8px #a3e635)" />
              \` : ''}
            </g>
          </svg>\`;
        }

        // 3. 벌목 (Hymenoptera)
        if (data.order === 'Hymenoptera') {
          let bodyColor = '#1c1917', stripeColor = '#facc15';
          const isAnt = (data.category === '벌목' && data.koreanName.includes('개미'));
          if (insectId === 'asian_giant_hornet') { stripeColor = '#ea580c'; }

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- 6 Legs -->
            <g stroke="#1c1917" stroke-width="2.2" fill="none" opacity="\${isHeadActive || isAbdomenActive ? 0.35 : 1}">
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

        // 4. 노린재류 (Hemiptera)
        if (data.order === 'Hemiptera') {
          let shieldColor = '#065f46', patternColor = '#f43f5e';
          if (insectId === 'shield_bug') { shieldColor = '#dc2626'; patternColor = '#000'; }
          else if (insectId === 'lanternfly') { shieldColor = '#a8a29e'; patternColor = '#dc2626'; }
          else if (insectId === 'water_strider') { shieldColor = '#44403c'; patternColor = '#78716c'; }
          else if (insectId === 'giant_water_bug') { shieldColor = '#3f3f46'; patternColor = '#27272a'; }
          else if (insectId === 'black_cicada' || insectId === 'robust_cicada') { shieldColor = '#18181b'; patternColor = '#15803d'; }

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- Legs -->
            <g stroke="#1c1917" stroke-width="2.2" fill="none">
              \${insectId === 'water_strider' ? \`
                <!-- Long Strider Legs -->
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
            <!-- Shield Body -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              <ellipse cx="60" cy="32" rx="7" ry="6" fill="#1c1917" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
            <g opacity="\${isHeadActive ? 0.4 : 1}">
              <!-- Scutellum / Shield -->
              <path d="M 45 42 L 75 42 L 80 62 L 60 96 L 40 62 Z" fill="\${shieldColor}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2" />
              \${insectId === 'shield_bug' ? \`
                <!-- Red & Black Vertical Stripes -->
                <line x1="52" y1="42" x2="52" y2="78" stroke="#000" stroke-width="4" />
                <line x1="60" y1="42" x2="60" y2="92" stroke="#000" stroke-width="4" />
                <line x1="68" y1="42" x2="68" y2="78" stroke="#000" stroke-width="4" />
              \` : ''}
              \${insectId === 'hibiscus_harlequin_bug' ? \`
                <!-- Clown Pattern -->
                <circle cx="54" cy="58" r="4" fill="\${patternColor}" />
                <circle cx="66" cy="58" r="4" fill="\${patternColor}" />
                <path d="M 50 78 Q 60 88 70 78" stroke="\${patternColor}" stroke-width="3" fill="none" />
              \` : ''}
            </g>
          </svg>\`;
        }

        // 5. 메뚜기류 (Orthoptera)
        if (data.order === 'Orthoptera') {
          let bodyColor = '#15803d', legColor = '#166534';
          if (insectId === 'oriental_cricket') { bodyColor = '#292524'; legColor = '#1c1917'; }
          else if (insectId === 'mole_cricket') { bodyColor = '#78350f'; legColor = '#92400e'; }
          else if (insectId === 'migratory_locust') { bodyColor = '#854d0e'; legColor = '#713f12'; }

          return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
            <!-- Long Antennae -->
            <path d="M 56 30 Q 30 10 15 5" stroke="#1c1917" stroke-width="1.8" fill="none" />
            <path d="M 64 30 Q 90 10 105 5" stroke="#1c1917" stroke-width="1.8" fill="none" />
            <!-- Giant Jumping Legs -->
            <g stroke="\${legColor}" stroke-width="5" fill="none">
              <path d="M 52 65 Q 25 35 18 55 L 12 105" />
              <path d="M 68 65 Q 95 35 102 55 L 108 105" />
            </g>
            <!-- Head -->
            <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
              \${insectId === 'oriental_longheaded_locust' || insectId === 'conehead_katydid' ? \`
                <!-- Pointed Cone Head -->
                <path d="M 52 38 L 60 14 L 68 38 Z" fill="\${bodyColor}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
              \` : \`
                <ellipse cx="60" cy="34" rx="9" ry="10" fill="\${bodyColor}" stroke="\${isHeadActive ? '#facc15' : '#000'}" stroke-width="2" />
              \`}
            </g>
            <!-- Thorax & Wings -->
            <g opacity="\${isHeadActive ? 0.4 : 1}">
              <rect x="52" y="42" width="16" height="15" rx="3" fill="\${legColor}" stroke="\${isThoraxActive ? '#facc15' : '#000'}" stroke-width="2" />
              <ellipse cx="60" cy="80" rx="9" ry="25" fill="\${bodyColor}" stroke="\${isAbdomenActive ? '#facc15' : '#000'}" stroke-width="2" />
            </g>
          </svg>\`;
        }

        // 6. 잠자리·기타목 (Odonata, etc.)
        let eyeColor = '#15803d', tailColor = '#dc2626';
        if (insectId === 'globe_skimmer') { tailColor = '#d97706'; }
        else if (insectId === 'anax_dragonfly') { eyeColor = '#0284c7'; tailColor = '#059669'; }
        else if (insectId === 'damselfly') { tailColor = '#06b6d4'; }
        else if (insectId === 'housefly') {
          return \`<svg viewBox="0 0 100 100" width="\${w}" height="\${h}">
            <ellipse cx="50" cy="35" rx="14" ry="10" fill="#7f1d1d" />
            <ellipse cx="50" cy="50" rx="12" ry="12" fill="#18181b" />
            <ellipse cx="50" cy="72" rx="14" ry="18" fill="#3f3f46" />
            <ellipse cx="32" cy="45" rx="18" ry="8" transform="rotate(-35 32 45)" fill="rgba(255,255,255,0.7)" stroke="#cbd5e1" />
            <ellipse cx="68" cy="45" rx="18" ry="8" transform="rotate(35 68 45)" fill="rgba(255,255,255,0.7)" stroke="#cbd5e1" />
          </svg>\`;
        }

        return \`<svg viewBox="0 0 120 120" width="\${w}" height="\${h}">
          <!-- Transparent Wings -->
          <g fill="rgba(240, 249, 255, 0.7)" stroke="#94a3b8" stroke-width="1.2">
            <ellipse cx="32" cy="48" rx="28" ry="7" transform="rotate(-15 32 48)" />
            <ellipse cx="88" cy="48" rx="28" ry="7" transform="rotate(15 88 48)" />
            <ellipse cx="34" cy="60" rx="24" ry="6" transform="rotate(-5 34 60)" />
            <ellipse cx="86" cy="60" rx="24" ry="6" transform="rotate(5 86 60)" />
          </g>
          <!-- Compound Eyes & Head -->
          <g opacity="\${isThoraxActive || isAbdomenActive ? 0.4 : 1}">
            <circle cx="54" cy="30" r="7" fill="\${eyeColor}" />
            <circle cx="66" cy="30" r="7" fill="\${eyeColor}" />
          </g>
          <!-- Thorax -->
          <ellipse cx="60" cy="44" rx="7" ry="10" fill="#334155" stroke="\${isThoraxActive ? '#facc15' : 'none'}" stroke-width="2" />
          <!-- Slender Abdomen Tail -->
          <g opacity="\${isHeadActive || isThoraxActive ? 0.4 : 1}">
            <line x1="60" y1="54" x2="60" y2="108" stroke="\${tailColor}" stroke-width="5" stroke-linecap="round" />
          </g>
        </svg>\`;
      }
`;

// Insert 50 insects data & renderer before renderInsectSVG
html = html.replace('function renderInsectSVG(insectId, options = {}) {', parametricSvgRendererCode + '\n      function renderInsectSVG(insectId, options = {}) {');

// =========================================================================
// 4. REWRITE BOOK RENDERER (50 INSECTS, SEARCH, ORDERS FILTER, STATUS)
// =========================================================================
const bookRendererCode = `
      /* ==========================================================================
         PHASE 2: 50-INSECTS ENCYCLOPEDIA GRID, SEARCH & FILTERS
         ========================================================================== */
      const bookSearchInput = document.getElementById('book-search-input');
      let currentBookSearchQuery = '';

      function updateHeaderCatchCount() {
        const totalSpecies = INSECTS_50.length; // 50종
        const caughtSpecies = INSECTS_50.filter(i => (appData.caught[i.id] || 0) > 0).length;
        const percent = Math.round((caughtSpecies / totalSpecies) * 100);

        headerCatchCount.textContent = \`\${caughtSpecies}/\${totalSpecies}\`;
        bookCountPill.textContent = \`\${caughtSpecies} / \${totalSpecies}종 발견 (\${percent}% 달성)\`;
      }

      function renderBookGrid() {
        bookGrid.innerHTML = '';
        updateHeaderCatchCount();

        let list = INSECTS_50.slice();

        // 1. Order / Category Filter
        if (currentBookFilter !== 'all') {
          if (currentBookFilter === 'Others') {
            list = list.filter(i => i.order !== 'Lepidoptera' && i.order !== 'Coleoptera' && i.order !== 'Hymenoptera' && i.order !== 'Hemiptera' && i.order !== 'Orthoptera');
          } else {
            list = list.filter(i => i.order === currentBookFilter);
          }
        }

        // 2. Search Query Filter (Korean + English)
        if (currentBookSearchQuery.trim()) {
          const q = currentBookSearchQuery.trim().toLowerCase();
          list = list.filter(i => 
            i.koreanName.toLowerCase().includes(q) ||
            i.englishName.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q) ||
            i.habitat.toLowerCase().includes(q)
          );
        }

        if (list.length === 0) {
          bookGrid.innerHTML = \`<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px 10px;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
            검색 결과와 일치하는 곤충이 없습니다.<br />다른 이름으로 검색해 보세요!
          </div>\`;
          return;
        }

        list.forEach(i => {
          const count = appData.caught[i.id] || 0;
          const isCaught = count > 0;
          const firstDate = appData.firstCaughtDate ? appData.firstCaughtDate[i.id] : null;

          const card = document.createElement('div');
          card.className = \`book-card \${isCaught ? 'caught' : 'locked'}\`;

          card.innerHTML = \`
            \${isCaught ? \`<div class="book-card-count">\${count}회</div>\` : ''}
            <div class="book-card-thumb">
              \${renderInsectSVG50(i.id, { width: '100%', height: '100%' })}
            </div>
            <div class="book-card-name-ko">\${isCaught ? i.koreanName : '??? (미발견)'}</div>
            <div class="book-card-name-en">\${isCaught ? i.englishName : i.category}</div>
            <span class="book-card-type-tag">\${isCaught ? i.category : '서식지: ' + i.habitat}</span>
            \${isCaught && firstDate ? \`<div class="book-card-date">최초: \${firstDate.split('T')[0]}</div>\` : ''}
          \`;

          if (isCaught) {
            card.addEventListener('click', () => {
              openLabView(i.id);
            });
          }
          bookGrid.appendChild(card);
        });
      }

      if (bookSearchInput) {
        bookSearchInput.addEventListener('input', (e) => {
          currentBookSearchQuery = e.target.value;
          renderBookGrid();
        });
      }
`;

// Replace renderBookGrid function and book search
html = html.replace(/function renderBookGrid\(\) \{[\s\S]*?bookGrid\.appendChild\(card\);\s*\}\);\s*\}/, bookRendererCode);

// Update book filter buttons listeners
html = html.replace("currentBookFilter = btn.dataset.filter;\n          renderBookGrid();", "currentBookFilter = btn.dataset.filter;\n          renderBookGrid();");

// =========================================================================
// 5. UPDATE LAB VIEW FOR 50 INSECTS (ALL 16 REQUIRED FIELDS + 4 QUIZ MODES)
// =========================================================================
const updatedOpenLabView = `
      function openLabView(insectId) {
        currentLabInsectId = insectId;
        const i = INSECTS_MAP[insectId] || CREATURES[insectId];
        if (!i) return;

        audio.playTap();
        tts.stop();
        resetTTSButtons();

        // Reset zoom & pan
        currentLabZoom = 1.0;
        currentLabPart = 'all';
        panCurrentX = 0;
        panCurrentY = 0;
        labZoomSlider.value = 10;
        labZoomVal.textContent = '1.0x';

        // Reset pin active
        anatomyPinBtns.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.part === 'all');
        });

        // 1. Class Badge & Pins
        labClassBadge.textContent = \`곤충강 (\${i.category})\`;
        labClassBadge.className = 'lab-class-badge';
        pinBtnHead.textContent = '머리 & 감각기관';
        pinBtnThorax.textContent = '가슴 & 6개 다리/날개';
        pinBtnAbdomen.textContent = '배마디 & 소화기관';

        // 2. Titles & Size
        labCommonName.textContent = i.koreanName;
        labEnTitle.textContent = \`\${i.englishName} (\${i.region || '한국·아시아'})\`;
        labSciName.textContent = i.sciName || '';
        labSizeText.textContent = i.sizeMm || '50 mm';
        labRulerBar.style.width = \`\${Math.min(100, Math.max(15, parseInt(i.sizeMm) || 50))}%\`;

        // 3. Metadata Badges
        const badgeSource = document.getElementById('lab-badge-source');
        const badgeHabitat = document.getElementById('lab-badge-habitat');
        const badgeKeyword = document.getElementById('lab-badge-keyword');
        if (badgeSource) badgeSource.textContent = i.source || '공공생물DB 검증 완료';
        if (badgeHabitat) badgeHabitat.textContent = \`서식지: \${i.habitat}\`;
        if (badgeKeyword) badgeKeyword.textContent = \`핵심 영어: \${i.keyWordEn || 'Insect'}\`;

        // 4. Bilingual Cards
        labBilingualOrigin.innerHTML = \`<strong>💡 핵심 영어 단어:</strong> \${i.keyWordEn || 'Insect'} | \${i.nameOriginTip || '자연 생태를 담은 영어 이름이에요.'}\`;
        labExampleEn.textContent = \`"\${i.sentenceEn || i.exampleSentenceEn || 'Insects are amazing!'}"\`;
        labExampleKo.textContent = i.sentenceKo || i.exampleSentenceKo || '곤충은 정말 신기해요.';

        // 5. Anatomy & Ecology
        labPartTitle.textContent = '💡 주요 외형과 식별 특징';
        labPartDesc.textContent = i.appearance || (i.anatomy ? i.anatomy.all : '멋진 곤충의 모습이에요.');
        labEcologyDesc.textContent = \`\${i.fact} 먹이: \${i.diet}. \${i.ecology || ''}\`;

        // 6. Safety Warning
        const warningText = document.getElementById('lab-warning-text');
        if (warningText) {
          warningText.textContent = i.warning || '손으로 세게 잡지 말고 부드럽게 관찰해요.';
        }

        // Render SVG
        renderLabSVG();
        labView.style.display = 'flex';
      }

      function renderLabSVG() {
        if (!currentLabInsectId) return;
        labSvgStage.innerHTML = renderInsectSVG50(currentLabInsectId, {
          width: '100%',
          height: '100%',
          activePart: currentLabPart
        });
        updateLabTransform();
      }
`;

html = html.replace(/function openLabView\(insectId\) \{[\s\S]*?renderLabSVG\(\);\s*labView\.style\.display = 'flex';\s*\}/, updatedOpenLabView);
html = html.replace(/function renderLabSVG\(\) \{[\s\S]*?updateLabTransform\(\);\s*\}/, `function renderLabSVG() {
        if (!currentLabInsectId) return;
        labSvgStage.innerHTML = renderInsectSVG50(currentLabInsectId, {
          width: '100%',
          height: '100%',
          activePart: currentLabPart
        });
        updateLabTransform();
      }`);

// =========================================================================
// 6. EXPAND ENGLISH LEARNING: 4 DIVERSE QUIZ MODES & POSITIVE FEEDBACK
// =========================================================================
const fourQuizModesCode = `
      // 4-Mode English & Ecology Quiz Engine (PHASE 2)
      btnOpenQuiz.addEventListener('click', () => {
        audio.playTap();
        const i = INSECTS_MAP[currentLabInsectId] || CREATURES[currentLabInsectId];
        if (!i) return;

        quizOptions.innerHTML = '';
        quizFeedback.style.display = 'none';

        // 4 Quiz Modes:
        // Mode 0: Korean -> English Name
        // Mode 1: English -> Korean Name
        // Mode 2: Keyword / Trait -> English Word
        // Mode 3: Sentence / Clue -> Correct Insect
        const mode = Math.floor(Math.random() * 4);
        let qText = '', opts = [], correctIdx = 0, tipText = '';

        // Pick distinct wrong insect for option
        const otherInsects = INSECTS_50.filter(other => other.id !== i.id);
        const wrong1 = otherInsects[Math.floor(Math.random() * otherInsects.length)];
        const wrong2 = otherInsects[(Math.floor(Math.random() * otherInsects.length) + 1) % otherInsects.length];

        if (mode === 0) {
          qText = \`"\${i.koreanName}"의 영어 이름은 무엇일까요?\`;
          opts = [i.englishName, wrong1.englishName];
          tipText = \`\${i.koreanName}의 영어 이름은 '\${i.englishName}'예요!\`;
        } else if (mode === 1) {
          qText = \`"\${i.englishName}"은(는) 어떤 곤충일까요?\`;
          opts = [i.koreanName, wrong1.koreanName];
          tipText = \`'\${i.englishName}'은(는) 우리말로 '\${i.koreanName}'(이)랍니다!\`;
        } else if (mode === 2) {
          qText = \`\${i.koreanName}의 핵심 영어 단어는 무엇일까요?\`;
          opts = [i.keyWordEn || 'Insect', wrong1.keyWordEn || 'Bug'];
          if (opts[0] === opts[1]) opts[1] = 'Nature';
          tipText = \`\${i.koreanName}을(를) 표현하는 영어 단어는 '\${i.keyWordEn}'예요!\`;
        } else {
          qText = \`"\${i.sentenceEn}" - 이 문장이 설명하는 곤충은?\`;
          opts = [i.koreanName, wrong1.koreanName];
          tipText = \`\${i.sentenceKo}\`;
        }

        // Shuffle options so correct is random 0 or 1
        if (Math.random() > 0.5) {
          opts.reverse();
          correctIdx = (opts[0] === (mode === 0 ? i.englishName : (mode === 2 ? (i.keyWordEn || 'Insect') : i.koreanName))) ? 0 : 1;
        } else {
          correctIdx = (opts[0] === (mode === 0 ? i.englishName : (mode === 2 ? (i.keyWordEn || 'Insect') : i.koreanName))) ? 0 : 1;
        }

        quizQuestion.textContent = qText;

        opts.forEach((optText, idx) => {
          const btn = document.createElement('button');
          btn.className = 'btn-quiz-opt';
          btn.textContent = \`\${idx + 1}. \${optText}\`;
          btn.addEventListener('click', () => {
            const isCorrect = (idx === correctIdx);
            if (isCorrect) {
              audio.playFanfare();
              btn.classList.add('correct');
              quizFeedback.className = 'quiz-feedback success';
              quizFeedback.innerHTML = \`🎉 <b>정답이에요! 대단해요!</b> \${tipText} (+30 탐험 점수!)\`;
              appData.points = (appData.points || 0) + 30;
              saveExpeditionData(appData);
            } else {
              audio.playMiss();
              btn.classList.add('wrong');
              quizFeedback.className = 'quiz-feedback fail';
              quizFeedback.innerHTML = \`괜찮아요, 다시 도전해 보세요! 힌트: \${tipText}\`;
            }
            quizFeedback.style.display = 'block';
          });
          quizOptions.appendChild(btn);
        });

        quizCard.style.display = 'block';
      });
`;

html = html.replace(/btnOpenQuiz\.addEventListener\('click'[\s\S]*?quizCard\.style\.display = 'block';\s*\}\);/, fourQuizModesCode);

// =========================================================================
// 7. CATCH HANDLER & PERSISTENCE: 50 INSECTS COMPATIBILITY & DATE RECORDING
// =========================================================================
const catchDatePersistence = `
        // Record first catch date for encyclopedia
        if (!appData.firstCaughtDate) appData.firstCaughtDate = {};
        if (!appData.firstCaughtDate[insectId]) {
          appData.firstCaughtDate[insectId] = new Date().toISOString();
        }
`;

html = html.replace("appData.caught[insectId] = (appData.caught[insectId] || 0) + 1;", "appData.caught[insectId] = (appData.caught[insectId] || 0) + 1;\n" + catchDatePersistence);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully upgraded index.html for PHASE 2 with 50-insects encyclopedia system!');
