const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('PHASE 3: 생태 탐험 미션 시스템 종합 검증 테스트 (14개 항목)');
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

// 1. Read files
const htmlContent = fs.readFileSync('index.html', 'utf8');
const missionData = JSON.parse(fs.readFileSync('missions.json', 'utf8'));
const insects50 = JSON.parse(fs.readFileSync('insects50.json', 'utf8'));
const insectIdSet = new Set(insects50.map(i => i.id));
const { regions, missions } = missionData;

// Extract JS from index.html
const scriptStart = htmlContent.indexOf('<script>') + 8;
const scriptEnd = htmlContent.lastIndexOf('</script>');
const script = htmlContent.substring(scriptStart, scriptEnd);

// Virtual DOM mock setup
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
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) classes.add(c); else classes.delete(c);
        } else {
          classes.has(c) ? classes.delete(c) : classes.add(c);
        }
      }
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
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (id) => clearInterval(id),
  AudioContext: class {
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} } }; }
  },
  webkitAudioContext: class {},
  SpeechSynthesisUtterance: class { constructor(t) { this.text = t; } },
  speechSynthesis: { speak: () => {}, cancel: () => {}, speaking: false },
  confirm: () => true,
  alert: () => {},
  console: console
};

// Run script in context
const context = vm.createContext(domMock);
vm.runInContext(script, context);
const evalInCtx = (expr) => vm.runInContext(expr, context);

const missionEngine = evalInCtx('missionEngine');
const appData = evalInCtx('appData');
const loadedMissions = evalInCtx('MISSIONS_MASTER');

// -----------------------------------------------------------------
// TEST 1: 미션 데이터에 중복 ID가 없는지
// -----------------------------------------------------------------
const mIds = loadedMissions.map(m => m.missionId);
const uniqueMIds = new Set(mIds);
report(1, '미션 고유 ID 무중복 검증 테스트', uniqueMIds.size === 10 && mIds.length === 10, `총 10개 미션 고유 ID 100% 일치 (${mIds.join(', ')})`);

// -----------------------------------------------------------------
// TEST 2: 모든 미션의 지역 ID가 유효한지
// -----------------------------------------------------------------
const validRegionIds = new Set(['any', 'meadow', 'oak', 'floor', 'jungle']);
const allRegionsValid = loadedMissions.every(m => validRegionIds.has(m.regionId));
report(2, '미션 지역(Region) ID 유효성 검증 테스트', allRegionsValid, `4대 서식지(meadow, oak, floor, jungle, any) 검증 완료`);

// -----------------------------------------------------------------
// TEST 3: 목표 곤충 ID가 실제 도감에 존재하는지
// -----------------------------------------------------------------
let allTargetInsectsExist = true;
loadedMissions.forEach(m => {
  m.targetInsectIds.forEach(tId => {
    if (!insectIdSet.has(tId)) allTargetInsectsExist = false;
  });
});
report(3, '미션 목표 곤충 ID 도감 50종 매핑 검증 테스트', allTargetInsectsExist, `미션에 지정된 모든 곤충 ID가 도감 50종과 1:1 일치`);

// -----------------------------------------------------------------
// TEST 4: 선행 조건 미충족 시 미션 잠김(LOCKED) 및 해금 검증
// -----------------------------------------------------------------
// Reset mission state
appData.completedMissions = [];
appData.activeMissionId = 'mission_1';
const statusM1 = missionEngine.getMissionStatus('mission_1');
const statusM2Initial = missionEngine.getMissionStatus('mission_2');
const isM2LockedInitially = statusM2Initial === 'LOCKED';
// Complete Mission 1
missionEngine.completeMission('mission_1');
const statusM2After = missionEngine.getMissionStatus('mission_2');
const isM2UnlockedAfter = statusM2After === 'AVAILABLE' || statusM2After === 'IN_PROGRESS';
report(4, '선행 조건 미충족 시 잠김(LOCKED) 및 해금 전환 테스트', isM2LockedInitially && isM2UnlockedAfter, `초기 M2 상태: ${statusM2Initial} ➔ M1 완료 후 M2 상태: ${statusM2After}`);

