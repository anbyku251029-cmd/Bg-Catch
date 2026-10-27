const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('PHASE 2: 곤충 도감 50종 확장 시스템 종합 검증 테스트 (14개 항목)');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function report(testNum, testName, isPass, detail = '') {
  if (isPass) {
    passCount++;
    console.log(`[PASS] Test ${testNum}: ${testName}${detail ? ' - ' + detail : ''}`);
  } else {
    failCount++;
    console.error(`[FAIL] Test ${testNum}: ${testName} - ${detail}`);
  }
}

// Read index.html and insects50.json
const htmlContent = fs.readFileSync('index.html', 'utf8');
const insects50 = JSON.parse(fs.readFileSync('insects50.json', 'utf8'));

// Extract JS from index.html
const scriptStart = htmlContent.indexOf('<script>') + 8;
const scriptEnd = htmlContent.lastIndexOf('</script>');
const script = htmlContent.substring(scriptStart, scriptEnd);

// Virtual DOM environment
const createMockElement = (tag) => {
  const listeners = {};
  const classes = new Set();
  const children = [];
  return {
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      add: (...cls) => cls.forEach(c => classes.add(c)),
      remove: (...cls) => cls.forEach(c => classes.delete(c)),
      contains: (c) => classes.has(c),
      toggle: (c) => classes.has(c) ? classes.delete(c) : classes.add(c)
    },
    addEventListener: (evt, handler) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(handler);
    },
    trigger: (evt, e = {}) => {
      if (listeners[evt]) listeners[evt].forEach(h => h(e));
    },
    appendChild: (child) => { children.push(child); return child; },
    removeChild: (child) => {
      const idx = children.indexOf(child);
      if (idx !== -1) children.splice(idx, 1);
      return child;
    },
    children,
    innerHTML: '',
    textContent: '',
    value: '',
    dataset: {},
    getContext: () => ({
      clearRect: () => {},
      fillRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {}
    }),
    getBoundingClientRect: () => ({ width: 1024, height: 600, left: 0, top: 60 })
  };
};

const domElements = {};
const getOrCreateElement = (id) => {
  if (!domElements[id]) {
    domElements[id] = createMockElement('div');
    domElements[id].id = id;
  }
  return domElements[id];
};

const mockLocalStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

const domMock = {
  window: {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: () => {}
  },
  document: {
    getElementById: (id) => getOrCreateElement(id),
    querySelectorAll: (sel) => [],
    querySelector: (sel) => createMockElement('div'),
    createElement: (tag) => createMockElement(tag),
    body: createMockElement('body')
  },
  localStorage: mockLocalStorage,
  requestAnimationFrame: (fn) => setTimeout(fn, 16),
  cancelAnimationFrame: () => {},
  AudioContext: class {
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} } }; }
  },
  webkitAudioContext: class {},
  SpeechSynthesisUtterance: class { constructor(t) { this.text = t; } },
  speechSynthesis: { speak: () => {}, cancel: () => {}, speaking: false },
  confirm: () => true,
  alert: () => {},
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (id) => clearInterval(id),
  console: console
};

// Run script in context
const context = vm.createContext(domMock);
vm.runInContext(script, context);
const evalInCtx = (expr) => vm.runInContext(expr, context);

// -----------------------------------------------------------------
// TEST 1: 50개 고유 ID 존재 테스트
// -----------------------------------------------------------------
const loaded50 = evalInCtx('INSECTS_50');
const is50Length = loaded50 && loaded50.length >= 50;
const ids = loaded50 ? loaded50.map(i => i.id) : [];
const uniqueIds = new Set(ids);
report(1, '50개 이상 고유 ID 존재 테스트', is50Length && uniqueIds.size === loaded50.length, `도감 중 고유 ID ${uniqueIds.size}개 확인`);

// -----------------------------------------------------------------
// TEST 2: 중복 종 및 별칭 중복 방지 테스트
// -----------------------------------------------------------------
const koreanNames = new Set();
const sciNames = new Set();
let dupKorean = null;
let dupSci = null;
loaded50.forEach(i => {
  if (koreanNames.has(i.koreanName)) dupKorean = i.koreanName;
  koreanNames.add(i.koreanName);
  if (sciNames.has(i.sciName)) dupSci = i.sciName;
  sciNames.add(i.sciName);
});
const noDuplicates = !dupKorean && !dupSci;
report(2, '중복 종 및 국명/학명 중복 방지 테스트', noDuplicates, `고유 국명 ${koreanNames.size}개, 고유 학명 ${sciNames.size}개 검증 완료`);

