const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const missionData = JSON.parse(fs.readFileSync('missions.json', 'utf8'));

// =========================================================================
// 1. PHASE 3 CSS STYLES
// =========================================================================
const phase3Styles = `
      /* --- PHASE 3 MISSION & ECO-EXPLORATION STYLES --- */
      .btn-top-mission {
        display: flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: 2px solid rgba(255, 255, 255, 0.4);
        color: #ffffff;
        font-weight: 800;
        font-size: 0.85rem;
        padding: 7px 14px;
        border-radius: 9999px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .btn-top-mission:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
      }
      .btn-top-mission:active {
        transform: translateY(0) scale(0.96);
      }

      /* Mission List Modal */
      .mission-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.88);
        backdrop-filter: blur(8px);
        z-index: 9200;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px;
        animation: fadeIn 0.25s ease;
      }

      .mission-modal-panel {
        width: 100%;
        max-width: 900px;
        max-height: 90vh;
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid rgba(56, 189, 248, 0.4);
        border-radius: 24px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      }

      .mission-modal-header {
        padding: 16px 20px;
        background: rgba(30, 41, 59, 0.85);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .mission-modal-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.25rem;
        font-weight: 800;
        color: #f8fafc;
      }

      .mission-stats-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 20px;
        background: rgba(15, 23, 42, 0.7);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.88rem;
        font-weight: 700;
        color: #cbd5e1;
      }

      .mission-filter-tabs {
        display: flex;
        gap: 8px;
        padding: 10px 20px;
        background: rgba(15, 23, 42, 0.9);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        overflow-x: auto;
      }

      .btn-mission-filter {
        flex-shrink: 0;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.82rem;
        font-weight: 700;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(30, 41, 59, 0.8);
        color: #cbd5e1;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-mission-filter.active {
        background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
        color: #ffffff;
        border-color: #38bdf8;
        box-shadow: 0 2px 8px rgba(56, 189, 248, 0.4);
      }

      .mission-cards-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 18px 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 14px;
      }

      .mission-card {
        background: rgba(30, 41, 59, 0.8);
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        overflow: hidden;
      }
      .mission-card:hover {
        transform: translateY(-3px);
        border-color: #38bdf8;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
      }
      .mission-card.status-completed {
        border-color: #10b981;
        background: linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(30, 41, 59, 0.9) 100%);
      }
      .mission-card.status-in-progress {
        border-color: #f59e0b;
        background: linear-gradient(180deg, rgba(245, 158, 11, 0.12) 0%, rgba(30, 41, 59, 0.9) 100%);
      }
      .mission-card.status-locked {
        opacity: 0.6;
        cursor: not-allowed;
        filter: grayscale(40%);
      }

      .mission-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .mission-card-badge-preview {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .mission-status-pill {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 9999px;
      }
      .status-pill-locked { background: #475569; color: #cbd5e1; }
      .status-pill-available { background: #0284c7; color: #ffffff; }
      .status-pill-in-progress { background: #d97706; color: #ffffff; }
      .status-pill-completed { background: #059669; color: #ffffff; }

      .mission-card-title {
        font-size: 0.98rem;
        font-weight: 800;
        color: #f8fafc;
        line-height: 1.3;
      }

      .mission-card-desc {
        font-size: 0.8rem;
        color: #94a3b8;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .mission-card-footer {
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      /* Mission Detail Modal */
      .mission-detail-panel {
        max-width: 620px;
      }

      .mission-detail-body {
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .mission-detail-badge-box {
        display: flex;
        align-items: center;
        gap: 14px;
        background: rgba(15, 23, 42, 0.7);
        padding: 14px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .mission-detail-badge-icon {
        font-size: 2.8rem;
        width: 68px;
        height: 68px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 18px;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .mission-fact-box {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 95, 70, 0.25) 100%);
        border: 1px solid #10b981;
        border-radius: 14px;
        padding: 12px 14px;
        color: #a7f3d0;
        font-size: 0.85rem;
        line-height: 1.45;
      }

      .mission-targets-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 6px;
      }

      .mission-target-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 0, 0, 0.4);
        padding: 4px 10px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        font-size: 0.78rem;
        color: #f1f5f9;
        font-weight: 700;
      }

      .mission-actions-row {
        display: flex;
        gap: 10px;
        padding: 16px 20px;
        background: rgba(15, 23, 42, 0.9);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .btn-mission-action {
        flex: 1;
        padding: 12px;
        border-radius: 14px;
        font-size: 0.92rem;
        font-weight: 800;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.15s ease;
      }
      .btn-mission-action.primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
      .btn-mission-action.secondary {
        background: rgba(51, 65, 85, 0.8);
        color: #e2e8f0;
      }
      .btn-mission-action:active {
        transform: scale(0.97);
      }

      /* Complete Celebration Modal */
      .complete-celebration-panel {
        max-width: 480px;
        text-align: center;
        background: linear-gradient(180deg, #1e293b 0%, #064e3b 100%);
        border: 3px solid #10b981;
      }

      .celebration-badge-glow {
        font-size: 4.5rem;
        margin: 16px auto;
        width: 110px;
        height: 110px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(0, 0, 0, 0.4) 70%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 35px rgba(16, 185, 129, 0.6);
        animation: pulseBadge 1.8s infinite alternate ease-in-out;
      }

      @keyframes pulseBadge {
        from { transform: scale(0.96); box-shadow: 0 0 25px rgba(16, 185, 129, 0.4); }
        to { transform: scale(1.06); box-shadow: 0 0 45px rgba(16, 185, 129, 0.8); }
      }

      /* Lab Observe Done Button */
      .btn-observe-done {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
        border-color: #60a5fa !important;
      }

      /* Mission Quiz Modal (Life Cycle, Wing, Pollen) */
      .special-quiz-panel {
        max-width: 540px;
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid #8b5cf6;
      }
`;