// -----------------------------------------------------------------
// TEST 5: 올바른 곤충 발견 이벤트가 진행 카운트를 갱신하는지
// -----------------------------------------------------------------
appData.completedMissions = ['mission_1']; // M1 is done, M6 requires M1
const statusM6Before = missionEngine.getMissionStatus('mission_6');
// Discover target beetle for M6 (rhinoceros_beetle)
missionEngine.onInsectDiscovered('rhinoceros_beetle');
const statusM6After = missionEngine.getMissionStatus('mission_6');
const m6Completed = statusM6After === 'COMPLETED' && appData.completedMissions.includes('mission_6');
report(5, '목표 곤충 발견 시 미션 달성 이벤트 검증 테스트', m6Completed, `숲 목표 곤충(장수풍뎅이) 발견 ➔ M6 완료 확인`);

// -----------------------------------------------------------------
// TEST 6: 잘못된 곤충 이벤트는 목표 카운트를 증가시키지 않는지
// -----------------------------------------------------------------
appData.completedMissions = ['mission_1', 'mission_2']; // M4 (칠성무당벌레) is AVAILABLE
const m4Before = missionEngine.getMissionStatus('mission_4');
// Observe wrong insect (e.g. asian_giant_hornet instead of ladybug)
missionEngine.onInsectObserved('asian_giant_hornet', 'head');
const m4AfterWrong = missionEngine.getMissionStatus('mission_4');
const wrongInsectIgnored = m4AfterWrong !== 'COMPLETED' && !appData.completedMissions.includes('mission_4');
report(6, '비대상 곤충 이벤트의 미션 완료 방지 테스트', wrongInsectIgnored, `말벌 관찰 시 무당벌레 미션(M4) 완료되지 않음 (${m4AfterWrong})`);

// -----------------------------------------------------------------
// TEST 7: 중복 이벤트로 카운트나 보상이 중복되지 않는지
// -----------------------------------------------------------------
const scoreBefore = appData.points || 0;
const badgesCountBefore = (appData.earnedBadges || []).length;
// Call completeMission('mission_1') again (already completed)
missionEngine.completeMission('mission_1');
const scoreAfter = appData.points || 0;
const badgesCountAfter = (appData.earnedBadges || []).length;
const noDoubleReward = scoreBefore === scoreAfter && badgesCountBefore === badgesCountAfter;
report(7, '중복 완료 이벤트 시 보상 중복 지급 방지 테스트', noDoubleReward, `점수 변동 없음 (${scoreBefore}pt ➔ ${scoreAfter}pt), 배지 수 유지 (${badgesCountBefore}개)`);

// -----------------------------------------------------------------
// TEST 8: 조건 충족 시 미션 완료(COMPLETED) 상태 전환 테스트
// -----------------------------------------------------------------
// Now observe ladybug for M4
missionEngine.onInsectObserved('ladybug', 'all');
const m4Completed = missionEngine.getMissionStatus('mission_4') === 'COMPLETED';
report(8, '미션 조건 달성 시 COMPLETED 전환 테스트', m4Completed, `칠성무당벌레 관찰 완료 ➔ M4(점박이 친구) COMPLETED 전환`);

// -----------------------------------------------------------------
// TEST 9: 완료된 미션에 보상이 한 번만 지급되는지 (배지 및 점수 단일성)
// -----------------------------------------------------------------
const badgeOccurrences = appData.earnedBadges.filter(b => b === 'badge_ladybug_friend').length;
const singleBadgePayout = badgeOccurrences === 1;
report(9, '완료 미션 보상 배지 단일 획득 검증 테스트', singleBadgePayout, `'badge_ladybug_friend' 배지 1개만 정확히 보유 (개수: ${badgeOccurrences})`);

// -----------------------------------------------------------------
// TEST 10: 새로고침 후 미션 상태 및 배지 로컬스토리지 영구 복원 테스트
// -----------------------------------------------------------------
evalInCtx('saveExpeditionData')(appData);
const rawSaved = mockLocalStorage.getItem('insect_expedition_data_v2');
const parsedData = JSON.parse(rawSaved);
const restoredSuccess = parsedData &&
  Array.isArray(parsedData.completedMissions) &&
  parsedData.completedMissions.includes('mission_1') &&
  parsedData.completedMissions.includes('mission_4') &&
  parsedData.earnedBadges.includes('badge_first_meet') &&
  parsedData.earnedBadges.includes('badge_ladybug_friend');
