const fs = require('fs');
const vm = require('vm');

const content = fs.readFileSync('index.html', 'utf8');
const scriptStart = content.indexOf('<script>') + 8;
const scriptEnd = content.lastIndexOf('</script>');
const script = content.substring(scriptStart, scriptEnd);

console.log('=== BASELINE INSPECTION & TEST ===');

// 1. Script Syntax
try {
  new Function(script);
  console.log('1. Script Syntax: PASS');
} catch (e) {
  console.error('1. Script Syntax: FAIL -', e);
}

// 2. CREATURES Count & IDs
const p = content.indexOf('const CREATURES = {');
const p2 = content.indexOf('const INSECTS_50 =') !== -1 ? content.indexOf('const INSECTS_50 =') : content.indexOf('function renderInsectSVG');
const sub = content.substring(p, p2);
const objStr = sub.substring(sub.indexOf('{'), sub.lastIndexOf('}') + 1);
const fn = new Function('return ' + objStr);
const creatures = fn();
const currentIds = Object.keys(creatures);
console.log('2. Current Creature Count:', currentIds.length, currentIds);

// 3. Virtual DOM Execution
const createEl = (tag) => ({
  style: {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  addEventListener: () => {},
  appendChild: () => {},
  remove: () => {},
  getContext: () => ({ clearRect: () => {}, fillRect: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {} }),
  getBoundingClientRect: () => ({ width: 1024, height: 600, left: 0, top: 60 })
});

const domMock = {
  window: { innerWidth: 1024, innerHeight: 768, addEventListener: () => {} },
  document: {
    getElementById: (id) => createEl('div'),
    querySelectorAll: () => [],
    createElement: (tag) => createEl(tag),
    body: { appendChild: () => {} }
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  requestAnimationFrame: (fn) => setTimeout(fn, 16),
  cancelAnimationFrame: () => {},
  AudioContext: class {},
  webkitAudioContext: class {},
  SpeechSynthesisUtterance: class {},
  speechSynthesis: { speak: () => {}, cancel: () => {}, speaking: false },
  confirm: () => true,
  alert: () => {}
};

try {
  vm.runInNewContext(script, domMock);
  console.log('3. Virtual DOM Execution: PASS (Zero runtime errors)');
  process.exit(0);
} catch (e) {
  console.error('3. Virtual DOM Execution: FAIL -', e);
  process.exit(1);
}