// Insert Phase 3 CSS into <style>
html = html.replace('/* --- PHASE 2 50-INSECTS ENCYCLOPEDIA STYLES --- */', phase3Styles + '\n      /* --- PHASE 2 50-INSECTS ENCYCLOPEDIA STYLES --- */');

// =========================================================================
// 2. HEADER BUTTON FOR MISSIONS
// =========================================================================
const missionHeaderBtn = `
          <!-- Phase 3 Eco-Mission Button -->
          <button id="btn-open-missions" class="btn-top-mission" title="생태 탐험 미션 (10개 미션 도전)">
            <span>🎯</span>
            <span>미션 <b id="header-mission-badge">0/10</b></span>
          </button>
`;

html = html.replace('<button id="btn-open-book"', missionHeaderBtn + '          <button id="btn-open-book"');

// =========================================================================
// 3. LAB OBSERVE COMPLETED BUTTON & SAFE RELEASE
// =========================================================================
const labActionEnhancement = `
          <!-- Lab Quiz, Observe Complete & Release Action Buttons -->
          <div class="lab-action-buttons-row">
            <button id="btn-lab-complete-observe" class="btn-lab-action-card btn-observe-done" title="이 곤충의 주요 외형과 생태를 눈으로 관찰 완료">
              <span>👀 관찰 완료 (+20pt)</span>
            </button>
            <button id="btn-open-quiz" class="btn-lab-action-card btn-quiz">
              <span>🧠 생태 & 영어 1문제 퀴즈</span>
            </button>
            <button id="btn-release-insect" class="btn-lab-action-card btn-release">
              <span>🌿 자연으로 돌려보내기 (+50pt)</span>
            </button>
          </div>
`;

html = html.replace(/<div class="lab-action-buttons-row">[\s\S]*?<\/div>/, labActionEnhancement.trim());

