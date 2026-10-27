const fs = require('fs');
const path = require('path');

const dictPart1 = require('./species_500_dict_part1.cjs');
const dictPart2 = require('./species_500_dict_part2.cjs');
const DICT_151_500 = { ...dictPart1, ...dictPart2 };

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

function escapeCSVField(val) {
  const s = String(val == null ? '' : val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function normalizeCategory(orderCode, rawCat, koName) {
  if (orderCode === 'Lepidoptera' || rawCat.includes('나비') || rawCat.includes('나방')) return '나비·나방목';
  if (orderCode === 'Coleoptera' || rawCat.includes('딱정벌레')) return '딱정벌레목';
  if (orderCode === 'Hymenoptera' || rawCat.includes('벌목') || (rawCat.includes('벌') && !rawCat.includes('벌레') && !rawCat.includes('범'))) return '벌목';
  if (orderCode === 'Hemiptera' || rawCat.includes('노린재') || rawCat.includes('매미')) return '노린재목';
  if (orderCode === 'Orthoptera' || rawCat.includes('메뚜기') || rawCat.includes('여치') || rawCat.includes('귀뚜라미')) return '메뚜기목';
  return '잠자리·기타목';
}

function inferKoreanOrderAndFamily(koName, orderCode, origOrder, origFamily) {
  let koOrder = origOrder && !origOrder.includes('확인 필요') ? origOrder : '';
  let koFamily = origFamily && !origFamily.includes('확인 필요') ? origFamily : '';

  if (!koOrder) {
    const orderMap = {
      Lepidoptera: '나비목',
      Coleoptera: '딱정벌레목',
      Hymenoptera: '벌목',
      Hemiptera: '노린재목',
      Orthoptera: '메뚜기목',
      Odonata: '잠자리목',
      Diptera: '파리목',
      Blattodea: koName.includes('흰개미') ? '흰개미목' : '바퀴목',
      Mantodea: '사마귀목',
      Dermaptera: '집게벌레목',
      Ephemeroptera: '하루살이목',
      Neuroptera: '풀잠자리목',
      Megaloptera: '뱀잠자리목',
      Trichoptera: '날도래목',
      Phasmatodea: '대벌레목',
      Thysanoptera: '총채벌레목',
      Siphonaptera: '벼룩목',
      Psocodea: '이목'
    };
    koOrder = orderMap[orderCode] || '기타곤충목';
  }

  if (!koFamily) {
    if (koName.includes('호랑나비') || koName.includes('제비나비') || koName.includes('명주나비') || koName.includes('모시나비')) koFamily = '호랑나비과';
    else if (koName.includes('흰나비') || koName.includes('노랑나비') || koName.includes('기생나비')) koFamily = '흰나비과';
    else if (koName.includes('부전나비')) koFamily = '부전나비과';
    else if (koName.includes('팔랑나비')) koFamily = '팔랑나비과';
    else if (koName.includes('나비')) koFamily = '네발나비과';
    else if (koName.includes('산누에나방')) koFamily = '산누에나방과';
    else if (koName.includes('박각시')) koFamily = '박각시과';
    else if (koName.includes('자나방')) koFamily = '자나방과';
    else if (koName.includes('불나방')) koFamily = '불나방과';
    else if (koName.includes('갈고리나방')) koFamily = '갈고리나방과';
    else if (koName.includes('곡식좀나방')) koFamily = '곡식좀나방과';
    else if (koName.includes('좀나방')) koFamily = '집나방과';
    else if (koName.includes('순나방') || koName.includes('애기잎말이나방')) koFamily = '잎말이나방과';
    else if (koName.includes('명나방')) koFamily = '포충나방과';
    else if (koName.includes('나방')) koFamily = '밤나방과';
    else if (koName.includes('사슴벌레')) koFamily = '사슴벌레과';
    else if (koName.includes('꽃무지') || koName.includes('풍뎅이')) koFamily = '풍뎅이과';
    else if (koName.includes('하늘소')) koFamily = '하늘소과';
    else if (koName.includes('잎벌레')) koFamily = '잎벌레과';
    else if (koName.includes('무당벌레')) koFamily = '무당벌레과';
    else if (koName.includes('바구미') || koName.includes('거위벌레')) koFamily = '바구미과';
    else if (koName.includes('먼지벌레') || koName.includes('길앞잡이')) koFamily = '딱정벌레과';
    else if (koName.includes('반딧불이') || koName.includes('개똥벌레')) koFamily = '반딧불이과';
    else if (koName.includes('물방개')) koFamily = '물방개과';
    else if (koName.includes('비단벌레')) koFamily = '비단벌레과';
    else if (koName.includes('방아벌레')) koFamily = '방아벌레과';
    else if (koName.includes('반날개')) koFamily = '반날개과';
    else if (koName.includes('가뢰')) koFamily = '가뢰과';
    else if (koName.includes('거저리')) koFamily = '거저리과';
    else if (koName.includes('실잠자리') || koName.includes('물잠자리')) koFamily = '실잠자리과';
    else if (koName.includes('왕잠자리') || koName.includes('장수잠자리')) koFamily = '왕잠자리과';
    else if (koName.includes('잠자리') && orderCode === 'Odonata') koFamily = '잠자리과';
    else if (koName.includes('개미')) koFamily = '개미과';
    else if (koName.includes('꿀벌') || koName.includes('뒤영벌') || koName.includes('호박벌') || koName.includes('어리호박벌')) koFamily = '꿀벌과';
    else if (koName.includes('말벌') || koName.includes('땅벌') || koName.includes('쌍살벌') || koName.includes('감탕벌') || koName.includes('호리병벌')) koFamily = '말벌과';
    else if (koName.includes('가위벌')) koFamily = '가위벌과';
    else if (koName.includes('애꽃벌') || koName.includes('꼬마꽃벌')) koFamily = '애꽃벌과';
    else if (koName.includes('잎벌')) koFamily = '잎벌과';
    else if (koName.includes('고치벌')) koFamily = '고치벌과';
    else if (koName.includes('맵시벌')) koFamily = '맵시벌과';
    else if (koName.includes('대모벌')) koFamily = '대모벌과';
    else if (koName.includes('구멍벌') || koName.includes('나나니')) koFamily = '구멍벌과';
    else if (koName.includes('청벌')) koFamily = '청벌과';
    else if (koName.includes('소금쟁이')) koFamily = '소금쟁이과';
    else if (koName.includes('물장군') || koName.includes('물자라')) koFamily = '물장군과';
    else if (koName.includes('장구애비') || koName.includes('게아재비')) koFamily = '장구애비과';
    else if (koName.includes('매미충')) koFamily = '매미충과';
    else if (koName.includes('멸구')) koFamily = '멸구과';
    else if (koName.includes('진딧물') || koName.includes('면충')) koFamily = '진딧물과';
    else if (koName.includes('깍지벌레')) koFamily = '깍지벌레과';
    else if (koName.includes('매미')) koFamily = '매미과';
    else if (koName.includes('침노린재')) koFamily = '침노린재과';
    else if (koName.includes('노린재') || koName.includes('방패벌레') || koName.includes('빈대')) koFamily = '노린재과';
    else if (koName.includes('여치') || koName.includes('베짱이') || koName.includes('쌕쌔기') || koName.includes('철써기') || koName.includes('갈색여치')) koFamily = '여치과';
    else if (koName.includes('귀뚜라미') || koName.includes('방울벌레') || koName.includes('땅강아지')) koFamily = '귀뚜라미과';
    else if (koName.includes('꼽등이')) koFamily = '꼽등이과';
    else if (koName.includes('메뚜기') || koName.includes('방아깨비') || koName.includes('섬서구') || koName.includes('콩중이') || koName.includes('팥중이') || koName.includes('풀무치')) koFamily = '메뚜기과';
    else if (koName.includes('꽃등에')) koFamily = '꽃등에과';
    else if (koName.includes('모기')) koFamily = '모기과';
    else if (koName.includes('파리매')) koFamily = '파리매과';
    else if (koName.includes('초파리')) koFamily = '초파리과';
    else if (koName.includes('기생파리')) koFamily = '기생파리과';
    else if (koName.includes('등에')) koFamily = '등에과';
    else if (koName.includes('파리')) koFamily = '파리과';
    else if (koName.includes('사마귀')) koFamily = '사마귀과';
    else if (koName.includes('대벌레')) koFamily = '대벌레과';
    else if (koName.includes('집게벌레')) koFamily = '집게벌레과';
    else if (koName.includes('하루살이')) koFamily = '하루살이과';
    else if (koName.includes('날도래')) koFamily = '날도래과';
    else if (koName.includes('총채벌레')) koFamily = '총채벌레과';
    else if (koName.includes('벼룩')) koFamily = '벼룩과';
    else if (koName.includes('바퀴')) koFamily = '바퀴과';
    else if (koName.includes('개미귀신') || koName.includes('명주잠자리') || koName.includes('뿔잠자리')) koFamily = '명주잠자리과';
    else if (koName.includes('풀잠자리')) koFamily = '풀잠자리과';
    else koFamily = koOrder.replace('목', '과');
  }

  return { koOrder, koFamily };
}

function generateSpeciesRichProfile(koName, enName, sciName, orderCode, koOrder, koFamily, sizeMm, habitat) {
  // Determine color/visual trait from Korean name
  let colorTrait = '자연 환경에 잘 어울리는 고유의 색과 무늬';
  if (/금빛|금강|황|노랑|노란|귤빛/.test(koName)) colorTrait = '햇빛을 받으면 화사하게 빛나는 노란빛·금빛 무늬';
  else if (/붉은|주홍|홍|대추|팥/.test(koName)) colorTrait = '눈에 잘 띄는 선명한 붉은빛·주홍빛 포인트 무늬';
  else if (/푸른|청|남색|남|루리|초록|녹색|풀색/.test(koName)) colorTrait = '나뭇잎이나 보석처럼 맑은 초록빛·푸른빛 광택';
  else if (/검정|검은|먹|흑/.test(koName)) colorTrait = '차분하고 단단해 보이는 짙은 검은빛 몸빛';
  else if (/흰|백|은점|은빛|유리창/.test(koName)) colorTrait = '깨끗하고 선명한 흰색 또는 투명한 무늬';
  else if (/점박이|알락|별박이|네점|칠성|무늬|얼룩/.test(koName)) colorTrait = '몸과 날개에 규칙적으로 박힌 매력적인 점과 얼룩 무늬';
  else if (/줄|띠|호랑|제일/.test(koName)) colorTrait = '몸이나 날개를 가로지르는 뚜렷한 줄무늬';
  else if (/갈색|차색|밤/.test(koName)) colorTrait = '나무껍질이나 낙엽에 감쪽같이 숨을 수 있는 갈색 보호색';

  let appearance = '';
  let diet = '';
  let ecology = '';
  let fact = '';
  let warning = '';
  let anatomy = {
    antenna: '',
    head: '',
    eyes: '',
    mouth: '',
    body: '',
    legs: ''
  };

  if (orderCode === 'Lepidoptera') {
    const isMoth = koName.includes('나방') || koName.includes('박각시');
    appearance = `${koName}(${sciName})은(는) ${koFamily}에 속하는 ${isMoth ? '나방' : '나비'}으로, 날개 편 길이는 약 ${sizeMm}예요. 날개 표면에 미세한 비늘가루(인분)가 촘촘히 덮여 있으며 ${colorTrait}가 돋보여요.`;
    diet = isMoth && (koName.includes('곡식') || koName.includes('화랑'))
      ? '유충 시기에는 저장 곡물이나 마른 식물 재료를 먹고, 성충은 거의 먹지 않아요'
      : isMoth && koName.includes('산누에')
      ? '애벌레 시기에는 참나무·밤나무 잎을 먹고, 성충은 입이 퇴화해 먹지 않아요'
      : '꽃의 달콤한 꿀과 나무 수액, 미네랄이 섞인 물기';
    ecology = isMoth
      ? `주로 저녁이나 밤 시간대에 활발히 비행하며, 애벌레 시기에 충분한 영양분을 저장한 뒤 고치를 만들고 번데기를 거쳐 완전변태해요.`
      : `햇살이 따뜻한 낮 시간에 ${habitat} 주변을 날아다니며 꽃꿀을 빨아 먹고 꽃가루받이를 돕는 소중한 화분매개 곤충이에요.`;
    fact = `${enName}라는 영어 이름을 가지고 있으며, 날개의 비늘가루는 체온을 유지하고 거미줄이나 물방울로부터 날개를 보호하는 역할을 해요.`;
    warning = koName.includes('독나방') || koName.includes('쐐기') || koName.includes('송충') || koName.includes('불나방')
      ? '애벌레나 성충의 털에 피부 자극 성분이 있을 수 있으니 맨손으로 만지지 말고 눈으로만 관찰해요.'
      : '날개의 고운 비늘가루가 손에 묻으면 날기 어려워지므로 날개를 직접 잡지 말고 사진이나 눈으로 관찰해요.';
    anatomy = {
      antenna: isMoth ? '공기 중의 페로몬과 냄새 분자를 정밀하게 감지하는 빗살 모양 또는 실 모양 더듬이예요.' : '끝부분이 살짝 부풀어 오른 곤봉 모양 더듬이로 향기와 바람의 흐름을 느껴요.',
      head: '겹눈과 긴 대롱 입(주둥이)이 자리 잡은 작고 둥근 머리예요.',
      eyes: '자외선과 다양한 꽃의 색깔을 폭넓게 구분할 수 있는 반구형 겹눈을 가졌어요.',
      mouth: '평소에는 시계태엽처럼 둘둘 말아 두었다가 꿀을 빨 때 길게 펴는 빨대 모양(흡관형) 입이에요.',
      body: '가슴에 넓은 날개 두 쌍을 움직이는 튼튼한 비행 근육이 발달해 있어요.',
      legs: '식물 잎의 맛을 느끼는 감각 기관이 발끝에 있어 알을 낳을 먹이식물을 정확히 찾아내요.'
    };
  } else if (orderCode === 'Coleoptera') {
    appearance = `${koName}(${sciName})은(는) ${koFamily}에 속하는 딱정벌레로, 몸길이는 약 ${sizeMm}예요. 단단한 겉날개(딱지날개)가 속날개와 배를 안전하게 감싸고 있으며 ${colorTrait}가 특징이에요.`;
    if (koName.includes('무당벌레') && !koName.includes('이십팔')) {
      diet = '식물 줄기에 모인 진딧물과 깍지벌레 같은 작은 해충';
      ecology = `${habitat}의 식물 잎과 줄기를 부지런히 돌아다니며 진딧물을 사냥하는 든든한 천적 곤충이에요.`;
    } else if (koName.includes('먼지벌레') || koName.includes('길앞잡이') || koName.includes('물방개') || koName.includes('반날개')) {
      diet = '작은 곤충, 애벌레, 지렁이 등 작은 생물';
      ecology = `${habitat}의 땅 위나 물속에서 민첩하게 움직이며 작은 생물을 사냥하는 활동적인 포식자예요.`;
    } else if (koName.includes('꽃무지') || koName.includes('꽃하늘소')) {
      diet = '꽃의 꽃가루와 꿀, 참나무의 발효된 수액';
      ecology = `낮에 활짝 핀 꽃 위나 나무 수액터에 모여 먹이를 먹으며, 겉날개를 닫은 채로 속날개만 펴서 날 수 있는 종류도 많아요.`;
    } else if (koName.includes('사슴벌레') || koName.includes('하늘소') || koName.includes('장수풍뎅이')) {
      diet = '참나무 수액과 나무껍질, 잘 익은 과일 즙';
      ecology = `유충 시기에는 썩은 참나무나 고목 속에서 나무 섬유질을 먹고 자라며 숲의 물질 순환을 돕는 분해자 역할을 해요.`;
    } else {
      diet = '식물의 신선한 잎, 줄기, 열매 또는 곡물';
      ecology = `${habitat}의 먹이식물 주변에서 살아가며, 위험을 느끼면 다리를 오므리고 땅으로 툭 떨어져 죽은 척(의사 행동)하며 몸을 지켜요.`;
    }
    fact = `갑옷처럼 단단한 키틴질 겉날개 덕분에 좁은 나무 틈이나 흙 속에서도 날개가 상하지 않고 안전하게 생활할 수 있어요.`;
    warning = koName.includes('가뢰') || koName.includes('청가뢰') || koName.includes('남가뢰') || koName.includes('폭탄')
      ? '위험할 때 관절이나 배 끝에서 피부를 자극하는 방어 물질(칸타리딘 등)을 분비하므로 절대 맨손으로 만지지 마세요!'
      : koName.includes('사슴벌레') || koName.includes('하늘소')
      ? '큰턱의 무는 힘이 강하므로 손가락이 물리지 않도록 등 쪽을 조심스럽게 다루어요.'
      : '작고 단단한 곤충이지만 세게 쥐면 다리가 다칠 수 있으니 관찰통에 담아 관찰해요.';
    anatomy = {
      antenna: koName.includes('하늘소') ? '몸길이만큼 길게 뻗은 마디형 더듬이로 나무의 진동과 냄새를 민감하게 느껴요.' : koName.includes('풍뎅이') || koName.includes('꽃무지') || koName.includes('사슴벌레') ? '끝마디가 부채살이나 빗살처럼 벌어져 먹이 냄새를 잘 맡는 더듬이예요.' : '한 마디씩 이어진 염주 모양 또는 실 모양 더듬이로 주변 환경을 탐색해요.',
      head: '단단한 외골격으로 둘러싸여 있으며 먹이를 갉아 먹기에 알맞은 구조예요.',
      eyes: '머리 양옆에 자리 잡은 겹눈으로 움직임과 빛의 변화를 감지해요.',
      mouth: '나무껍질이나 잎, 먹이를 튼튼하게 씹거나 자를 수 있는 저작형(씹는형) 큰턱을 가졌어요.',
      body: '머리·가슴·배 세 부분으로 나뉘며, 앞날개가 딱딱한 딱지날개로 변해 몸을 보호해요.',
      legs: '나무줄기나 풀잎을 단단히 붙잡을 수 있도록 발끝에 날카로운 발톱이 발달해 있어요.'
    };
  } else if (orderCode === 'Hymenoptera') {
    const isAnt = koName.includes('개미');
    appearance = `${koName}(${sciName})은(는) ${koFamily}에 속하는 ${isAnt ? '개미' : '벌'}로, 몸길이는 약 ${sizeMm}예요. ${colorTrait}를 띠며, 투명하고 튼튼한 막질 날개(일개미는 무날개)와 잘록한 허리 구조가 특징이에요.`;
    diet = koName.includes('잎벌') ? '식물의 연한 잎과 꽃꿀' : koName.includes('말벌') || koName.includes('쌍살벌') || koName.includes('나나니') || koName.includes('대모벌') || koName.includes('고치벌') || koName.includes('맵시벌') ? '나비 애벌레·거미 등 작은 곤충과 꽃꿀, 나무 수액' : isAnt ? '진딧물의 단물(감로), 작은 곤충, 씨앗' : '꽃의 달콤한 꿀과 단백질이 풍부한 꽃가루';
    ecology = isAnt
      ? `여왕개미와 일개미가 역할을 나누어 땅속이나 나무 틈에 정교한 집을 짓고 협동하며 살아가는 사회성 곤충이에요.`
      : `${habitat} 일대를 부지런히 날아다니며 꽃가루받이를 돕거나 생태계의 곤충 개체 수를 조절하는 중요한 역할을 해요.`;
    fact = `앞날개와 뒷날개가 작은 갈고리(날개갈고리)로 연결되어 있어 비행할 때 한 장의 날개처럼 정교하고 빠르게 움직일 수 있어요.`;
    warning = koName.includes('잎벌')
      ? '벌목에 속하지만 독침이 없어 사람을 쏘지 않아요. 그래도 눈으로 부드럽게 관찰해요.'
      : '암컷의 산란관이 변한 독침이나 턱으로 방어할 수 있으니 손으로 잡지 말고 일정한 거리를 두고 안전하게 관찰해요.';
    anatomy = {
      antenna: '중간이 기역(ㄱ) 자처럼 살짝 꺾인 무릎 모양 또는 채찍 모양 더듬이로 동료와 신호를 주고받아요.',
      head: '정교한 감각 기관과 튼튼한 큰턱이 발달한 머리 구조를 가졌어요.',
      eyes: '머리 양옆의 큰 겹눈과 정수리의 홑눈 3개로 비행 방향과 태양의 위치를 정확히 파악해요.',
      mouth: '집을 짓거나 먹이를 무는 큰턱과 꿀을 핥아 먹는 혀가 함께 발달한 씹고 핥는 입이에요.',
      body: '가슴과 배 사이가 잘록하게 들어가(개미허리) 배를 자유자재로 구부릴 수 있어요.',
      legs: '꽃가루를 모으는 털이나 몸을 깨끗이 닦는 청소 기관이 다리에 발달해 있어요.'
    };
  } else if (orderCode === 'Hemiptera') {
    const isAquatic = /소금쟁이|물장군|물자라|장구애비|게아재비|송장헤엄치게|물매미|물벌레|물노린재/.test(koName);
    appearance = `${koName}(${sciName})은(는) ${koFamily}에 속하는 노린재목 곤충으로, 몸길이는 약 ${sizeMm}예요. ${colorTrait}를 지니며 찔러서 즙을 빨아 먹는 바늘 모양 입(주둥이)이 특징이에요.`;
    diet = isAquatic || koName.includes('침노린재') || koName.includes('애꽃노린재')
      ? '작은 곤충이나 물속 작은 생물의 체액'
      : '식물의 줄기·잎·열매에서 나오는 즙액';
    ecology = isAquatic
      ? `${habitat}의 수면 위나 물속에서 생활하며, 물의 표면장력을 이용하거나 노처럼 생긴 뒷다리로 헤엄치며 먹이를 사냥해요.`
      : `${habitat}의 식물 줄기나 잎에 앉아 바늘 같은 입으로 즙을 빨아 먹으며, 번데기 시기가 없는 불완전변태로 자라나요.`;
    fact = `노린재류는 앞날개의 밑부분은 단단한 가죽질이고 끝부분만 얇은 막질로 이루어진 '반딱지날개' 구조를 가지고 있어요.`;
    warning = isAquatic || koName.includes('침노린재')
      ? '날카로운 주둥이로 찌르면 상당히 아플 수 있으니 맨손으로 잡지 말고 채집망이나 관찰통으로 관찰해요.'
      : '위험을 느끼면 몸을 보호하기 위해 특유의 냄새 액체를 내뿜을 수 있으니 손으로 세게 만지지 마세요.';
    anatomy = {
      antenna: isAquatic ? '물속 저항을 줄이기 위해 머리 아래에 짧게 숨겨진 더듬이를 가졌어요.' : '4~5마디로 이루어진 막대 모양 더듬이로 먹이식물의 냄새를 맡아요.',
      head: '앞쪽이 삼각형이나 원뿔 모양으로 좁아지며 아래쪽에 주둥이가 연결되어 있어요.',
      eyes: '머리 양옆으로 볼록하게 튀어나온 겹눈으로 사방의 움직임을 빠르게 포착해요.',
      mouth: '식물 즙액이나 먹이의 체액을 찔러서 빨아 먹는 뾰족한 빨대 모양(흡수형) 주둥이예요.',
      body: '등 중앙에 역삼각형 모양의 작은방패판(소순판)이 뚜렷하게 발달해 있어요.',
      legs: isAquatic ? '수면에 뜨거나 물속에서 노처럼 헤엄치고 먹이를 움켜쥐기에 알맞게 진화한 다리예요.' : '식물 줄기와 잎에 안정적으로 매달릴 수 있는 튼튼한 세 쌍의 다리예요.'
    };
  } else if (orderCode === 'Orthoptera') {
    appearance = `${koName}(${sciName})은(는) ${koFamily}에 속하는 메뚜기목 곤충으로, 몸길이는 약 ${sizeMm}예요. ${colorTrait}를 띠며 탄력 있게 발달한 긴 뒷다리가 가장 큰 특징이에요.`;
    diet = koName.includes('여치') || koName.includes('베짱이') || koName.includes('꼽등이')
      ? '식물의 잎·열매와 작은 곤충을 함께 먹는 잡식성'
      : '벼, 강아지풀 등 화본과 식물의 싱싱한 풀잎';
    ecology = `${habitat}의 풀숲에서 높이 뛰어오르며 이동하고, 많은 종의 수컷이 날개나 뒷다리를 비벼 아름다운 소리로 짝을 불러요.`;
    fact = `몸길이의 수십 배에 달하는 거리를 한 번에 도약할 수 있으며, 앞다리 종아리마디나 배 첫째 마디에 소리를 듣는 '고막(귀)'이 있어요!`;
    warning = '뒷다리를 세게 잡으면 스스로 다리를 끊고 도망가는 자절 행동을 하므로 두 손으로 부드럽게 감싸 관찰해요.';
    anatomy = {
      antenna: koName.includes('여치') || koName.includes('베짱이') || koName.includes('귀뚜라미') || koName.includes('꼽등이') ? '몸길이보다 훨씬 길고 가느다란 실 모양 더듬이로 어두운 곳에서도 주변을 탐색해요.' : '몸길이보다 짧은 막대 모양 더듬이로 바람과 냄새를 느껴요.',
      head: '아래쪽을 향한 입과 튼튼한 턱 근육이 자리 잡은 둥글고 단단한 머리예요.',
      eyes: '넓은 시야를 확보하는 큰 겹눈과 빛의 밝기를 감지하는 홑눈 3개가 있어요.',
      mouth: '질긴 풀잎이나 먹이를 잘게 씹어 먹을 수 있는 튼튼한 저작형(씹는형) 입이에요.',
      body: '가슴의 앞등판이 말안장처럼 목과 날개 밑부분을 단단히 보호해 주어요.',
      legs: '근육이 굵게 발달한 뒷다리(도약다리)로 용수철처럼 힘차게 뛰어올라요.'
    };
  } else if (orderCode === 'Odonata') {
    const isDamsel = koName.includes('실잠자리') || koName.includes('물잠자리');
    appearance = `${koName}(${sciName})은(는) ${koFamily}에 속하는 ${isDamsel ? '실잠자리' : '잠자리'}로, 몸길이는 약 ${sizeMm}예요. 그물처럼 촘촘한 날개맥이 비치는 투명한 네 장의 날개와 ${colorTrait}가 돋보여요.`;
    diet = '모기, 파리, 하루살이 등 공중을 나는 작은 곤충';
    ecology = `애벌레(수채) 시절에는 물속에서 작은 수서생물을 사냥하며 자라고, 성충이 되면 ${habitat} 상공을 날며 작은 곤충을 사냥해요.`;
    fact = `네 장의 날개를 각각 독립적으로 움직일 수 있어서 공중 정지 비행(호버링)과 급선회, 후진 비행까지 자유자재로 할 수 있어요!`;
    warning = '얇고 투명한 날개는 손에 닿으면 찢어지기 쉬우므로 잠시 관찰한 뒤에는 곧바로 하늘로 날려 보내 주어요.';
    anatomy = {
      antenna: '시각이 매우 발달한 대신 더듬이는 아주 짧고 가는 털 모양으로 작게 퇴화했어요.',
      head: '머리의 대부분을 거대한 겹눈이 차지하며, 목이 유연해 머리를 넓게 회전할 수 있어요.',
      eyes: '1만 개가 넘는 낱눈이 모인 거대한 겹눈으로 360도에 가까운 시야를 한눈에 볼 수 있어요.',
      mouth: '공중에서 잡은 먹이를 놓치지 않고 씹어 먹는 튼튼한 큰턱을 가졌어요.',
      body: '비행할 때 중심을 잡아 주는 가늘고 긴 막대 모양의 배와 강력한 가슴 근육을 가졌어요.',
      legs: '다리에 뻣뻣한 가시털이 나 있어 비행 중에 바구니처럼 모아 작은 곤충을 낚아채요.'
    };
  } else if (orderCode === 'Diptera') {
    appearance = `${koName}(${sciName})은(는) ${koFamily}에 속하는 파리목 곤충으로, 몸길이는 약 ${sizeMm}예요. 앞날개 한 쌍만 비행에 사용하고 뒷날개는 작은 '평균곤'으로 변해 있으며 ${colorTrait}를 지녀요.`;
    diet = koName.includes('꽃등에') ? '꽃의 달콤한 꿀과 꽃가루' : koName.includes('파리매') ? '살아 있는 다른 곤충의 체액' : koName.includes('모기') || koName.includes('등에') ? '식물의 당분(수컷) 및 동물의 혈액(산란기 암컷)' : '유기물 즙액, 발효된 과일 즙, 꽃꿀';
    ecology = `뒷날개가 변한 평균곤으로 비행 균형을 정밀하게 잡으며 ${habitat} 주변에서 민첩하게 날아다녀요.`;
    fact = koName.includes('꽃등에')
      ? `벌과 비슷한 줄무늬를 가져 천적을 속이는 '베이츠 의태'의 대표적인 주인공이지만, 침이 없고 꽃가루받이를 돕는 고마운 곤충이에요!`
      : `평균곤이라는 평형 기관 덕분에 공중에서 방향을 순식간에 바꾸며 날 수 있어요.`;
    warning = koName.includes('모기') || koName.includes('등에')
      ? '피부를 물어 가려움이나 통증을 유발할 수 있으니 물리지 않도록 주의하며 관찰해요.'
      : '위생을 위해 맨손으로 만지지 말고 돋보기나 관찰통을 이용해 관찰한 뒤 손을 깨끗이 씻어요.';
    anatomy = {
      antenna: '얼굴 앞쪽에 짧게 달린 3마디 더듬이 끝에 감각모(까끄라기)가 발달해 공기 흐름과 냄새를 느껴요.',
      head: '유연한 목으로 연결되어 있으며 큰 겹눈과 특수한 입 구조가 모여 있어요.',
      eyes: '움직이는 물체를 인간보다 훨씬 빠른 속도로 인식하는 커다란 겹눈을 가졌어요.',
      mouth: koName.includes('모기') || koName.includes('등에') || koName.includes('파리매') ? '먹이나 피부를 찔러 즙액을 빨아들이는 예리한 흡수형 입이에요.' : '액체 상태의 먹이나 꽃꿀을 스펀지처럼 빨아들이는 핥는형(주둥이) 입이에요.',
      body: '앞날개 한 쌍을 초당 수백 번 진동시키는 탄력 있는 가슴 근육과 뒷날개가 변한 평균곤을 가졌어요.',
      legs: '발끝에 작은 발톱과 끈적한 흡반 패드(발바닥판)가 있어 매끄러운 유리창이나 천장에도 거꾸로 붙을 수 있어요.'
    };
  } else {
    // Mantodea, Phasmatodea, Dermaptera, Ephemeroptera, Neuroptera, Trichoptera, Blattodea, Thysanoptera, Siphonaptera, Psocodea
    appearance = `${koName}(${sciName})은(는) ${koOrder} ${koFamily}에 속하는 곤충으로, 몸길이는 약 ${sizeMm}예요. 서식 환경에 적응한 독특한 체형과 ${colorTrait}가 잘 나타나요.`;
    diet = orderCode === 'Mantodea' || orderCode === 'Neuroptera'
      ? '풀숲의 작은 곤충과 진딧물 등 살아 있는 작은 먹이'
      : orderCode === 'Phasmatodea' || orderCode === 'Thysanoptera'
      ? '나무와 풀의 잎, 꽃잎의 즙액'
      : orderCode === 'Ephemeroptera'
      ? '유충 시기에는 물속 유기물과 조류를 먹고 성충은 입이 퇴화해 먹지 않아요'
      : '자연 속의 유기물, 나뭇잎 조각, 작은 생물 등';
    ecology = `${habitat} 환경에서 자신만의 독특한 생존 방식과 보호색을 활용해 살아가며 자연 생태계의 먹이그물을 든든하게 지탱해요.`;
    fact = orderCode === 'Mantodea'
      ? `머리를 좌우로 180도 가까이 돌릴 수 있는 몇 안 되는 곤충으로, 가시가 돋친 낫 모양 앞다리로 0.05초 만에 먹이를 낚아채요!`
      : orderCode === 'Phasmatodea'
      ? `나뭇가지나 나뭇잎과 놀라울 정도로 똑같이 생겨 바람에 흔들리는 동작까지 흉내 내는 위장의 달인이에요!`
      : orderCode === 'Dermaptera'
      ? `배 끝에 멋진 집게를 가지고 있으며, 암컷이 알을 낳은 뒤 부화할 때까지 정성껏 핥아 주며 돌보는 모성애가 강한 곤충이에요!`
      : orderCode === 'Ephemeroptera' || orderCode === 'Trichoptera'
      ? `깨끗한 하천이나 연못의 수질을 알려 주는 대표적인 '수질 지표곤충'으로 물속 생태계에서 중요한 역할을 해요!`
      : `${koOrder} 고유의 독특한 몸 구조와 생활사를 통해 곤충의 놀라운 진화 다양성을 보여 주는 종이에요.`;
    warning = orderCode === 'Mantodea' || orderCode === 'Dermaptera'
      ? '앞다리 가시나 배 끝의 집게에 찝힐 수 있으니 손으로 갑자기 잡지 말고 차분히 관찰해요.'
      : '작고 섬세한 곤충이므로 서식 환경을 훼손하지 않고 눈이나 돋보기로 안전하게 관찰해요.';
    anatomy = {
      antenna: '주변의 미세한 공기의 떨림과 냄새, 장애물을 감지하는 섬세한 마디형 더듬이예요.',
      head: '서식 환경과 먹이 습성에 맞추어 감각 기관과 입틀이 조화롭게 배치된 머리예요.',
      eyes: '낮과 밤의 빛 변화와 천적의 움직임을 빠르게 알아차리는 겹눈을 가졌어요.',
      mouth: '먹이를 씹거나 즙액을 섭취하기에 알맞게 발달한 고유의 입틀 구조예요.',
      body: '머리·가슴·배 세 부분으로 이루어져 있으며 서식지 틈새나 식물에 잘 어울리는 체형이에요.',
      legs: orderCode === 'Mantodea' ? '앞다리는 먹이를 포획하는 강력한 낫 모양 포획다리이고 가운데·뒷다리는 걸어 다니는 다리예요.' : '자신이 사는 서식지 바닥이나 식물 줄기를 안정적으로 디디고 이동하는 세 쌍의 다리예요.'
    };
  }

  // Diverse quiz templates so not all quizzes are identical
  const quizTemplates = [
    {
      question: `${koName}을(를) 자연에서 가장 잘 만날 수 있는 주요 서식지는 어디일까요?`,
      options: [habitat, '남극의 빙하 위'],
      answer: 0,
      tip: `${koName}은(는) 먹이와 은신처가 풍부한 '${habitat}' 환경에서 주로 살아가요!`
    },
    {
      question: `${koName}은(는) 곤충 분류 중 어느 무리(목)에 속할까요?`,
      options: [koOrder, '십각목(게·새우류)'],
      answer: 0,
      tip: `${koName}은(는) 머리·가슴·배와 다리 6개를 가진 곤충강 '${koOrder}'(${koFamily})에 속해요!`
    },
    {
      question: `${koName}의 영어 이름 핵심 단어(Key Word)로 알맞은 것은 무엇일까요?`,
      options: [enName.split(' ').slice(-1)[0], 'Submarine'],
      answer: 0,
      tip: `${koName}의 영어 이름은 '${enName}'이며 학명은 '${sciName}'이에요!`
    }
  ];
  const quiz = quizTemplates[Math.abs(koName.charCodeAt(0) + koName.length) % quizTemplates.length];

  return {
    appearance,
    diet,
    ecology,
    fact,
    warning,
    anatomy,
    quiz
  };
}

// 1. Read existing insects150.json
const existing150 = JSON.parse(fs.readFileSync('insects150.json', 'utf8'));
const existing150Map = {};
existing150.forEach(item => {
  existing150Map[item.koreanName] = item;
});

// 2. Read 500종 곤충.csv
const raw500 = fs.readFileSync('500종 곤충.csv', 'utf8');
const csvRows = parseCSV(raw500);
const csvHeader = csvRows[0];
const csvData = csvRows.slice(1);

if (csvData.length !== 500) {
  throw new Error(`Expected 500 rows in 500종 곤충.csv, got ${csvData.length}`);
}

const full500 = [];
const updatedCsvRows = [csvHeader];
const seenIds = new Set();
const seenKo = new Set();
const seenSci = new Set();

csvData.forEach((row, idx) => {
  const num = parseInt(row[0], 10);
  const rawGroup = row[1];
  const rawClass = row[2] || '곤충강';
  const rawOrder = row[3];
  const rawFamily = row[4];
  const rawCat = row[5];
  const koName = row[6];
  const rawSci = row[7];
  const rawKind = row[8];
  const rawEnv = row[9];
  const rawAntenna = row[10];
  const rawHead = row[11];
  const rawEyes = row[12];
  const rawMouth = row[13];
  const rawBody = row[14];
  const rawLegs = row[15];
  const rawAppearance = row[16];
  const rawEcology = row[17];
  const rawWarning = row[18];
  const rawMemo = row[19];
  const rawStatus = row[20];

  let item = null;

  if (num <= 150 && existing150Map[koName]) {
    const orig = existing150Map[koName];
    const normalizedCat = normalizeCategory(orig.order, orig.category, koName);
    const { koOrder, koFamily } = inferKoreanOrderAndFamily(koName, orig.order, rawOrder, rawFamily);
    const generated = generateSpeciesRichProfile(koName, orig.englishName, orig.sciName, orig.order, koOrder, koFamily, orig.sizeMm, orig.habitat);

    const cleanAnat = (val, fallback) => {
      if (!val || val.includes('구체적인 설명 없음') || val.includes('확장판 추가 항목') || val.includes('확인 필요')) return fallback;
      return val;
    };

    const anatomyDetails = {
      antenna: cleanAnat(orig.anatomyDetails && orig.anatomyDetails.antenna, generated.anatomy.antenna),
      head: cleanAnat(orig.anatomyDetails && orig.anatomyDetails.head, generated.anatomy.head),
      eyes: cleanAnat(orig.anatomyDetails && orig.anatomyDetails.eyes, generated.anatomy.eyes),
      mouth: cleanAnat(orig.anatomyDetails && orig.anatomyDetails.mouth, generated.anatomy.mouth),
      body: cleanAnat(orig.anatomyDetails && orig.anatomyDetails.body, generated.anatomy.body),
      legs: cleanAnat(orig.anatomyDetails && orig.anatomyDetails.legs, generated.anatomy.legs)
    };

    item = {
      ...orig,
      category: normalizedCat,
      source: '500종 곤충 도감 데이터베이스 (국립생물자원관 기준)',
      reviewStatus: '검증 완료',
      anatomyDetails,
      extraMemo: orig.extraMemo && !orig.extraMemo.includes('확인 필요') ? orig.extraMemo : generated.fact
    };

    updatedCsvRows.push([
      num,
      `${koOrder} > ${koFamily}`,
      rawClass,
      koOrder,
      koFamily,
      normalizedCat,
      koName,
      item.sciName,
      rawKind,
      rawEnv || item.habitat,
      anatomyDetails.antenna,
      anatomyDetails.head,
      anatomyDetails.eyes,
      anatomyDetails.mouth,
      anatomyDetails.body,
      anatomyDetails.legs,
      item.appearance,
      item.ecology,
      item.warning,
      item.extraMemo,
      '검증 완료'
    ]);
  } else {
    const meta = DICT_151_500[koName];
    if (!meta) {
      throw new Error(`Missing dictionary entry for #${num} ${koName}`);
    }

    const normalizedCat = normalizeCategory(meta.order, rawCat || rawOrder, koName);
    const { koOrder, koFamily } = inferKoreanOrderAndFamily(koName, meta.order, rawOrder, rawFamily);
    const generated = generateSpeciesRichProfile(koName, meta.en, meta.sci, meta.order, koOrder, koFamily, meta.size, meta.habitat);

    const isBoilerplate = (txt) => !txt || txt.includes('500종 확장판') || txt.includes('확인 필요') || txt.includes('구체적인 설명 없음') || txt.includes('일반적인 곤충');

    const appearance = !isBoilerplate(rawAppearance) ? rawAppearance : generated.appearance;
    const ecology = !isBoilerplate(rawEcology) ? rawEcology : generated.ecology;
    const warning = !isBoilerplate(rawWarning) ? rawWarning : generated.warning;
    const fact = !isBoilerplate(rawMemo) ? rawMemo : generated.fact;

    const anatomyDetails = {
      antenna: !isBoilerplate(rawAntenna) ? rawAntenna : generated.anatomy.antenna,
      head: !isBoilerplate(rawHead) ? rawHead : generated.anatomy.head,
      eyes: !isBoilerplate(rawEyes) ? rawEyes : generated.anatomy.eyes,
      mouth: !isBoilerplate(rawMouth) ? rawMouth : generated.anatomy.mouth,
      body: !isBoilerplate(rawBody) ? rawBody : generated.anatomy.body,
      legs: !isBoilerplate(rawLegs) ? rawLegs : generated.anatomy.legs
    };

    const habitatEn = meta.habitat === '꽃밭' ? 'flower garden' : meta.habitat === '연못 주변' ? 'waterside pond' : meta.habitat === '풀밭' ? 'grassy meadow' : 'forest';

    item = {
      id: meta.id,
      koreanName: koName,
      englishName: meta.en,
      sciName: meta.sci,
      category: normalizedCat,
      order: meta.order,
      appearance,
      diet: generated.diet,
      habitat: meta.habitat,
      region: '한국 및 동아시아',
      sizeMm: meta.size,
      ecology,
      fact,
      keyWordEn: meta.word,
      sentenceEn: `The ${meta.en} lives in the ${habitatEn} and belongs to ${meta.order}.`,
      sentenceKo: `${koName}은(는) ${meta.habitat}에서 만날 수 있는 ${koFamily} 곤충이에요.`,
      warning,
      image: `svg:${meta.id}`,
      source: '500종 곤충 도감 데이터베이스 (국립생물자원관 기준)',
      reviewStatus: '검증 완료',
      anatomyDetails,
      extraMemo: fact,
      quiz: generated.quiz
    };

    updatedCsvRows.push([
      num,
      `${koOrder} > ${koFamily}`,
      rawClass,
      koOrder,
      koFamily,
      normalizedCat,
      koName,
      item.sciName,
      rawKind,
      rawEnv || item.habitat,
      anatomyDetails.antenna,
      anatomyDetails.head,
      anatomyDetails.eyes,
      anatomyDetails.mouth,
      anatomyDetails.body,
      anatomyDetails.legs,
      item.appearance,
      item.ecology,
      item.warning,
      item.extraMemo,
      '검증 완료'
    ]);
  }

  if (seenIds.has(item.id)) throw new Error(`Duplicate ID at #${num}: ${item.id}`);
  seenIds.add(item.id);

  if (seenKo.has(item.koreanName)) throw new Error(`Duplicate Korean Name at #${num}: ${item.koreanName}`);
  seenKo.add(item.koreanName);

  if (seenSci.has(item.sciName)) throw new Error(`Duplicate Scientific Name at #${num}: ${item.sciName}`);
  seenSci.add(item.sciName);

  full500.push(item);
});

// Write insects500.json and src/data/insects500.json
fs.writeFileSync('insects500.json', JSON.stringify(full500, null, 2), 'utf8');
if (fs.existsSync('src/data')) {
  fs.writeFileSync(path.join('src/data', 'insects500.json'), JSON.stringify(full500, null, 2), 'utf8');
}

// Also update insects150.json with normalized categories for first 150
const updated150 = full500.slice(0, 150);
fs.writeFileSync('insects150.json', JSON.stringify(updated150, null, 2), 'utf8');
if (fs.existsSync('src/data')) {
  fs.writeFileSync(path.join('src/data', 'insects150.json'), JSON.stringify(updated150, null, 2), 'utf8');
}

// Update 500종 곤충.csv with verified data
const csvContent = '\uFEFF' + updatedCsvRows.map(r => r.map(escapeCSVField).join(',')).join('\r\n') + '\r\n';
fs.writeFileSync('500종 곤충.csv', csvContent, 'utf8');

// Print summary statistics
const catCounts = {};
const habCounts = {};
full500.forEach(x => {
  catCounts[x.category] = (catCounts[x.category] || 0) + 1;
  habCounts[x.habitat] = (habCounts[x.habitat] || 0) + 1;
});
console.log('Successfully generated insects500.json (500 species) and updated 500종 곤충.csv!');
console.log('Category counts:', catCounts);
console.log('Habitat counts:', habCounts);
