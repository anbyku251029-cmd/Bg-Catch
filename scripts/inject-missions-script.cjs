const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const missionData = JSON.parse(fs.readFileSync('missions.json', 'utf8'));

const missionScript = `
      /* ==========================================================================
         PHASE 3: ECO-EXPLORATION MISSION ENGINE & HABITAT CONNECTOR
         ========================================================================== */
      const MISSIONS_MASTER = ${JSON.stringify(missionData.missions, null, 2)};
      const REGIONS_MASTER = ${JSON.stringify(missionData.regions, null, 2)};

      class MissionEngine {
        constructor() {
          this.missions = MISSIONS_MASTER;
          this.regions = REGIONS_MASTER;
          this.activeFilter = 'all';
          this.selectedDetailMissionId = null;
        }

        init() {
          // Initialize appData fields if not present
          if (!appData.completedMissions) appData.completedMissions = [];
          if (!appData.activeMissionId) appData.activeMissionId = 'mission_1';
          if (!appData.missionProgress) appData.missionProgress = {};
          if (!appData.earnedBadges) appData.earnedBadges = [];
          if (!appData.observedInsects) appData.observedInsects = [];
          if (!appData.releasedInsects) appData.releasedInsects = [];
          if (!appData.completedQuizzes) appData.completedQuizzes = [];

          this.updateHeaderBadge();
          this.bindDOM();
        }

        getMissionStatus(missionId) {
          if (appData.completedMissions && appData.completedMissions.includes(missionId)) return 'COMPLETED';
          const m = this.missions.find(item => item.missionId === missionId);
          if (!m) return 'LOCKED';

          // Check prerequisites
          const prereqsMet = m.requiredMissionIds.every(reqId => (appData.completedMissions || []).includes(reqId));
          if (!prereqsMet) return 'LOCKED';

          if (appData.activeMissionId === missionId) return 'IN_PROGRESS';
          return 'AVAILABLE';
        }

        // --- Event Handlers from Game ---
        onInsectDiscovered(insectId) {
          if (!insectId) return;

          // Mission 1: First discovery of any insect
          if (!appData.completedMissions.includes('mission_1')) {
            this.completeMission('mission_1');
          }

          // Mission 6: Forest beetles in oak zone
          if (!appData.completedMissions.includes('mission_6')) {
            const m6 = this.missions.find(m => m.missionId === 'mission_6');
            if (m6 && m6.targetInsectIds.includes(insectId)) {
              this.completeMission('mission_6');
            }
          }
        }

        onInsectObserved(insectId, part) {
          if (!insectId) return;
          if (!appData.observedInsects.includes(insectId)) {
            appData.observedInsects.push(insectId);
            saveExpeditionData(appData);
          }

          // Mission 2: Flower field insect observed
          if (!appData.completedMissions.includes('mission_2')) {
            const m2 = this.missions.find(m => m.missionId === 'mission_2');
            if (m2 && m2.targetInsectIds.includes(insectId)) {
              this.completeMission('mission_2');
            }
          }

          // Mission 4: Ladybug observed & card inspected
          if (!appData.completedMissions.includes('mission_4')) {
            if (insectId === 'ladybug') {
              this.completeMission('mission_4');
            }
          }

          // Mission 7: Water explorer observed
          if (!appData.completedMissions.includes('mission_7')) {
            const m7 = this.missions.find(m => m.missionId === 'mission_7');
            if (m7 && m7.targetInsectIds.includes(insectId)) {
              this.completeMission('mission_7');
            }
          }
        }

        onQuizCompleted(quizType, insectId) {
          if (!appData.completedQuizzes.includes(quizType)) {
            appData.completedQuizzes.push(quizType);
            saveExpeditionData(appData);
          }

          // Mission 3: Wing anatomy quiz
          if (quizType === 'WING' && !appData.completedMissions.includes('mission_3')) {
            this.completeMission('mission_3');
          }

          // Mission 5: Pollen quiz
          if (quizType === 'POLLEN' && !appData.completedMissions.includes('mission_5')) {
            this.completeMission('mission_5');
          }

          // Mission 8: Life cycle quiz
          if (quizType === 'LIFECYCLE' && !appData.completedMissions.includes('mission_8')) {
            this.completeMission('mission_8');
          }

          // Mission 9: English quiz
          if (quizType === 'ENGLISH' && !appData.completedMissions.includes('mission_9')) {
            this.completeMission('mission_9');
          }
        }

        onInsectReleased(insectId) {
          if (!appData.completedMissions.includes('mission_10')) {
            this.completeMission('mission_10');
          }
        }

        // --- Complete Mission & Award Badge (Single Payout Guarantee) ---
        completeMission(missionId) {
          if (appData.completedMissions.includes(missionId)) return; // Prevent double reward

          const m = this.missions.find(item => item.missionId === missionId);
          if (!m) return;

          // Check prerequisite
          const prereqsMet = m.requiredMissionIds.every(reqId => appData.completedMissions.includes(reqId));
          if (!prereqsMet) return;

          appData.completedMissions.push(missionId);
          if (!appData.earnedBadges.includes(m.rewardBadgeId)) {
            appData.earnedBadges.push(m.rewardBadgeId);
          }
          appData.points = (appData.points || 0) + (m.rewardPoints || 50);

          // Find next available mission to set as active
          const nextMission = this.missions.find(item => !appData.completedMissions.includes(item.missionId) &&
            item.requiredMissionIds.every(req => appData.completedMissions.includes(req))
          );
          if (nextMission) {
            appData.activeMissionId = nextMission.missionId;
          }

          saveExpeditionData(appData);
          this.updateHeaderBadge();

          // Audio & Confetti
          audio.playFanfare();
          triggerConfetti();

          // Show celebration popup
          this.showCelebration(m);
        }

        showCelebration(m) {
          const badge = m.rewardBadge;
          const iconEl = document.getElementById('celebration-badge-icon');
          const nameEl = document.getElementById('celebration-badge-name');
          const descEl = document.getElementById('celebration-badge-desc');
          const factEl = document.getElementById('celebration-fact');
          const ptsEl = document.getElementById('celebration-reward-pts');

          if (iconEl) iconEl.textContent = badge.icon;
          if (nameEl) nameEl.textContent = badge.name;
          if (descEl) descEl.textContent = badge.description;
          if (factEl) factEl.innerHTML = \`<strong>💡 새로 배운 생태 지식:</strong> \${m.educationalFact}\`;
          if (ptsEl) ptsEl.textContent = \`+\${m.rewardPoints || 50} 탐험 점수 획득!\`;

          const modal = document.getElementById('mission-complete-modal');
          if (modal) modal.style.display = 'flex';
        }

        updateHeaderBadge() {
          const badgeEl = document.getElementById('header-mission-badge');
          if (badgeEl) {
            badgeEl.textContent = \`\${(appData.completedMissions || []).length}/10\`;
          }
        }

        bindDOM() {
          const btnOpenMissions = document.getElementById('btn-open-missions');
          const missionModal = document.getElementById('mission-modal');
          const btnCloseMissionModal = document.getElementById('btn-close-mission-modal');

          if (btnOpenMissions) {
            btnOpenMissions.addEventListener('click', () => {
              audio.playTap();
              this.renderMissionList();
              if (missionModal) missionModal.style.display = 'flex';
            });
          }

          if (btnCloseMissionModal) {
            btnCloseMissionModal.addEventListener('click', () => {
              audio.playTap();
              if (missionModal) missionModal.style.display = 'none';
            });
          }

          // Filter tabs
          const filterBtns = document.querySelectorAll('.btn-mission-filter');
          filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              audio.playTap();
              filterBtns.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              this.activeFilter = btn.dataset.filter;
              this.renderMissionList();
            });
          });

          // Detail Modal Close
          const btnCloseDetail = document.getElementById('btn-close-mission-detail');
          const detailModal = document.getElementById('mission-detail-modal');
          if (btnCloseDetail) {
            btnCloseDetail.addEventListener('click', () => {
              audio.playTap();
              if (detailModal) detailModal.style.display = 'none';
            });
          }

          // Detail Modal Action Buttons
          const btnGotoRegion = document.getElementById('btn-detail-goto-region');
          const btnStartAction = document.getElementById('btn-detail-start-action');

          if (btnGotoRegion) {
            btnGotoRegion.addEventListener('click', () => {
              audio.playTap();
              const m = this.missions.find(item => item.missionId === this.selectedDetailMissionId);
              if (m && m.regionId && m.regionId !== 'any') {
                renderZoneStage(m.regionId);
                // Also update zone tabs UI
                document.querySelectorAll('.zone-tab').forEach(t => {
                  t.classList.toggle('active', t.dataset.zone === m.regionId);
                });
              }
              if (detailModal) detailModal.style.display = 'none';
              if (missionModal) missionModal.style.display = 'none';
            });
          }

          if (btnStartAction) {
            btnStartAction.addEventListener('click', () => {
              audio.playTap();
              const m = this.missions.find(item => item.missionId === this.selectedDetailMissionId);
              if (m) {
                appData.activeMissionId = m.missionId;
                saveExpeditionData(appData);

                // Special quiz launch if ANATOMY_QUESTION, QUIZ, or LIFE_CYCLE
                if (m.missionType === 'ANATOMY_QUESTION' || m.missionType === 'QUIZ' || m.missionType === 'LIFE_CYCLE') {
                  this.openSpecialQuiz(m);
                  if (detailModal) detailModal.style.display = 'none';
                  if (missionModal) missionModal.style.display = 'none';
                  return;
                }

                if (m.regionId && m.regionId !== 'any') {
                  renderZoneStage(m.regionId);
                  document.querySelectorAll('.zone-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.zone === m.regionId);
                  });
                }
              }
              if (detailModal) detailModal.style.display = 'none';
              if (missionModal) missionModal.style.display = 'none';
            });
          }

          // Celebration Modal Buttons
          const btnCelebClose = document.getElementById('btn-celebration-close');
          const btnCelebNext = document.getElementById('btn-celebration-next');
          const celebModal = document.getElementById('mission-complete-modal');

          if (btnCelebClose) {
            btnCelebClose.addEventListener('click', () => {
              audio.playTap();
              if (celebModal) celebModal.style.display = 'none';
            });
          }
          if (btnCelebNext) {
            btnCelebNext.addEventListener('click', () => {
              audio.playTap();
              if (celebModal) celebModal.style.display = 'none';
              this.renderMissionList();
              if (missionModal) missionModal.style.display = 'flex';
            });
          }

          // Special Quiz Close
          const btnCloseSpecialQuiz = document.getElementById('btn-close-special-quiz');
          const specialQuizModal = document.getElementById('mission-quiz-modal');
          if (btnCloseSpecialQuiz) {
            btnCloseSpecialQuiz.addEventListener('click', () => {
              audio.playTap();
              if (specialQuizModal) specialQuizModal.style.display = 'none';
            });
          }
        }

        renderMissionList() {
          const container = document.getElementById('mission-cards-container');
          if (!container) return;
          container.innerHTML = '';

          // Update stats
          const compCountEl = document.getElementById('mission-completed-count');
          const badgeCountEl = document.getElementById('mission-badge-count');
          if (compCountEl) compCountEl.textContent = (appData.completedMissions || []).length;
          if (badgeCountEl) badgeCountEl.textContent = (appData.earnedBadges || []).length;

          // Filter
          let filtered = this.missions;
          if (this.activeFilter !== 'all') {
            filtered = this.missions.filter(m => m.regionId === this.activeFilter || m.regionId === 'any');
          }

          filtered.forEach(m => {
            const status = this.getMissionStatus(m.missionId);
            const badge = m.rewardBadge;

            const card = document.createElement('div');
            card.className = \`mission-card status-\${status.toLowerCase().replace('_', '-')}\`;

            let statusLabel = '시작 가능';
            let statusPillClass = 'status-pill-available';
            if (status === 'COMPLETED') {
              statusLabel = '완료됨 ✅';
              statusPillClass = 'status-pill-completed';
            } else if (status === 'IN_PROGRESS') {
              statusLabel = '진행 중 🚀';
              statusPillClass = 'status-pill-in-progress';
            } else if (status === 'LOCKED') {
              statusLabel = '잠김 🔒';
              statusPillClass = 'status-pill-locked';
            }

            card.innerHTML = \`
              <div class="mission-card-top">
                <div class="mission-card-badge-preview">\${badge.icon}</div>
                <span class="mission-status-pill \${statusPillClass}">\${statusLabel}</span>
              </div>
              <div class="mission-card-title">미션 \${m.order}. \${m.title}</div>
              <div class="mission-card-desc">\${m.description}</div>
              <div class="mission-card-footer">
                <span style="font-size:0.75rem; color:#38bdf8; font-weight:700;">보상: \${badge.name}</span>
                <span style="font-size:0.75rem; color:#fbbf24; font-weight:800;">+\${m.rewardPoints}pt</span>
              </div>
            \`;

            card.addEventListener('click', () => {
              if (status === 'LOCKED') {
                audio.playMiss();
                alert('이전 미션을 먼저 완료해야 이 미션이 해금됩니다! 🔒');
                return;
              }
              audio.playTap();
              this.openMissionDetail(m);
            });

            container.appendChild(card);
          });
        }

        openMissionDetail(m) {
          this.selectedDetailMissionId = m.missionId;
          const badge = m.rewardBadge;

          const badgeIconEl = document.getElementById('detail-mission-badge-icon');
          const titleEl = document.getElementById('detail-mission-title');
          const bIconEl = document.getElementById('detail-badge-icon');
          const bNameEl = document.getElementById('detail-badge-name');
          const bDescEl = document.getElementById('detail-badge-desc');
          const descEl = document.getElementById('detail-mission-desc');
          const condEl = document.getElementById('detail-mission-condition');
          const factEl = document.getElementById('detail-mission-fact');

          if (badgeIconEl) badgeIconEl.textContent = badge.icon;
          if (titleEl) titleEl.textContent = \`미션 \${m.order}. \${m.title}\`;
          if (bIconEl) bIconEl.textContent = badge.icon;
          if (bNameEl) bNameEl.textContent = badge.name;
          if (bDescEl) bDescEl.textContent = badge.description;
          if (descEl) descEl.textContent = m.description;
          if (condEl) condEl.textContent = \`🎯 달성 조건: \${m.completionCondition}\`;
          if (factEl) factEl.innerHTML = \`<strong>💡 생태 탐험 쏙쏙 상식:</strong> \${m.educationalFact}\`;

          // Target insect chips
          const targetRow = document.getElementById('detail-mission-targets');
          if (targetRow) {
            targetRow.innerHTML = '';
            m.targetInsectIds.forEach(tId => {
              const insectData = INSECTS_MAP[tId] || CREATURES[tId];
              if (insectData) {
                const chip = document.createElement('div');
                chip.className = 'mission-target-chip';
                chip.innerHTML = \`<span>🔍</span> <span>\${insectData.koreanName} (\${insectData.englishName})</span>\`;
                targetRow.appendChild(chip);
              }
            });
          }

          // Show/Hide Go-To-Region button
          const btnGotoRegion = document.getElementById('btn-detail-goto-region');
          if (btnGotoRegion) {
            if (m.regionId && m.regionId !== 'any') {
              btnGotoRegion.style.display = 'flex';
            } else {
              btnGotoRegion.style.display = 'none';
            }
          }

          const detailModal = document.getElementById('mission-detail-modal');
          if (detailModal) detailModal.style.display = 'flex';
        }

        openSpecialQuiz(m) {
          if (!m.quiz) return;
          const modal = document.getElementById('mission-quiz-modal');
          const questionEl = document.getElementById('special-quiz-question');
          const optionsEl = document.getElementById('special-quiz-options');
          const feedbackEl = document.getElementById('special-quiz-feedback');
          const titleEl = document.getElementById('special-quiz-title');

          if (titleEl) titleEl.textContent = m.title;
          if (questionEl) questionEl.textContent = m.quiz.question;
          if (optionsEl) optionsEl.innerHTML = '';
          if (feedbackEl) feedbackEl.style.display = 'none';

          m.quiz.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-quiz-opt';
            btn.textContent = \`\${idx + 1}. \${opt}\`;
            btn.addEventListener('click', () => {
              if (idx === m.quiz.answer) {
                audio.playFanfare();
                btn.classList.add('correct');
                if (feedbackEl) {
                  feedbackEl.className = 'quiz-feedback success';
                  feedbackEl.innerHTML = \`🎉 <b>정답이에요! 대단해요!</b> \${m.quiz.tip}\`;
                  feedbackEl.style.display = 'block';
                }

                let qType = 'GENERAL';
                if (m.missionType === 'ANATOMY_QUESTION') qType = 'WING';
                if (m.missionType === 'QUIZ') qType = 'POLLEN';
                if (m.missionType === 'LIFE_CYCLE') qType = 'LIFECYCLE';

                setTimeout(() => {
                  if (modal) modal.style.display = 'none';
                  this.onQuizCompleted(qType, m.relatedInsectId);
                }, 1500);
              } else {
                audio.playMiss();
                btn.classList.add('wrong');
                if (feedbackEl) {
                  feedbackEl.className = 'quiz-feedback fail';
                  feedbackEl.innerHTML = \`괜찮아요, 다시 도전해 보세요! 힌트: \${m.quiz.tip}\`;
                  feedbackEl.style.display = 'block';
                }
              }
            });
            if (optionsEl) optionsEl.appendChild(btn);
          });

          if (modal) modal.style.display = 'flex';
        }
      }

      // Instantiate Mission Engine
      const missionEngine = new MissionEngine();
`;

// Find where 14. INITIALIZATION is
const initHeader = "/* ==========================================================================\n         14. INITIALIZATION";
const idx = html.indexOf(initHeader);
if (idx === -1) {
  console.error("Could not find initialization header!");
  process.exit(1);
}

html = html.substring(0, idx) + missionScript + "\n      " + html.substring(idx);

// Add missionEngine.init() after renderZoneStage('oak')
html = html.replace("renderZoneStage('oak');", "renderZoneStage('oak');\n      missionEngine.init();");

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully injected MissionEngine into index.html!');