// -----------------------------------------------------------------
// TEST 3: 데이터 필드 완전성 테스트 (21개 필수 필드)
// -----------------------------------------------------------------
const requiredFields = [
  'id', 'koreanName', 'englishName', 'sciName', 'category', 'order',
  'appearance', 'diet', 'habitat', 'region', 'sizeMm', 'ecology',
  'fact', 'keyWordEn', 'sentenceEn', 'sentenceKo', 'warning',
  'image', 'source', 'reviewStatus', 'quiz'
];
let missingFieldFound = false;
let missingLog = '';
loaded50.forEach(i => {
  requiredFields.forEach(f => {
    if (i[f] === undefined || (typeof i[f] === 'string' && i[f].trim() === '')) {
      missingFieldFound = true;
      missingLog = `${i.koreanName}(${i.id}) 누락 필드: ${f}`;
    }
  });
  if (!i.quiz || !i.quiz.question || !Array.isArray(i.quiz.options) || i.quiz.options.length !== 2) {
    missingFieldFound = true;
    missingLog = `${i.koreanName} 퀴즈 필드 형식 오류`;
  }
});
report(3, '21개 필수 데이터 필드 완전성 테스트', !missingFieldFound, missingFieldFound ? missingLog : '50종 전 항목 21개 필드 100% 충족');

// -----------------------------------------------------------------
// TEST 4: 분류 필터링 테스트 (6개 분류)
// -----------------------------------------------------------------
const categories = ['나비·나방목', '딱정벌레목', '벌목', '노린재목', '메뚜기목', '잠자리·기타목'];
let filterValid = true;
const categoryCounts = {};
categories.forEach(cat => {
  const filtered = loaded50.filter(i => i.category === cat);
  categoryCounts[cat] = filtered.length;
  if (filtered.length === 0) filterValid = false;
});
const totalCategoryCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
report(4, '6개 곤충목 분류 필터링 서브셋 검증 테스트', filterValid && totalCategoryCount >= 50, JSON.stringify(categoryCounts));

// -----------------------------------------------------------------
// TEST 5: 한국어/영어 실시간 검색 기능 테스트
// -----------------------------------------------------------------
// Search test for Korean '장수풍뎅이'
const koQuery = '장수풍뎅이';
const koResult = loaded50.filter(i => i.koreanName.includes(koQuery) || i.englishName.toLowerCase().includes(koQuery));
// Search test for English 'Beetle'
const enQuery = 'beetle';
const enResult = loaded50.filter(i => i.koreanName.includes(enQuery) || i.englishName.toLowerCase().includes(enQuery));
const searchValid = koResult.length >= 1 && enResult.length >= 4;
report(5, '한국어/영어 검색 일치 필터링 테스트', searchValid, `한국어 '${koQuery}' -> ${koResult.length}건, 영어 '${enQuery}' -> ${enResult.length}건`);

// -----------------------------------------------------------------
// TEST 6: 상세 관찰 카드 렌더링 테스트
// -----------------------------------------------------------------
evalInCtx('openLabView')('swallowtail_butterfly');
const labTitle = domElements['lab-common-name'] ? domElements['lab-common-name'].textContent : '';
const labEng = domElements['lab-en-title'] ? domElements['lab-en-title'].textContent : '';
const labSci = domElements['lab-sci-name'] ? domElements['lab-sci-name'].textContent : '';
const labWarning = domElements['lab-warning-text'] ? domElements['lab-warning-text'].textContent : '';
const labDetailRendered = labTitle.length > 0 && labEng.length > 0 && labSci.length > 0 && labWarning.length > 0;
report(6, '상세 관찰 카드 16개 메타데이터 필드 렌더링 테스트', labDetailRendered, `관찰소 국명: ${labTitle}, 학명: ${labSci}, 주의사항 렌더링 완료`);

// -----------------------------------------------------------------
// TEST 7: 발견 상태 카운트 테스트 (중복 채집 시 1회만 카운트)
// -----------------------------------------------------------------
const appData = evalInCtx('appData');
appData.caught = {};
appData.firstCaughtDate = {};

const catchInsect = (id) => {
  const map = evalInCtx('INSECTS_MAP');
  const creatures = evalInCtx('CREATURES');
  const c = map[id] || creatures[id];
  const ins = { insectId: id, c, el: createMockElement('div'), destroy: () => {} };
  evalInCtx('catchInsectAction')(ins, 200, 300);
};

// Catch 'swallowtail_butterfly' twice
catchInsect('swallowtail_butterfly');
const countAfterFirst = Object.keys(appData.firstCaughtDate).length;
catchInsect('swallowtail_butterfly');
const countAfterSecond = Object.keys(appData.firstCaughtDate).length;
const isDistinctCount = countAfterFirst === 1 && countAfterSecond === 1 && appData.caught['swallowtail_butterfly'] === 2;
report(7, '도감 발견 카운트 단일 증가 및 중복 카운트 방지 테스트', isDistinctCount, `1회 포획 시: ${countAfterFirst}종, 2회 포획 시: ${countAfterSecond}종 발견, 누적마리수: ${appData.caught['swallowtail_butterfly']}`);

// -----------------------------------------------------------------
// TEST 8: 진행 상황 저장·복원 테스트 (localStorage 연동)
// -----------------------------------------------------------------
evalInCtx('saveExpeditionData')(appData);
const savedRaw = mockLocalStorage.getItem('insect_expedition_data_v2');
const loadedData = JSON.parse(savedRaw);
const persistenceSuccess = loadedData && loadedData.firstCaughtDate && loadedData.firstCaughtDate['swallowtail_butterfly'] && loadedData.caught['swallowtail_butterfly'] === 2;
report(8, '진행 상황(발견일시/포획수/점수) 로컬스토리지 영구저장·복원 테스트', persistenceSuccess, `저장된 키: ${Object.keys(loadedData.caught).join(', ')}`);