// =========================================================================
// 4. HTML MODALS (Mission List, Mission Detail, Mission Complete, Special Quiz)
// =========================================================================
const missionModalsHtml = `
      <!-- ==========================================================================
           PHASE 3: MISSION MODALS & ECO EXPLORATION SYSTEM
           ========================================================================== -->

      <!-- 1. Mission List Modal -->
      <div id="mission-modal" class="mission-modal-backdrop" style="display:none;">
        <div class="mission-modal-panel">
          <div class="mission-modal-header">
            <div class="mission-modal-title">
              <span>🎯</span>
              <span>생태 탐험 미션 센터</span>
            </div>
            <button id="btn-close-mission-modal" class="btn-modal-close" title="닫기">✕</button>
          </div>

          <div class="mission-stats-bar">
            <span>완료한 미션: <b id="mission-completed-count" style="color:#10b981;">0</b> / 10개</span>
            <span>획득한 배지: <b id="mission-badge-count" style="color:#f59e0b;">0</b>개</span>
          </div>

          <div class="mission-filter-tabs">
            <button class="btn-mission-filter active" data-filter="all">전체 (10)</button>
            <button class="btn-mission-filter" data-filter="meadow">🌼 꽃밭</button>
            <button class="btn-mission-filter" data-filter="oak">🌳 숲</button>
            <button class="btn-mission-filter" data-filter="floor">💧 연못 주변</button>
            <button class="btn-mission-filter" data-filter="jungle">🌾 풀밭</button>
          </div>

          <div class="mission-cards-scroll" id="mission-cards-container">
            <!-- 10 Mission Cards will be dynamically injected here -->
          </div>
        </div>
      </div>

      <!-- 2. Mission Detail Modal -->
      <div id="mission-detail-modal" class="mission-modal-backdrop" style="display:none;">
        <div class="mission-modal-panel mission-detail-panel">
          <div class="mission-modal-header">
            <div class="mission-modal-title">
              <span id="detail-mission-badge-icon">🎯</span>
              <span id="detail-mission-title">미션 제목</span>
            </div>
            <button id="btn-close-mission-detail" class="btn-modal-close" title="닫기">✕</button>
          </div>

          <div class="mission-detail-body">
            <div class="mission-detail-badge-box">
              <div class="mission-detail-badge-icon" id="detail-badge-icon">🌱</div>
              <div>
                <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">완료 보상 배지</div>
                <div style="font-size:1.05rem; font-weight:800; color:#f8fafc;" id="detail-badge-name">새싹 탐험가 배지</div>
                <div style="font-size:0.8rem; color:#cbd5e1;" id="detail-badge-desc">미션을 완료하면 수여됩니다.</div>
              </div>
            </div>

            <div>
              <div style="font-size:0.82rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">탐험 미션 내용</div>
              <div style="font-size:0.92rem; color:#f8fafc; line-height:1.45;" id="detail-mission-desc">설명</div>
            </div>

            <div>
              <div style="font-size:0.82rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">달성 조건</div>
              <div style="font-size:0.88rem; color:#38bdf8; font-weight:700;" id="detail-mission-condition">조건</div>
            </div>

            <div>
              <div style="font-size:0.82rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">목표 곤충 친구들</div>
              <div class="mission-targets-row" id="detail-mission-targets"></div>
            </div>

            <div class="mission-fact-box" id="detail-mission-fact">
              <strong>💡 생태 탐험 쏙쏙 상식:</strong> 곤충은 머리, 가슴, 배로 나뉘어요.
            </div>
          </div>

          <div class="mission-actions-row">
            <button id="btn-detail-goto-region" class="btn-mission-action secondary">
              <span>🌿 해당 탐험 지역으로 이동</span>
            </button>
            <button id="btn-detail-start-action" class="btn-mission-action primary">
              <span>🚀 미션 시작하기</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Mission Complete Celebration Modal -->
      <div id="mission-complete-modal" class="mission-modal-backdrop" style="display:none; z-index:9500;">
        <div class="mission-modal-panel complete-celebration-panel">
          <div style="padding: 24px 20px;">
            <div style="font-size:1.35rem; font-weight:800; color:#a7f3d0;">🎉 미션 완수를 축하합니다! 🎉</div>
            <div class="celebration-badge-glow" id="celebration-badge-icon">🏆</div>
            <div style="font-size:1.2rem; font-weight:800; color:#ffffff;" id="celebration-badge-name">배지 이름</div>
            <div style="font-size:0.86rem; color:#cbd5e1; margin-top:6px;" id="celebration-badge-desc">배지 설명</div>

            <div class="mission-fact-box" style="margin-top:16px; text-align:left;" id="celebration-fact">
              <strong>💡 새로 배운 생태 지식:</strong> 사실 내용
            </div>

            <div style="margin-top:14px; font-size:0.95rem; font-weight:800; color:#fbbf24;" id="celebration-reward-pts">
              +100 탐험 점수 획득!
            </div>
          </div>

          <div class="mission-actions-row" style="background:rgba(0,0,0,0.3);">
            <button id="btn-celebration-next" class="btn-mission-action primary">
              <span>다음 미션 보기 ➔</span>
            </button>
            <button id="btn-celebration-close" class="btn-mission-action secondary">
              <span>탐험 계속하기</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Special Mission Quiz Modal (Life cycle, Wing, Pollen) -->
      <div id="mission-quiz-modal" class="mission-modal-backdrop" style="display:none; z-index:9400;">
        <div class="mission-modal-panel special-quiz-panel">
          <div class="mission-modal-header">
            <div class="mission-modal-title">
              <span id="special-quiz-icon">🧬</span>
              <span id="special-quiz-title">생태 미션 퀴즈</span>
            </div>
            <button id="btn-close-special-quiz" class="btn-modal-close" title="닫기">✕</button>
          </div>
          <div class="mission-detail-body">
            <div class="quiz-question" id="special-quiz-question" style="font-size:1.05rem; color:#f8fafc; font-weight:700;">질문</div>
            <div class="quiz-options" id="special-quiz-options" style="margin-top:12px;"></div>
            <div class="quiz-feedback" id="special-quiz-feedback" style="display:none; margin-top:12px;"></div>
          </div>
        </div>
      </div>
`;

