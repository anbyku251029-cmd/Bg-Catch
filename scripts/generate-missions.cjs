const fs = require('fs');

// Load 50 insects to cross-reference valid IDs
const insects50 = JSON.parse(fs.readFileSync('insects50.json', 'utf8'));
const insectIdSet = new Set(insects50.map(i => i.id));

// Define 4 Regions
const REGIONS = [
  {
    regionId: 'meadow',
    name: '야생화 꽃밭',
    title: '꽃밭 (들꽃·꿀벌)',
    icon: '🌼',
    description: '화사한 꽃들과 향긋한 풀잎 사이에 호랑나비와 꿀벌들이 춤추는 생태 공간이에요.',
    bgClass: 'bg-meadow',
    zoneKey: 'meadow',
    targetInsectIds: insects50.filter(i => i.habitat === '꽃밭').map(i => i.id),
    unlockedByDefault: true
  },
  {
    regionId: 'oak',
    name: '참나무 숲',
    title: '숲 (참나무·밀림)',
    icon: '🌳',
    description: '달콤한 참나무 수액과 울창한 나뭇가지에 힘센 장수풍뎅이와 사슴벌레들이 모여 살아요.',
    bgClass: 'bg-oak',
    zoneKey: 'oak',
    targetInsectIds: insects50.filter(i => i.habitat === '숲').map(i => i.id),
    unlockedByDefault: true
  },
  {
    regionId: 'floor',
    name: '연못 주변',
    title: '연못 주변 (잠자리·물방개)',
    icon: '💧',
    description: '맑은 물가와 물풀 사이에 물방개와 소금쟁이, 멋진 날개의 잠자리들이 살아 숨 쉬어요.',
    bgClass: 'bg-floor',
    zoneKey: 'floor',
    targetInsectIds: insects50.filter(i => i.habitat === '연못 주변').map(i => i.id),
    unlockedByDefault: true
  },
  {
    regionId: 'jungle',
    name: '풀밭',
    title: '풀밭 (메뚜기·노린재)',
    icon: '🌾',
    description: '초록빛 싱그러운 풀숲 사이에 점프 대장 방아깨비와 사마귀, 귀뚜라미가 노래해요.',
    bgClass: 'bg-jungle',
    zoneKey: 'jungle',
    targetInsectIds: insects50.filter(i => i.habitat === '풀밭').map(i => i.id),
    unlockedByDefault: true
  }
];