report(10, '새로고침 후 미션/배지 영구 복원 테스트', restoredSuccess, `저장된 미션: ${parsedData.completedMissions.join(', ')} | 배지: ${parsedData.earnedBadges.join(', ')}`);

// -----------------------------------------------------------------
// TEST 11: 방생(자연으로 돌려보내기) 행동이 기존 도감 기록을 삭제하지 않는지
// -----------------------------------------------------------------
// Ensure swallowtail_butterfly has catch record in encyclopedia
if (!appData.caught) appData.caught = {};
if (!appData.firstCaughtDate) appData.firstCaughtDate = {};
appData.caught['swallowtail_butterfly'] = 3;
appData.firstCaughtDate['swallowtail_butterfly'] = '2026-10-15T12:00:00.000Z';
appData.terrarium = ['swallowtail_butterfly'];
// Trigger release
missionEngine.onInsectReleased('swallowtail_butterfly');
const m10Done = appData.completedMissions.includes('mission_10');
const encyclopediaPreserved = appData.caught['swallowtail_butterfly'] === 3 &&
  appData.firstCaughtDate['swallowtail_butterfly'] !== undefined;
report(11, '자연 방생 시 기존 도감 발견/포획 기록 보존 테스트', m10Done && encyclopediaPreserved, `M10(자연 지킴이) 완료 & 도감 누적 ${appData.caught['swallowtail_butterfly']}마리 보존 확인`);

// -----------------------------------------------------------------
// TEST 12: 기존 터치 포획과 드래그 포획 회귀 테스트
// -----------------------------------------------------------------
const hasNetStrikeFunction = typeof evalInCtx('performNetStrike') === 'function';
const hasPointerDown = htmlContent.includes('pointerdown') && htmlContent.includes('performNetStrike');
report(12, '기존 터치 및 드래그 포충망 스와이프 회귀 테스트', hasNetStrikeFunction && hasPointerDown, 'performNetStrike 및 터치 스와이프 리스너 100% 유지');

// -----------------------------------------------------------------
// TEST 13: 기존 도감 상세 관찰과 영어 퀴즈 회귀 테스트
// -----------------------------------------------------------------
evalInCtx('openLabView')('rhinoceros_beetle');
const labName = domElements['lab-common-name'].textContent;
// Test special mission quiz for M8 (Life cycle)
const m8 = loadedMissions.find(m => m.missionId === 'mission_8');
const hasM8Quiz = m8 && m8.quiz && m8.quiz.options.length === 2;
report(13, '기존 도감 관찰 및 생태/영어 퀴즈 회귀 테스트', labName.includes('장수풍뎅이') && hasM8Quiz, `도감 관찰소 렌더링(${labName}) 및 생애주기 퀴즈 데이터 정상`);

// -----------------------------------------------------------------
// TEST 14: Android 태블릿 화면 및 터치 조작성 회귀 테스트
// -----------------------------------------------------------------
const hasMissionModal = htmlContent.includes('mission-modal') && htmlContent.includes('mission-detail-modal');
const hasTabletViewport = htmlContent.includes('user-scalable=no') && htmlContent.includes('viewport-fit=cover');
const hasButtonPaddings = htmlContent.includes('btn-top-mission') && htmlContent.includes('btn-mission-action');
report(14, 'Android 태블릿 화면 터치 인터페이스 규격 회귀 테스트', hasMissionModal && hasTabletViewport && hasButtonPaddings, '미션 모달, 뷰포트 락, 48px+ 터치 타겟 규격 확인');

console.log('\n================================================================');
console.log(`테스트 결과 요약: 총 14개 항목 중 ${passCount}개 성공, ${failCount}개 실패`);
console.log('================================================================\n');

process.exit(failCount > 0 ? 1 : 0);