// Insert Modals right before </body>
html = html.replace('</body>', missionModalsHtml + '\n  </body>');

// =========================================================================
// 5. INJECT MISSIONS MASTER DATA & MISSION ENGINE SCRIPT
// =========================================================================
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
          if (appData.completedMissions.includes(missionId)) return 'COMPLETED';
          const m = this.missions.find(item => item.missionId === missionId);
          if (!m) return 'LOCKED';

          // Check prerequisites
          const prereqsMet = m.requiredMissionIds.every(reqId => appData.completedMissions.includes(reqId));
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
          document.getElementById('celebration-badge-icon').textContent = badge.icon;
          document.getElementById('celebration-badge-name').textContent = badge.name;
          document.getElementById('celebration-badge-desc').textContent = badge.description;
          document.getElementById('celebration-fact').innerHTML = \`<strong>💡 새로 배운 생태 지식:</strong> \${m.educationalFact}\`;
          document.getElementById('celebration-reward-pts').textContent = \`+\${m.rewardPoints || 50} 탐험 점수 획득!\`;

          const modal = document.getElementById('mission-complete-modal');
          modal.style.display = 'flex';
        }

        updateHeaderBadge() {
          const badgeEl = document.getElementById('header-mission-badge');
          if (badgeEl) {
            badgeEl.textContent = \`\${appData.completedMissions.length}/10\`;
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
              missionModal.style.display = 'flex';
            });
          }

          if (btnCloseMissionModal) {
            btnCloseMissionModal.addEventListener('click', () => {
              audio.playTap();
              missionModal.style.display = 'none';
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
              detailModal.style.display = 'none';
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
              detailModal.style.display = 'none';
              missionModal.style.display = 'none';
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
                  detailModal.style.display = 'none';
                  missionModal.style.display = 'none';
                  return;
                }

                if (m.regionId && m.regionId !== 'any') {
                  renderZoneStage(m.regionId);
                  document.querySelectorAll('.zone-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.zone === m.regionId);
                  });
                }
              }
              detailModal.style.display = 'none';
              missionModal.style.display = 'none';
            });
          }

          // Celebration Modal Buttons
          const btnCelebClose = document.getElementById('btn-celebration-close');
          const btnCelebNext = document.getElementById('btn-celebration-next');
          const celebModal = document.getElementById('mission-complete-modal');

          if (btnCelebClose) {
            btnCelebClose.addEventListener('click', () => {
              audio.playTap();
              celebModal.style.display = 'none';
            });
          }
          if (btnCelebNext) {
            btnCelebNext.addEventListener('click', () => {
              audio.playTap();
              celebModal.style.display = 'none';
              this.renderMissionList();
              missionModal.style.display = 'flex';
            });
          }

          // Special Quiz Close
          const btnCloseSpecialQuiz = document.getElementById('btn-close-special-quiz');
          const specialQuizModal = document.getElementById('mission-quiz-modal');
          if (btnCloseSpecialQuiz) {
            btnCloseSpecialQuiz.addEventListener('click', () => {
              audio.playTap();
              specialQuizModal.style.display = 'none';
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
          if (compCountEl) compCountEl.textContent = appData.completedMissions.length;
          if (badgeCountEl) badgeCountEl.textContent = appData.earnedBadges.length;

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

          document.getElementById('detail-mission-badge-icon').textContent = badge.icon;
          document.getElementById('detail-mission-title').textContent = \`미션 \${m.order}. \${m.title}\`;
          document.getElementById('detail-badge-icon').textContent = badge.icon;
          document.getElementById('detail-badge-name').textContent = badge.name;
          document.getElementById('detail-badge-desc').textContent = badge.description;
          document.getElementById('detail-mission-desc').textContent = m.description;
          document.getElementById('detail-mission-condition').textContent = \`🎯 달성 조건: \${m.completionCondition}\`;
          document.getElementById('detail-mission-fact').innerHTML = \`<strong>💡 생태 탐험 쏙쏙 상식:</strong> \${m.educationalFact}\`;

          // Target insect chips
          const targetRow = document.getElementById('detail-mission-targets');
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

          // Show/Hide Go-To-Region button
          const btnGotoRegion = document.getElementById('btn-detail-goto-region');
          if (m.regionId && m.regionId !== 'any') {
            btnGotoRegion.style.display = 'flex';
          } else {
            btnGotoRegion.style.display = 'none';
          }

          document.getElementById('mission-detail-modal').style.display = 'flex';
        }

        openSpecialQuiz(m) {
          if (!m.quiz) return;
          const modal = document.getElementById('mission-quiz-modal');
          const questionEl = document.getElementById('special-quiz-question');
          const optionsEl = document.getElementById('special-quiz-options');
          const feedbackEl = document.getElementById('special-quiz-feedback');
          const titleEl = document.getElementById('special-quiz-title');

          titleEl.textContent = m.title;
          questionEl.textContent = m.quiz.question;
          optionsEl.innerHTML = '';
          feedbackEl.style.display = 'none';

          m.quiz.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-quiz-opt';
            btn.textContent = \`\${idx + 1}. \${opt}\`;
            btn.addEventListener('click', () => {
              if (idx === m.quiz.answer) {
                audio.playFanfare();
                btn.classList.add('correct');
                feedbackEl.className = 'quiz-feedback success';
                feedbackEl.innerHTML = \`🎉 <b>정답이에요! 대단해요!</b> \${m.quiz.tip}\`;
                feedbackEl.style.display = 'block';

                let qType = 'GENERAL';
                if (m.missionType === 'ANATOMY_QUESTION') qType = 'WING';
                if (m.missionType === 'QUIZ') qType = 'POLLEN';
                if (m.missionType === 'LIFE_CYCLE') qType = 'LIFECYCLE';

                setTimeout(() => {
                  modal.style.display = 'none';
                  this.onQuizCompleted(qType, m.relatedInsectId);
                }, 1500);
              } else {
                audio.playMiss();
                btn.classList.add('wrong');
                feedbackEl.className = 'quiz-feedback fail';
                feedbackEl.innerHTML = \`괜찮아요, 다시 도전해 보세요! 힌트: \${m.quiz.tip}\`;
                feedbackEl.style.display = 'block';
              }
            });
            optionsEl.appendChild(btn);
          });

          modal.style.display = 'flex';
        }
      }

      // Instantiate Mission Engine
      const missionEngine = new MissionEngine();
`;

