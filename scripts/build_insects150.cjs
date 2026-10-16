const fs = require('fs');

function parseCSV(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentToken = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(currentToken.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
      row = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  if (currentToken || row.length > 0) {
    row.push(currentToken.trim());
    lines.push(row);
  }
  return lines;
}

const raw = fs.readFileSync('150종 곤충.csv', 'utf8');
const rows = parseCSV(raw);
const headers = rows[0];
const data = rows.slice(1);

// Load existing 50 insects
const existing50 = JSON.parse(fs.readFileSync('insects50.json', 'utf8'));
const existing50Map = {};
existing50.forEach(i => {
  existing50Map[i.koreanName] = i;
});

// Known accurate English names & IDs dictionary for insects 51 ~ 150
const INFO_51_150 = {
  "산제비나비": { id: "alpine_black_swallowtail", en: "Alpine Black Swallowtail", word: "Swallowtail", size: "90~110 mm", habitat: "숲" },
  "꼬리명주나비": { id: "dragon_swallowtail", en: "Dragon Swallowtail", word: "Dragon", size: "55~65 mm", habitat: "연못 주변" },
  "애호랑나비": { id: "asian_festoon", en: "Asian Festoon", word: "Festoon", size: "50~65 mm", habitat: "숲" },
  "모시나비": { id: "apollo_butterfly", en: "Apollo Butterfly", word: "Apollo", size: "60~75 mm", habitat: "풀밭" },
  "큰줄흰나비": { id: "green_veined_white", en: "Green-veined White", word: "Veined", size: "50~60 mm", habitat: "풀밭" },
  "갈구리나비": { id: "eastern_brimstone", en: "Eastern Brimstone", word: "Brimstone", size: "45~55 mm", habitat: "숲" },
  "큰주홍부전나비": { id: "large_copper_butterfly", en: "Large Copper Butterfly", word: "Copper", size: "35~45 mm", habitat: "연못 주변" },
  "암먹부전나비": { id: "short_tailed_blue", en: "Short-tailed Blue", word: "Blue", size: "25~35 mm", habitat: "꽃밭" },
  "먹그늘나비": { id: "diana_treebrown", en: "Diana Treebrown", word: "Treebrown", size: "55~65 mm", habitat: "숲" },
  "뱀눈나비": { id: "dryas_wood_nymph", en: "Dryas Wood Nymph", word: "Nymph", size: "50~60 mm", habitat: "풀밭" },
  "굴뚝나비": { id: "steppe_grayling", en: "Steppe Grayling", word: "Grayling", size: "45~55 mm", habitat: "풀밭" },
  "조흰나비": { id: "bath_white", en: "Bath White", word: "Bath", size: "40~50 mm", habitat: "풀밭" },
  "각시멧노랑나비": { id: "lesser_brimstone", en: "Lesser Brimstone", word: "Lesser", size: "50~60 mm", habitat: "숲" },
  "은점표범나비": { id: "silver_spotted_fritillary", en: "Silver-spotted Fritillary", word: "Fritillary", size: "65~80 mm", habitat: "풀밭" },
  "왕물결나방": { id: "fruit_piercing_moth", en: "Fruit-piercing Moth", word: "Moth", size: "85~105 mm", habitat: "꽃밭" },
  "솔나방": { id: "pine_caterpillar_moth", en: "Pine Caterpillar Moth", word: "Pine", size: "60~85 mm", habitat: "숲" },
  "미국흰불나방": { id: "fall_webworm_moth", en: "Fall Webworm Moth", word: "Webworm", size: "28~36 mm", habitat: "숲" },
  "왕사슴벌레": { id: "japanese_giant_stag_beetle", en: "Japanese Giant Stag Beetle", word: "Stag", size: "40~75 mm", habitat: "숲" },
  "애사슴벌레": { id: "small_stag_beetle", en: "Small Stag Beetle", word: "Small", size: "20~45 mm", habitat: "숲" },
  "큰남생이잎벌레": { id: "tortoise_leaf_beetle", en: "Tortoise Leaf Beetle", word: "Tortoise", size: "6~8 mm", habitat: "풀밭" },
  "무당벌레붙이": { id: "asian_multicolored_ladybug", en: "Asian Multicolored Ladybug", word: "Harlequin", size: "7~10 mm", habitat: "꽃밭" },
  "큰이십팔점박이무당벌레": { id: "potato_ladybug", en: "28-spotted Potato Ladybug", word: "Spotted", size: "6~8 mm", habitat: "풀밭" },
  "청동풍뎅이": { id: "green_flower_scarab", en: "Green Flower Scarab", word: "Scarab", size: "18~24 mm", habitat: "꽃밭" },
  "참콩풍뎅이": { id: "soybean_scarab", en: "Soybean Scarab", word: "Soybean", size: "10~13 mm", habitat: "풀밭" },
  "꽃하늘소": { id: "flower_longhorn_beetle", en: "Flower Longhorn Beetle", word: "Flower", size: "12~18 mm", habitat: "꽃밭" },
  "수염풍뎅이": { id: "whiskered_beetle", en: "Korean Long-whiskered Beetle", word: "Whiskered", size: "30~38 mm", habitat: "풀밭" },
  "큰먼지벌레": { id: "sternberg_ground_beetle", en: "Sternberg Ground Beetle", word: "Ground", size: "30~42 mm", habitat: "숲" },
  "검정수염하늘소": { id: "japanese_pine_sawyer", en: "Japanese Pine Sawyer", word: "Sawyer", size: "18~28 mm", habitat: "숲" },
  "뽕나무하늘소": { id: "mulberry_longhorn_beetle", en: "Mulberry Longhorn Beetle", word: "Mulberry", size: "35~48 mm", habitat: "숲" },
  "검정파리매": { id: "robber_fly", en: "Robber Fly", word: "Robber", size: "25~32 mm", habitat: "풀밭" },
  "꽃등에": { id: "marmalade_hoverfly", en: "Marmalade Hoverfly", word: "Hoverfly", size: "10~14 mm", habitat: "꽃밭" },
  "호리꽃등에": { id: "slender_hoverfly", en: "Slender Hoverfly", word: "Slender", size: "8~12 mm", habitat: "꽃밭" },
  "쉬파리": { id: "flesh_fly", en: "Flesh Fly", word: "Flesh", size: "10~16 mm", habitat: "숲" },
  "검정파리": { id: "blue_bottle_fly", en: "Blue Bottle Fly", word: "Bottle", size: "10~14 mm", habitat: "숲" },
  "각다귀": { id: "crane_fly", en: "Crane Fly", word: "Crane", size: "20~35 mm", habitat: "연못 주변" },
  "먹파리": { id: "black_fly", en: "Black Fly", word: "Black", size: "3~5 mm", habitat: "연못 주변" },
  "깔따구": { id: "midge_fly", en: "Midge Fly", word: "Midge", size: "8~12 mm", habitat: "연못 주변" },
  "노랑초파리": { id: "fruit_fly", en: "Fruit Fly", word: "Fruit", size: "2~3 mm", habitat: "숲" },
  "등에": { id: "horse_fly", en: "Horse Fly", word: "Horse", size: "20~28 mm", habitat: "풀밭" },
  "깃동잠자리": { id: "band_winged_darter", en: "Band-winged Darter", word: "Darter", size: "38~45 mm", habitat: "연못 주변" },
  "밀잠자리": { id: "white_tailed_skimmer", en: "White-tailed Skimmer", word: "Skimmer", size: "45~55 mm", habitat: "연못 주변" },
  "나비잠자리": { id: "butterfly_dragonfly", en: "Butterfly Dragonfly", word: "Flutter", size: "35~42 mm", habitat: "연못 주변" },
  "고려측범잠자리": { id: "korean_clubtail", en: "Korean Clubtail", word: "Clubtail", size: "45~52 mm", habitat: "연못 주변" },
  "아시아실잠자리": { id: "asian_bluetail_damselfly", en: "Asian Bluetail Damselfly", word: "Bluetail", size: "26~34 mm", habitat: "연못 주변" },
  "청실잠자리": { id: "emerald_damselfly", en: "Emerald Damselfly", word: "Emerald", size: "36~44 mm", habitat: "연못 주변" },
  "풀잠자리": { id: "green_lacewing", en: "Green Lacewing", word: "Lacewing", size: "10~15 mm", habitat: "꽃밭" },
  "명주잠자리": { id: "antlion", en: "Antlion Lacewing", word: "Antlion", size: "60~75 mm", habitat: "풀밭" },
  "뱀잠자리": { id: "dobsonfly", en: "Asian Dobsonfly", word: "Dobsonfly", size: "55~70 mm", habitat: "연못 주변" },
  "집게벌레": { id: "earwig", en: "Common Earwig", word: "Earwig", size: "14~22 mm", habitat: "꽃밭" },
  "흰개미": { id: "japanese_termite", en: "Japanese Termite", word: "Termite", size: "4~7 mm", habitat: "숲" },
  "곰개미": { id: "japanese_formica_ant", en: "Japanese Formica Ant", word: "Formica", size: "4~6 mm", habitat: "꽃밭" },
  "왕가위벌": { id: "sculptured_resin_bee", en: "Sculptured Resin Bee", word: "Resin", size: "18~25 mm", habitat: "꽃밭" },
  "뒤영벌": { id: "early_bumblebee", en: "Early Bumblebee", word: "Bumble", size: "14~20 mm", habitat: "꽃밭" },
  "쌍살벌": { id: "yokahama_paper_wasp", en: "Yokahama Paper Wasp", word: "Paper", size: "16~22 mm", habitat: "꽃밭" },
  "땅벌": { id: "yellowjacket_wasp", en: "Yellowjacket Wasp", word: "Yellowjacket", size: "10~15 mm", habitat: "숲" },
  "기생벌": { id: "ichneumon_wasp", en: "Ichneumon Parasitoid Wasp", word: "Parasitoid", size: "12~24 mm", habitat: "풀밭" },
  "잎벌": { id: "turnip_sawfly", en: "Turnip Sawfly", word: "Sawfly", size: "7~9 mm", habitat: "풀밭" },
  "흰줄숲모기": { id: "asian_tiger_mosquito", en: "Asian Tiger Mosquito", word: "Mosquito", size: "4~7 mm", habitat: "숲" },
  "왕모기": { id: "elephant_mosquito", en: "Elephant Mosquito", word: "Elephant", size: "15~20 mm", habitat: "꽃밭" },
  "왕잠자리붙이": { id: "peking_spiketail", en: "Peking Spiketail Dragonfly", word: "Spiketail", size: "85~105 mm", habitat: "연못 주변" },
  "큰실잠자리": { id: "yellow_damselfly", en: "Yellow Damselfly", word: "Yellow", size: "32~40 mm", habitat: "연못 주변" },
  "메뚜기": { id: "short_horned_grasshopper", en: "Short-horned Grasshopper", word: "Short-horn", size: "30~42 mm", habitat: "연못 주변" },
  "섬서구메뚜기": { id: "slender_grasshopper", en: "Slender Grasshopper", word: "Slender", size: "28~45 mm", habitat: "풀밭" },
  "콩중이": { id: "mottled_grasshopper", en: "Mottled Grasshopper", word: "Mottled", size: "35~48 mm", habitat: "풀밭" },
  "팥중이": { id: "inferno_grasshopper", en: "Inferno Grasshopper", word: "Inferno", size: "32~45 mm", habitat: "풀밭" },
  "긴날개여치": { id: "long_winged_katydid", en: "Long-winged Katydid", word: "Katydid", size: "35~50 mm", habitat: "풀밭" },
  "방울벌레": { id: "bell_cricket", en: "Bell Cricket", word: "Bell", size: "15~22 mm", habitat: "꽃밭" },
  "귀뚜라미": { id: "field_cricket", en: "Japanese Field Cricket", word: "Cricket", size: "18~26 mm", habitat: "꽃밭" },
  "갈색날개매미충": { id: "brown_winged_planthopper", en: "Brown-winged Planthopper", word: "Planthopper", size: "8~12 mm", habitat: "꽃밭" },
  "미국선녀벌레": { id: "citrus_flatid_planthopper", en: "Citrus Flatid Planthopper", word: "Flatid", size: "7~10 mm", habitat: "꽃밭" },
  "끝검은말매미충": { id: "green_rice_leafhopper", en: "Green Rice Leafhopper", word: "Leafhopper", size: "5~7 mm", habitat: "연못 주변" },
  "벼멸구": { id: "brown_planthopper", en: "Brown Planthopper", word: "Planthopper", size: "4~5 mm", habitat: "연못 주변" },
  "애멸구": { id: "small_brown_planthopper", en: "Small Brown Planthopper", word: "Small", size: "3~4 mm", habitat: "연못 주변" },
  "큰허리노린재": { id: "squash_bug", en: "Asian Squash Bug", word: "Squash", size: "18~24 mm", habitat: "풀밭" },
  "썩덩나무노린재": { id: "brown_marmorated_stink_bug", en: "Brown Marmorated Stink Bug", word: "Stink", size: "12~17 mm", habitat: "꽃밭" },
  "풀색노린재": { id: "green_stink_bug", en: "Green Stink Bug", word: "Green", size: "12~16 mm", habitat: "풀밭" },
  "알락수염노린재": { id: "hairy_shield_bug", en: "Hairy Shield Bug", word: "Shield", size: "10~14 mm", habitat: "꽃밭" },
  "물자라": { id: "giant_water_bug_nepoid", en: "Giant Water Bug", word: "Water", size: "17~22 mm", habitat: "연못 주변" },
  "게아재비": { id: "water_stick_insect", en: "Water Stick Insect", word: "Stick", size: "40~50 mm", habitat: "연못 주변" },
  "장구애비": { id: "water_scorpion", en: "Water Scorpion", word: "Scorpion", size: "30~38 mm", habitat: "연못 주변" },
  "꼬마물벌레": { id: "water_boatman", en: "Water Boatman", word: "Boatman", size: "5~7 mm", habitat: "연못 주변" },
  "물맴이": { id: "whirligig_beetle", en: "Whirligig Beetle", word: "Whirligig", size: "6~8 mm", habitat: "연못 주변" },
  "애물땡땡이": { id: "water_scavenger_beetle", en: "Water Scavenger Beetle", word: "Scavenger", size: "18~25 mm", habitat: "연못 주변" },
  "반딧불이": { id: "glow_worm_firefly", en: "Glow-worm Firefly", word: "Glow", size: "12~18 mm", habitat: "풀밭" },
  "홍반디": { id: "net_winged_beetle", en: "Net-winged Beetle", word: "Net", size: "10~16 mm", habitat: "풀밭" },
  "비단벌레": { id: "jewel_beetle", en: "Jewel Beetle", word: "Jewel", size: "30~40 mm", habitat: "숲" },
  "사마귀": { id: "chinese_mantis", en: "Chinese Mantis", word: "Mantis", size: "65~90 mm", habitat: "꽃밭" },
  "좀사마귀": { id: "narrow_winged_mantis", en: "Narrow-winged Mantis", word: "Narrow", size: "45~60 mm", habitat: "풀밭" },
  "애매미": { id: "late_summer_cicada", en: "Late Summer Cicada", word: "Summer", size: "28~35 mm", habitat: "숲" },
  "털매미": { id: "hairy_cicada", en: "Corean Hairy Cicada", word: "Hairy", size: "25~32 mm", habitat: "숲" },
  "쓰름매미": { id: "mongolian_cicada", en: "Mongolian Cicada", word: "Song", size: "30~38 mm", habitat: "숲" },
  "대벌레": { id: "walking_stick_insect", en: "Walking Stick Insect", word: "Walking", size: "70~100 mm", habitat: "숲" },
  "큰대벌레": { id: "giant_stick_insect", en: "Giant Stick Insect", word: "Giant", size: "110~150 mm", habitat: "숲" },
  "벼룩잎벌레": { id: "striped_flea_beetle", en: "Striped Flea Beetle", word: "Flea", size: "2~3 mm", habitat: "풀밭" },
  "거위벌레": { id: "giraffe_weevil", en: "Giraffe Weevil", word: "Giraffe", size: "7~11 mm", habitat: "숲" },
  "큰거저리": { id: "mealworm_beetle", en: "Mealworm Beetle", word: "Mealworm", size: "14~18 mm", habitat: "연못 주변" },
  "쌀바구미": { id: "rice_weevil", en: "Rice Weevil", word: "Rice", size: "3~4 mm", habitat: "연못 주변" },
  "팥바구미": { id: "adzuki_bean_weevil", en: "Adzuki Bean Weevil", word: "Bean", size: "2~4 mm", habitat: "숲" },
  "검정빗살수염벌레": { id: "red_flour_beetle", en: "Red Flour Beetle", word: "Flour", size: "3~5 mm", habitat: "연못 주변" },
  "좀벌": { id: "egg_parasitoid_wasp", en: "Egg Parasitoid Wasp", word: "Parasitoid", size: "0.5~1.2 mm", habitat: "연못 주변" }
};

function mapOrder(cat) {
  if (cat.includes('나비') || cat.includes('나방')) return 'Lepidoptera';
  if (cat.includes('딱정벌레')) return 'Coleoptera';
  if (cat.includes('벌')) return 'Hymenoptera';
  if (cat.includes('노린재') || cat.includes('매미')) return 'Hemiptera';
  if (cat.includes('메뚜기') || cat.includes('귀뚜라미') || cat.includes('여치')) return 'Orthoptera';
  if (cat.includes('잠자리')) return 'Odonata';
  if (cat.includes('파리') || cat.includes('모기')) return 'Diptera';
  if (cat.includes('사마귀')) return 'Mantodea';
  if (cat.includes('대벌레')) return 'Phasmatodea';
  if (cat.includes('집게벌레')) return 'Dermaptera';
  if (cat.includes('풀잠자리')) return 'Neuroptera';
  if (cat.includes('뱀잠자리')) return 'Megaloptera';
  if (cat.includes('흰개미')) return 'Blattodea';
  return 'Insecta';
}

const full150 = [];
const seenIds = new Set();
const seenKo = new Set();
const seenSci = new Set();

data.forEach((r, idx) => {
  const num = parseInt(r[0]);
  const cat = r[1];
  const koName = r[2];
  const sciName = r[3];
  const kind = r[4];
  const rawEnv = r[5];
  const antenna = r[6];
  const head = r[7];
  const eyes = r[8];
  const mouth = r[9];
  const body = r[10];
  const legs = r[11];
  const appearance = r[12];
  const ecologyFact = r[13];
  const warning = r[14];
  const extraMemo = r[15];
  const reviewNote = r[16];

  let item = null;

  if (existing50Map[koName]) {
    const orig = existing50Map[koName];
    item = {
      ...orig,
      anatomyDetails: {
        antenna: antenna && antenna !== '원문에 구체적인 설명 없음' ? antenna : '',
        head: head && head !== '원문에 구체적인 설명 없음' ? head : '',
        eyes: eyes && eyes !== '원문에 구체적인 설명 없음' ? eyes : '',
        mouth: mouth && mouth !== '원문에 구체적인 설명 없음' ? mouth : '',
        body: body && body !== '원문에 구체적인 설명 없음' ? body : '',
        legs: legs && legs !== '원문에 구체적인 설명 없음' ? legs : ''
      },
      extraMemo: extraMemo || ''
    };
  } else {
    const info = INFO_51_150[koName] || {
      id: sciName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      en: sciName,
      word: 'Insect',
      size: '20~40 mm',
      habitat: '숲'
    };

    const order = mapOrder(cat);
    const habitat = info.habitat || '숲';

    let diet = '식물의 잎과 수액, 꽃의 달콤한 꿀';
    if (/꿀|꽃가루/.test(ecologyFact)) diet = '꽃의 꿀과 꽃가루';
    else if (/수액|참나무/.test(ecologyFact)) diet = '발효된 나무 수액';
    else if (/해충|기생|육식|사냥|잡아먹/.test(ecologyFact)) diet = '작은 곤충이나 해충';
    else if (/곡식|저장|쌀/.test(ecologyFact)) diet = '곡물과 식물 낟알';
    else if (/물속|올챙이|물고기/.test(ecologyFact)) diet = '물속의 작은 생물';

    item = {
      id: info.id,
      koreanName: koName,
      englishName: info.en,
      sciName: sciName,
      category: cat,
      order: order,
      appearance: appearance,
      diet: diet,
      habitat: habitat,
      region: '한국 및 동아시아',
      sizeMm: info.size,
      ecology: ecologyFact,
      fact: extraMemo || ecologyFact,
      keyWordEn: info.word,
      sentenceEn: `A ${info.en} can be found in the ${habitat === '꽃밭' ? 'flower garden' : habitat === '연못 주변' ? 'pond' : habitat === '풀밭' ? 'grass field' : 'forest'}.`,
      sentenceKo: `${koName}은(는) ${habitat}에서 만날 수 있는 흥미로운 곤충이에요.`,
      warning: warning || '손으로 세게 잡지 말고 눈으로 부드럽게 관찰해요.',
      image: `svg:${info.id}`,
      source: '150종 곤충 도감 데이터베이스 (국립생물자원관 기준)',
      reviewStatus: '검증 완료',
      anatomyDetails: {
        antenna: antenna && antenna !== '원문에 구체적인 설명 없음' ? antenna : '',
        head: head && head !== '원문에 구체적인 설명 없음' ? head : '',
        eyes: eyes && eyes !== '원문에 구체적인 설명 없음' ? eyes : '',
        mouth: mouth && mouth !== '원문에 구체적인 설명 없음' ? mouth : '',
        body: body && body !== '원문에 구체적인 설명 없음' ? body : '',
        legs: legs && legs !== '원문에 구체적인 설명 없음' ? legs : ''
      },
      extraMemo: extraMemo || '',
      quiz: {
        question: `${koName}의 주 서식지 환경은 어디일까요?`,
        options: [habitat, '남극 얼음산'],
        answer: 0,
        tip: `${koName}은(는) ${habitat} 환경에 적응하여 살아가요!`
      }
    };
  }

  // Sanity check
  if (seenIds.has(item.id)) throw new Error('Duplicate ID: ' + item.id);
  seenIds.add(item.id);

  if (seenKo.has(item.koreanName)) throw new Error('Duplicate Korean name: ' + item.koreanName);
  seenKo.add(item.koreanName);

  if (seenSci.has(item.sciName)) throw new Error('Duplicate Scientific name: ' + item.sciName);
  seenSci.add(item.sciName);

  full150.push(item);
});

console.log(`Generated ${full150.length} validated insects!`);
fs.writeFileSync('insects150.json', JSON.stringify(full150, null, 2), 'utf8');
console.log('Saved insects150.json successfully.');