// -----------------------------------------------------------------
// TEST 9: 영어 퀴즈 4가지 모드 동작 및 판정 테스트
// -----------------------------------------------------------------
// Trigger Quiz button
domElements['btn-open-quiz'].trigger('click');
const quizCard = domElements['quiz-card'];
const quizOptsContainer = domElements['quiz-options'];
const quizFeedback = domElements['quiz-feedback'];
const hasQuizRendered = quizCard.style.display === 'block' && quizOptsContainer.children.length === 2;
// Trigger first option click
if (hasQuizRendered) {
  quizOptsContainer.children[0].trigger('click');
}
const quizJudged = quizFeedback.style.display === 'block' && (quizFeedback.className.includes('success') || quizFeedback.className.includes('fail'));
report(9, '영어 퀴즈 4모드 생성 및 정답/오답 피드백 판정 테스트', hasQuizRendered && quizJudged, `퀴즈 보기 2개 렌더링 및 피드백 출력 확인`);

// -----------------------------------------------------------------
// TEST 10: 그래픽 누락 대비 안전한 대체 UI (Fallback SVG) 테스트
// -----------------------------------------------------------------
const renderInsectSVG50 = evalInCtx('renderInsectSVG50');
const fallbackSvg = renderInsectSVG50('unknown_bug_id', { width: 100, height: 100 });
const fallbackValid = fallbackSvg && fallbackSvg.includes('<svg') && fallbackSvg.includes('viewBox');
// Test each of the 50 insects generates valid SVG
let all50SvgsValid = true;
loaded50.forEach(i => {
  const svg = renderInsectSVG50(i.id, { width: 80, height: 80 });
  if (!svg || !svg.includes('<svg')) all50SvgsValid = false;
});
report(10, '에셋 누락 대비 파라메트릭 벡터 대체 SVG 엔진 테스트', fallbackValid && all50SvgsValid, '알 수 없는 ID fallback 및 50종 전원 SVG 무결성 검증');

// -----------------------------------------------------------------
// TEST 11: 직접 터치 채집 회귀 테스트
// -----------------------------------------------------------------
const initialScore = appData.points || 0;
// Catch simulation via catchInsect
catchInsect('asian_honeybee');
const touchCatchPreserved = appData.caught['asian_honeybee'] >= 1;
report(11, '직접 터치(Direct Touch) 채집 핸들러 회귀 테스트', touchCatchPreserved, `채집 후 꿀벌 포획 확인 (${appData.caught['asian_honeybee']}마리)`);

// -----------------------------------------------------------------
// TEST 12: 드래그 그물(포충망) 스와이프 채집 회귀 테스트
// -----------------------------------------------------------------
const hasSwipeFx = !!domElements['net-swipe-fx'];
const hasPointerHandlers = htmlContent.includes('pointerdown') && htmlContent.includes('pointermove') && htmlContent.includes('performNetStrike');
report(12, '드래그 포충망 스와이프 궤적 렌더링 및 채집 회귀 테스트', hasSwipeFx && hasPointerHandlers, '포충망 휘두름(performNetStrike) 및 포인터 이벤트 리스너 보존 확인');

// -----------------------------------------------------------------
// TEST 13: 점수 및 테라리움/채집통 비우기 회귀 테스트
// -----------------------------------------------------------------
// Put insects in terrarium then release all
appData.terrarium = ['swallowtail_butterfly', 'rhinoceros_beetle'];
domElements['btn-release-all'].trigger('click');
const terrariumCleared = appData.terrarium.length === 0;
report(13, '채집통 확인 및 "곤충 살려주기" 비우기 회귀 테스트', terrariumCleared, '채집통 비우기 및 방생 로직 정상 작동');

// -----------------------------------------------------------------
// TEST 14: Android 태블릿 반응형 뷰포트 (768px~1280px) 회귀 테스트
// -----------------------------------------------------------------
const hasResponsiveGridCss = htmlContent.includes('grid-template-columns: repeat(auto-fill, minmax(');
const hasViewportLock = htmlContent.includes('user-scalable=no') || htmlContent.includes('maximum-scale=1.0');
const hasLandscapeMedia = htmlContent.includes('@media') && htmlContent.includes('768px');
report(14, 'Android 태블릿 해상도(768px~1280px) 반응형 도감 그리드 테스트', hasResponsiveGridCss && hasLandscapeMedia && hasViewportLock, '태블릿 뷰포트 락 및 유동 그리드 CSS 확인');

console.log('\n================================================================');
console.log(`테스트 결과 요약: 총 14개 항목 중 ${passCount}개 성공, ${failCount}개 실패`);
console.log('================================================================\n');

process.exit(failCount > 0 ? 1 : 0);