// Define 10 Missions
const MISSIONS = [
  {
    missionId: 'mission_1',
    order: 1,
    title: '첫 만남: 생태 탐험의 시작',
    description: '야생 생태 필드에서 살아 움직이는 곤충 한 종을 처음으로 발견하여 채집통에 담아보세요!',
    regionId: 'any',
    targetInsectIds: ['swallowtail_butterfly', 'rhinoceros_beetle', 'ladybug', 'asian_honeybee', 'water_strider'],
    targetAny: true,
    missionType: 'FIRST_DISCOVERY',
    objectiveCount: 1,
    completionCondition: '야생 필드에서 곤충 1종 최초 발견 포획',
    rewardBadgeId: 'badge_first_meet',
    rewardBadge: {
      id: 'badge_first_meet',
      name: '새싹 탐험가 배지',
      icon: '🌱',
      color: '#10b981',
      description: '살아 숨 쉬는 곤충을 처음으로 발견하고 관찰한 멋진 어린이 탐험가에게 수여합니다.'
    },
    rewardPoints: 50,
    requiredMissionIds: [],
    educationalFact: '곤충은 머리, 가슴, 배 세 부분으로 나뉘며 6개의 다리를 가진 지구상에서 가장 번성한 동물이에요!',
    relatedInsectId: 'swallowtail_butterfly'
  },
  {
    missionId: 'mission_2',
    order: 2,
    title: '꽃밭 탐험: 들꽃을 찾아온 날개',
    description: '야생화 꽃밭으로 이동하여 꽃밭에 사는 아름다운 곤충(호랑나비, 배추흰나비, 꿀벌, 무당벌레 중 1종)을 찾아 관찰해 보세요!',
    regionId: 'meadow',
    targetInsectIds: ['swallowtail_butterfly', 'cabbage_white_butterfly', 'asian_honeybee', 'ladybug'],
    targetAny: false,
    missionType: 'OBSERVE',
    objectiveCount: 1,
    completionCondition: '꽃밭 지역에서 대상 곤충을 채집하고 돋보기 관찰소에서 관찰 완료',
    rewardBadgeId: 'badge_flower_explorer',
    rewardBadge: {
      id: 'badge_flower_explorer',
      name: '꽃밭 탐험가 배지',
      icon: '🌸',
      color: '#ec4899',
      description: '꽃밭 생태계를 탐험하고 꽃과 함께 살아가는 곤충을 발견한 탐험가에게 수여합니다.'
    },
    rewardPoints: 60,
    requiredMissionIds: ['mission_1'],
    educationalFact: '꽃밭의 나비와 벌들은 꽃의 달콤한 꿀을 먹는 대신 꽃가루를 옮겨주어 열매를 맺게 돕는 단짝 친구예요!',
    relatedInsectId: 'swallowtail_butterfly'
  },
  {
    missionId: 'mission_3',
    order: 3,
    title: '날개의 비밀: 나비 날개의 가루',
    description: '호랑나비를 관찰소에서 자세히 관찰하고, 나비 날개에 덮인 미세한 비늘가루(인분)에 대한 생태 질문에 답해 보세요!',
    regionId: 'meadow',
    targetInsectIds: ['swallowtail_butterfly'],
    targetAny: false,
    missionType: 'ANATOMY_QUESTION',
    objectiveCount: 1,
    completionCondition: '호랑나비 돋보기 관찰소에서 날개 관찰 및 날개 비늘가루 생태 퀴즈 정답',
    quiz: {
      question: "호랑나비 날개를 덮고 있는 미세한 비늘가루(인분)는 어떤 역할을 할까요?",
      options: [
        "비에 젖지 않는 방수 기능과 아름다운 빛깔 표현",
        "몸을 아주 무겁게 만들어 땅에 떨어지게 함"
      ],
      answer: 0,
      tip: "나비 날개의 미세한 비늘가루는 빗방울을 튕겨내고 체온을 조절해 주어요!"
    },
    rewardBadgeId: 'badge_wing_master',
    rewardBadge: {
      id: 'badge_wing_master',
      name: '날개 박사 배지',
      icon: '🦋',
      color: '#38bdf8',
      description: '나비 날개의 구조와 신비로운 인분의 비밀을 밝혀낸 탐험가에게 수여합니다.'
    },
    rewardPoints: 70,
    requiredMissionIds: ['mission_2'],
    educationalFact: '나비 날개에는 기왓장처럼 겹쳐진 수만 개의 미세한 비늘(인분)이 있어 빗방울을 튕겨내고 햇볕을 흡수해요!',
    relatedInsectId: 'swallowtail_butterfly'
  },
  {
    missionId: 'mission_4',
    order: 4,
    title: '점박이 친구: 칠성무당벌레의 비밀',
    description: '빨간 날개에 검은 점이 7개 박힌 칠성무당벌레를 관찰하고 도감 카드를 확인해 보세요!',
    regionId: 'meadow',
    targetInsectIds: ['ladybug'],
    targetAny: false,
    missionType: 'INSPECT_CARD',
    objectiveCount: 1,
    completionCondition: '칠성무당벌레 관찰 및 도감 상세 카드의 생태 정보 확인',
    rewardBadgeId: 'badge_ladybug_friend',
    rewardBadge: {
      id: 'badge_ladybug_friend',
      name: '무당벌레 친구 배지',
      icon: '🐞',
      color: '#ef4444',
      description: '진딧물을 잡아먹어 농부들을 돕는 익충 칠성무당벌레의 생태를 이해한 탐험가에게 수여합니다.'
    },
    rewardPoints: 60,
    requiredMissionIds: ['mission_2'],
    educationalFact: '칠성무당벌레는 하루에 진딧물을 수십 마리나 잡아먹어 농부 아저씨의 농작물을 지켜주는 소중한 익충이에요!',
    relatedInsectId: 'ladybug'
  },
  {
    missionId: 'mission_5',
    order: 5,
    title: '꽃가루 여행: 꿀벌과 꽃의 약속',
    description: '꿀벌 또는 호박벌의 돋보기 관찰소에서 벌들이 꽃가루를 뒷다리에 뭉쳐 다니는 수분(꽃가루받이) 퀴즈를 풀어보세요!',
    regionId: 'meadow',
    targetInsectIds: ['asian_honeybee', 'bumblebee'],
    targetAny: false,
    missionType: 'QUIZ',
    objectiveCount: 1,
    completionCondition: '꿀벌 또는 호박벌 생태 퀴즈에서 정답 맞히기',
    quiz: {
      question: "꿀벌이 꽃을 오가며 뒷다리 '꽃가루 바구니'에 꽃가루를 모으는 동안 자연에 어떤 좋은 일이 생길까요?",
      options: [
        "꽃가루가 다른 꽃에 전해져(수분) 맛있는 사과와 딸기 열매가 맺혀요",
        "꽃들이 시들어 모두 땅으로 떨어져요"
      ],
      answer: 0,
      tip: "지구상 식물의 70% 이상이 꿀벌의 꽃가루받이 덕분에 열매를 맺어요!"
    },
    rewardBadgeId: 'badge_pollen_helper',
    rewardBadge: {
      id: 'badge_pollen_helper',
      name: '꽃가루 수호자 배지',
      icon: '🐝',
      color: '#f59e0b',
      description: '식물의 번식과 풍성한 수확을 돕는 꿀벌의 소중한 생태적 역할을 배운 탐험가에게 수여합니다.'
    },
    rewardPoints: 70,
    requiredMissionIds: ['mission_2'],
    educationalFact: '우리가 먹는 사과, 딸기, 수박 등 수많은 과일과 채소는 꿀벌이 꽃가루를 옮겨주지 않으면 열매를 맺을 수 없어요!',
    relatedInsectId: 'asian_honeybee'
  },
  {
    missionId: 'mission_6',
    order: 6,
    title: '숲속 탐험: 힘센 장수풍뎅이와 사슴벌레',
    description: '참나무 숲으로 이동하여 거대한 뿔을 가진 장수풍뎅이, 톱사슴벌레, 헤라클레스장수풍뎅이 중 1종을 포획해 보세요!',
    regionId: 'oak',
    targetInsectIds: ['rhinoceros_beetle', 'stag_beetle', 'hercules_beetle'],
    targetAny: false,
    missionType: 'REGION_DISCOVERY',
    objectiveCount: 1,
    completionCondition: '참나무 숲 지역에서 딱정벌레목 거대 곤충 발견 포획',
    rewardBadgeId: 'badge_forest_ranger',
    rewardBadge: {
      id: 'badge_forest_ranger',
      name: '숲의 수호대 배지',
      icon: '🌲',
      color: '#059669',
      description: '울창한 숲속의 제왕 장수풍뎅이와 사슴벌레를 발견한 용감한 탐험가에게 수여합니다.'
    },
    rewardPoints: 80,
    requiredMissionIds: ['mission_1'],
    educationalFact: '장수풍뎅이의 Y자 뿔은 상대를 들어 올릴 때 쓰이고, 톱사슴벌레의 턱은 나무 수액터를 지키기 위한 무기랍니다!',
    relatedInsectId: 'rhinoceros_beetle'
  },
  {
    missionId: 'mission_7',
    order: 7,
    title: '물가의 탐험가: 연못의 비행사 잠자리',
    description: '연못 주변으로 이동하여 물 위를 걷는 소금쟁이나 푸른 하늘을 활공하는 잠자리류를 관찰해 보세요!',
    regionId: 'floor',
    targetInsectIds: ['water_strider', 'diving_beetle', 'scarlet_skimmer', 'anax_dragonfly', 'mayfly'],
    targetAny: false,
    missionType: 'OBSERVE',
    objectiveCount: 1,
    completionCondition: '연못 주변 지역에서 수생 및 수변 곤충 관찰 완료',
    rewardBadgeId: 'badge_water_scout',
    rewardBadge: {
      id: 'badge_water_scout',
      name: '물가 탐험대장 배지',
      icon: '💧',
      color: '#0284c7',
      description: '물 표면과 연못 주변을 터전 삼아 살아가는 수생 곤충들의 생태를 관찰한 탐험가에게 수여합니다.'
    },
    rewardPoints: 80,
    requiredMissionIds: ['mission_1'],
    educationalFact: '소금쟁이 발끝에는 기름기가 묻은 미세한 털들이 빽빽해 물의 표면장력으로 물에 빠지지 않고 떠다녀요!',
    relatedInsectId: 'water_strider'
  },
  {
    missionId: 'mission_8',
    order: 8,
    title: '성장의 비밀: 곤충의 완전변태 한살이',
    description: '호랑나비나 장수풍뎅이가 거치는 신비로운 4단계 한살이(알 → 애벌레 → 번데기 → 어른벌레) 성장 단계를 맞혀보세요!',
    regionId: 'any',
    targetInsectIds: ['swallowtail_butterfly', 'rhinoceros_beetle'],
    targetAny: false,
    missionType: 'LIFE_CYCLE',
    objectiveCount: 1,
    completionCondition: '완전변태 4단계 생애 주기 성장 퀴즈 정답 맞히기',
    quiz: {
      question: "호랑나비와 장수풍뎅이처럼 번데기 과정을 거쳐 어른벌레로 완전히 변신하는 과정을 무엇이라고 부를까요?",
      options: [
        "완전변태 (Complete Metamorphosis)",
        "불완전변태 (Incomplete Metamorphosis)"
      ],
      answer: 0,
      tip: "알 → 애벌레 → 번데기 → 어른벌레의 4단계를 모두 거치는 것을 '완전변태'라고 해요!"
    },
    rewardBadgeId: 'badge_growth_scholar',
    rewardBadge: {
      id: 'badge_growth_scholar',
      name: '성장의 비밀 박사 배지',
      icon: '🧬',
      color: '#8b5cf6',
      description: '애벌레에서 아름다운 어른벌레로 변신하는 곤충의 완전변태 한살이를 마스터한 탐험가에게 수여합니다.'
    },
    rewardPoints: 90,
    requiredMissionIds: ['mission_3'],
    educationalFact: '나비와 풍뎅이는 번데기 안에서 몸 전체의 세포가 재구성되어 날개와 더듬이를 가진 어른벌레로 대변신해요!',
    relatedInsectId: 'swallowtail_butterfly'
  },
  {
    missionId: 'mission_9',
    order: 9,
    title: '영어 탐험가: 세계로 뻗어가는 곤충 영어',
    description: '돋보기 관찰소의 영어 퀴즈를 풀고 곤충의 영어 이름과 생태 문장 퀴즈를 1회 이상 완수해 보세요!',
    regionId: 'any',
    targetInsectIds: ['swallowtail_butterfly', 'rhinoceros_beetle', 'ladybug', 'asian_honeybee', 'praying_mantis'],
    targetAny: true,
    missionType: 'ENGLISH_QUIZ',
    objectiveCount: 1,
    completionCondition: '도감 관찰소 영어 퀴즈 1회 이상 정답 완료',
    rewardBadgeId: 'badge_english_scout',
    rewardBadge: {
      id: 'badge_english_scout',
      name: '영어 생태 마스터 배지',
      icon: '🌍',
      color: '#06b6d4',
      description: '한국어뿐 아니라 영어로도 곤충의 이름과 특징을 유창하게 학습한 글로벌 탐험가에게 수여합니다.'
    },
    rewardPoints: 80,
    requiredMissionIds: ['mission_1'],
    educationalFact: "장수풍뎅이의 영어 이름 'Rhinoceros Beetle'은 코뿔소처럼 멋진 뿔을 가졌다는 뜻이 담겨 있답니다!",
    relatedInsectId: 'rhinoceros_beetle'
  },
  {
    missionId: 'mission_10',
    order: 10,
    title: '자연 지킴이: 푸른 자연으로 안녕!',
    description: '관찰을 마친 곤충을 관찰소나 채집통에서 "🌿 자연으로 돌려보내기" 버튼을 눌러 고향 자연으로 방생해 주세요!',
    regionId: 'any',
    targetInsectIds: ['swallowtail_butterfly', 'rhinoceros_beetle', 'ladybug', 'asian_honeybee', 'water_strider', 'praying_mantis'],
    targetAny: true,
    missionType: 'RELEASE',
    objectiveCount: 1,
    completionCondition: '관찰소 또는 채집통에서 곤충을 자연으로 안전하게 방생하기 완료',
    rewardBadgeId: 'badge_nature_guardian',
    rewardBadge: {
      id: 'badge_nature_guardian',
      name: '푸른 지구 지킴이 배지',
      icon: '🌿',
      color: '#16a34a',
      description: '생명을 소중히 여기고 관찰한 곤충을 다시 자연으로 돌려보내 준 따뜻한 마음의 생태 수호자에게 수여합니다.'
    },
    rewardPoints: 100,
    requiredMissionIds: ['mission_1'],
    educationalFact: '야생 곤충은 자연 속에 있을 때 가장 행복해요! 관찰이 끝난 곤충을 살던 숲과 들로 돌려보내는 것은 훌륭한 탐험가의 첫걸음이에요.',
    relatedInsectId: 'ladybug'
  }
];

// Validate all target insect IDs
let valid = true;
MISSIONS.forEach(m => {
  m.targetInsectIds.forEach(id => {
    if (!insectIdSet.has(id)) {
      console.error(`Invalid target insect ID: ${id} in mission: ${m.missionId}`);
      valid = false;
    }
  });
});

if (!valid) {
  console.error('Validation failed: Some insect IDs do not exist in insects50.json!');
  process.exit(1);
}

// Write to files
fs.writeFileSync('src/data/missions.json', JSON.stringify({ regions: REGIONS, missions: MISSIONS }, null, 2), 'utf8');
fs.writeFileSync('missions.json', JSON.stringify({ regions: REGIONS, missions: MISSIONS }, null, 2), 'utf8');

console.log('Successfully generated 10 verified missions and 4 regions!');