// Insert missionScript before INITIALIZATION
html = html.replace(
  '/* ==========================================================================\\n         14. INITIALIZATION',
  missionScript + '\\n      /* ==========================================================================\\n         14. INITIALIZATION'
);

// =========================================================================
// 6. CONNECT EVENTS (Catch, Lab Observe, Lab Release, Lab Quiz)
// =========================================================================

// 6-A. Connect Mission Engine Init at startup
html = html.replace("renderZoneStage('oak');", "renderZoneStage('oak');\\n      missionEngine.init();");

// 6-B. Connect Catch Handler
html = html.replace(
  'showCatchToast(c, `🎉 ${c.koreanName} 포획 성공!`);',
  'showCatchToast(c, `🎉 ${c.koreanName} 포획 성공!`);\n        missionEngine.onInsectDiscovered(insectId);'
);

// 6-C. Connect Lab Complete Observe Button
const labObserveBtnBinding = `
      // Lab Observe Complete Button Event
      const btnLabCompleteObserve = document.getElementById('btn-lab-complete-observe');
      if (btnLabCompleteObserve) {
        btnLabCompleteObserve.addEventListener('click', () => {
          if (!currentLabInsectId) return;
          const i = INSECTS_MAP[currentLabInsectId] || CREATURES[currentLabInsectId];
          if (!i) return;

          audio.playShimmer();
          triggerConfetti();
          appData.points = (appData.points || 0) + 20;
          saveExpeditionData(appData);
          showCatchToast(i, \`👀 \${i.koreanName} 세밀 관찰 완료! (+20pt)\`);
          missionEngine.onInsectObserved(currentLabInsectId, currentLabPart);
        });
      }
`;

html = html.replace('// CSV Import Elements', labObserveBtnBinding + '\n      // CSV Import Elements');

// 6-D. Connect Lab Release Button
html = html.replace(
  'audio.playReleaseChime();',
  'audio.playReleaseChime();\n        missionEngine.onInsectReleased(currentLabInsectId);'
);

// 6-E. Connect Lab English Quiz Complete
html = html.replace(
  'appData.points = (appData.points || 0) + 30;',
  'appData.points = (appData.points || 0) + 30;\n              missionEngine.onQuizCompleted("ENGLISH", currentLabInsectId);'
);

// 6-F. Fix Lab Release check to use INSECTS_MAP as fallback
html = html.replace('const c = CREATURES[currentLabInsectId];', 'const c = INSECTS_MAP[currentLabInsectId] || CREATURES[currentLabInsectId];');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully upgraded index.html for PHASE 3 with Eco-Exploration Mission System!');
