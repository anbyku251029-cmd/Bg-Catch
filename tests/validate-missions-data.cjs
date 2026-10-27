const fs = require('fs');

console.log('=== MISSION & REGION DATA VALIDATION ===');

const missionData = JSON.parse(fs.readFileSync('missions.json', 'utf8'));
const insects50 = JSON.parse(fs.readFileSync('insects50.json', 'utf8'));
const insectIdSet = new Set(insects50.map(i => i.id));

const { regions, missions } = missionData;

// 1. Mission Count
console.log('1. Total Missions Count:', missions.length, missions.length === 10 ? '✅ PASS' : '❌ FAIL');

// 2. Unique Mission IDs
const missionIds = new Set();
let dupMissionId = false;
missions.forEach(m => {
  if (missionIds.has(m.missionId)) dupMissionId = true;
  missionIds.add(m.missionId);
});
console.log('2. Unique Mission IDs:', !dupMissionId ? '✅ PASS' : '❌ FAIL');

// 3. Valid Regions
const validRegionIds = new Set(['any', 'meadow', 'oak', 'floor', 'jungle']);
let invalidRegion = false;
missions.forEach(m => {
  if (!validRegionIds.has(m.regionId)) invalidRegion = true;
});
console.log('3. Valid Region IDs:', !invalidRegion ? '✅ PASS' : '❌ FAIL');

// 4. Target Insect IDs Validity
let invalidInsectFound = false;
missions.forEach(m => {
  m.targetInsectIds.forEach(id => {
    if (!insectIdSet.has(id)) {
      console.error(`Invalid insect ID '${id}' in mission '${m.missionId}'`);
      invalidInsectFound = true;
    }
  });
});
console.log('4. Target Insects Exist in 50-Insect Master Data:', !invalidInsectFound ? '✅ PASS' : '❌ FAIL');

// 5. Prerequisites Validity
let invalidPrereq = false;
missions.forEach(m => {
  m.requiredMissionIds.forEach(reqId => {
    if (!missionIds.has(reqId)) {
      console.error(`Invalid prerequisite '${reqId}' in mission '${m.missionId}'`);
      invalidPrereq = true;
    }
  });
});
console.log('5. Prerequisites Exist in Missions:', !invalidPrereq ? '✅ PASS' : '❌ FAIL');

// 6. Badges Completeness
const badgeIds = new Set();
let dupBadge = false;
let missingBadgeField = false;
missions.forEach(m => {
  if (!m.rewardBadge || !m.rewardBadge.id || !m.rewardBadge.name || !m.rewardBadge.icon) {
    missingBadgeField = true;
  }
  if (badgeIds.has(m.rewardBadgeId)) dupBadge = true;
  badgeIds.add(m.rewardBadgeId);
});
console.log('6. Reward Badges Unique & Complete:', (!dupBadge && !missingBadgeField) ? '✅ PASS' : '❌ FAIL');

// 7. Educational Facts
let missingFact = false;
missions.forEach(m => {
  if (!m.educationalFact || m.educationalFact.trim() === '') missingFact = true;
});
console.log('7. Educational Facts Complete:', !missingFact ? '✅ PASS' : '❌ FAIL');

const allPass = missions.length === 10 && !dupMissionId && !invalidRegion && !invalidInsectFound && !invalidPrereq && !dupBadge && !missingBadgeField && !missingFact;
process.exit(allPass ? 0 : 1);
