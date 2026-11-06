/* ============================================================
   VIBUZZ ADMIN — 심사·승인 관리 시안 데이터
   기준 : 260914_심사승인관리_탭및상태체계_개편기획서
   실서비스 연동 시 심사 목록 조회 API 응답으로 대체하는 지점.
   (상태 · 자동 점검 결과 · 심사자 · 보완 요청 · 등급 · 게시 · 처리 이력)
   ============================================================ */
(function () {
  'use strict';

  /* 자동 점검은 기술·시스템 항목만 다룬다. 내용·정책 판단은 사람 심사에서 한다. */
  var AUTO_ITEMS = ['파일 형식', '파일 손상 여부', '재생 가능 여부', '메타데이터 정합성'];
  function auto(at, warn) {
    return {
      at: at,
      items: AUTO_ITEMS.map(function (name) {
        return { name: name, ok: true, warn: warn && warn.name === name ? warn.text : null };
      })
    };
  }

  /* 처리 이력 생성 : 시안에서는 상태 경로를 따라 이력을 만든다.
     실서비스에서는 상태 변경마다 서버가 남긴 감사 이력을 그대로 내려받는다. */
  function trail(it) {
    var steps = [];
    /* at 을 준 단계는 그 시각에 고정하고, 나머지는 앞뒤 고정 시각 사이를 나눠 채운다 */
    function add(from, to, by, kind, reason, at) { steps.push({ from: from, to: to, by: by, kind: kind, reason: reason, at: at || null }); }
    var rounds = it.rounds || [];

    add(null, 'upload', it.creator, 'human', '최초 업로드 (v1)', it.uploadedAt);
    add('upload', 'wait', '시스템', 'system', (rounds.length ? '' : autoSummary(it.auto) + ' — ') + '자동 점검 통과',
      rounds.length ? null : it.auto.at);
    rounds.forEach(function (r, i) {
      var last = i === rounds.length - 1;
      add('wait', 'review', r.by, 'human', '심사 시작');
      add('review', 'fix', r.by, 'human', '보완 요청 — ' + r.reason);
      add('fix', 'upload', it.creator, 'human', '보완본 제출 (v' + (i + 2) + ')');
      add('upload', 'wait', '시스템', 'system', (last ? autoSummary(it.auto) + ' — ' : '') + '자동 재점검 통과 · 재심사 ' + (i + 1) + '차',
        last ? it.auto.at : null);
    });
    if (it.state !== 'wait') {
      add('wait', 'review', it.reviewer, 'human', '심사 시작 (심사자 자동 배정)', it.startedAt);
      if (it.hold) { add('review', 'review', it.reviewer, 'human', '심사 보류 — ' + it.hold.reason, it.hold.at); }
      if (it.fix) { add('review', 'fix', it.fix.by, 'human', '보완 요청 — ' + it.fix.reason, it.fix.at); }
      if (it.state === 'blocked') { add('fix', 'blocked', '운영관리자', 'human', '최종 차단 — ' + it.blockReason); }
      if (it.approvedBy) { add('review', 'rating', it.approvedBy, 'human', '영상 심사 승인'); }
      if (it.rating) {
        add('rating', 'rating', it.rating.by, 'human', '등급 확정 — ' + it.rating.grade + ' · ' + it.rating.info.join(', '), it.rating.at);
        add('rating', 'done', '시스템', 'system', '게시 처리 완료 (' + it.postId + ')', it.publishedAt);
      }
    }
    if (!steps[steps.length - 1].at) { steps[steps.length - 1].at = it.enteredAt; }
    return stamp(steps);
  }
  function autoSummary(a) {
    var w = a.items.filter(function (x) { return x.warn; }).length;
    return w ? '경고 ' + w + '건' : '전 항목 정상';
  }
  /* 시각이 빈 단계는 앞뒤 고정 시각 사이를 고르게 나눠 채운다(시안 전용).
     첫 단계(업로드)와 마지막 단계는 항상 고정돼 있다. */
  function stamp(steps) {
    var ms = steps.map(function (s) { return s.at ? Date.parse(s.at.replace(' ', 'T')) : null; });
    var i = 0;
    while (i < ms.length) {
      if (ms[i] !== null) { i++; continue; }
      var j = i;
      while (ms[j] === null) { j++; }
      var a = ms[i - 1], gap = (ms[j] - a) / (j - i + 1);
      for (var k = i; k < j; k++) { ms[k] = a + gap * (k - i + 1); }
      i = j;
    }
    return steps.map(function (s, idx) {
      var o = {};
      Object.keys(s).forEach(function (key) { o[key] = s[key]; });
      o.at = s.at || fmt(new Date(ms[idx]));
      return o;
    });
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function fmt(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  var ITEMS = [
    /* ---- 영상 심사 대기 ---- */
    { id: 'RV-7301', cid: 'C-2201', title: '그 계절, 우리가 사랑한 시간 13화', creator: '몽글스튜디오', state: 'wait',
      uploadedAt: '2026-10-08 08:31', enteredAt: '2026-10-08 09:12', auto: auto('2026-10-08 09:12') },
    { id: 'RV-7302', cid: 'C-2108', title: '나의 알고리즘 7화', creator: '픽셀공방', state: 'wait',
      uploadedAt: '2026-10-02 10:20', enteredAt: '2026-10-08 08:40', auto: auto('2026-10-08 08:40'),
      rounds: [{ by: '박민지', reason: '오프닝 음원 권리 확인 불가' }] },
    { id: 'RV-7303', cid: 'C-2063', title: '도시의 새벽 산책', creator: '새벽필름', state: 'wait',
      uploadedAt: '2026-10-07 16:58', enteredAt: '2026-10-07 17:25',
      auto: auto('2026-10-07 17:25', { name: '메타데이터 정합성', text: '검색 태그 미입력(권장 항목)' }) },
    { id: 'RV-7304', cid: 'C-2215', title: 'AI 요리왕 3화', creator: '쿡랩', state: 'wait',
      uploadedAt: '2026-09-29 13:10', enteredAt: '2026-10-07 14:02', auto: auto('2026-10-07 14:02'),
      rounds: [
        { by: '이준호', reason: '협찬 표기 누락' },
        { by: '김서연', reason: '협찬 표기 위치가 영상 시작 10초 이후' }
      ] },

    /* ---- 영상 심사 중 ---- */
    { id: 'RV-7291', cid: 'C-2060', title: '별빛 아래 두 사람 1화', creator: '루미너스', state: 'review',
      uploadedAt: '2026-10-07 20:05', enteredAt: '2026-10-08 09:40', auto: auto('2026-10-07 20:31'),
      reviewer: '이준호', startedAt: '2026-10-08 09:40', progress: 62 },
    { id: 'RV-7293', cid: 'C-2190', title: '심야 배달부 2', creator: '나이트픽처스', state: 'review',
      uploadedAt: '2026-10-06 22:14', enteredAt: '2026-10-07 16:10', auto: auto('2026-10-06 22:40'),
      reviewer: '김서연', startedAt: '2026-10-07 16:10', progress: 35,
      hold: { reason: '정책 해석 필요 — 폭력 묘사 수위 판단을 정책팀에 문의', at: '2026-10-07 17:02' } },
    { id: 'RV-7295', cid: 'C-2209', title: '바다를 그린 소년', creator: '파란연필', state: 'review',
      uploadedAt: '2026-10-08 07:48', enteredAt: '2026-10-08 10:05', auto: auto('2026-10-08 08:12'),
      reviewer: '운영관리자', startedAt: '2026-10-08 10:05', progress: 12 },

    /* ---- 보완 대기 ---- */
    { id: 'RV-7281', cid: 'C-2110', title: '심야 배달부', creator: '나이트픽처스', state: 'fix',
      uploadedAt: '2026-10-05 19:30', enteredAt: '2026-10-06 15:20', auto: auto('2026-10-05 19:52'),
      reviewer: '이준호', startedAt: '2026-10-06 13:05', progress: 100,
      fix: { reason: '과도한 폭력 묘사 구간(12:40~13:15) 편집 필요', by: '이준호', at: '2026-10-06 15:20', due: '2026-10-09', renotified: 0 } },
    { id: 'RV-7284', cid: 'C-2177', title: '미래 도시 2077 4화', creator: '네온웍스', state: 'fix',
      uploadedAt: '2026-10-04 09:12', enteredAt: '2026-10-05 11:00', auto: auto('2026-10-04 09:40'),
      reviewer: '박민지', startedAt: '2026-10-05 10:02', progress: 100,
      fix: { reason: '출처 미표기 생성 이미지 사용 — 사용 도구·출처 표기 보완', by: '박민지', at: '2026-10-05 11:00', due: '2026-10-08', renotified: 1 } },

    /* ---- 등급 심사 ---- */
    { id: 'RV-7276', cid: 'C-2104', title: '그 계절 S2 4화', creator: '몽글스튜디오', state: 'rating',
      uploadedAt: '2026-10-06 18:40', enteredAt: '2026-10-07 18:30', auto: auto('2026-10-06 19:02'),
      reviewer: '김서연', startedAt: '2026-10-07 16:45', progress: 100, approvedBy: '김서연' },
    { id: 'RV-7278', cid: 'C-2150', title: '고양이 탐정 미유 2화', creator: '말랑애니', state: 'rating',
      uploadedAt: '2026-10-07 21:00', enteredAt: '2026-10-08 08:55', auto: auto('2026-10-07 21:24'),
      reviewer: '이준호', startedAt: '2026-10-08 08:10', progress: 100, approvedBy: '이준호' },

    /* ---- 게시 완료 ---- */
    { id: 'RV-7260', cid: 'C-2049', title: '그 계절, 우리가 사랑한 시간 12화', creator: '몽글스튜디오', state: 'done',
      uploadedAt: '2026-10-06 08:10', enteredAt: '2026-10-07 10:42', auto: auto('2026-10-06 08:33'),
      reviewer: '김서연', startedAt: '2026-10-06 14:00', progress: 100, approvedBy: '김서연',
      rating: { grade: '15세 이상', info: ['주제', '대사'], reason: '연인 간 갈등 장면의 대사 수위가 15세 기준에 해당', by: '박민지', at: '2026-10-07 10:40' },
      publishedAt: '2026-10-07 10:42', postId: 'P-58120' },
    { id: 'RV-7262', cid: 'C-2141', title: 'AI 동물원 5화', creator: '말랑애니', state: 'done',
      uploadedAt: '2026-10-05 11:20', enteredAt: '2026-10-06 16:00', auto: auto('2026-10-05 11:41'),
      reviewer: '이준호', startedAt: '2026-10-05 15:30', progress: 100, approvedBy: '이준호',
      rating: { grade: '전체관람가', info: ['주제'], reason: '교육·오락 목적의 동물 소개 콘텐츠로 유해 요소 없음', by: '박민지', at: '2026-10-06 15:58' },
      publishedAt: '2026-10-06 16:00', postId: 'P-58074' },
    { id: 'RV-7265', cid: 'C-2120', title: '검은 숲의 기록', creator: '새벽필름', state: 'done',
      uploadedAt: '2026-10-03 23:02', enteredAt: '2026-10-05 20:10', auto: auto('2026-10-03 23:30'),
      reviewer: '김서연', startedAt: '2026-10-04 10:15', progress: 100, approvedBy: '김서연',
      rating: { grade: '청소년관람불가', info: ['주제', '폭력성', '공포'], reason: '신체 훼손 묘사와 지속적 공포 연출이 청소년 기준을 초과', by: '박민지', at: '2026-10-05 20:05' },
      publishedAt: '2026-10-05 20:10', postId: 'P-57990' },

    /* ---- 최종 차단 (메인 탭 없이 전체 탭에서만 조회) ---- */
    { id: 'RV-7240', cid: 'C-2099', title: '무제 클립 모음', creator: '클립메이커', state: 'blocked',
      uploadedAt: '2026-09-28 14:00', enteredAt: '2026-10-04 18:20', auto: auto('2026-09-28 14:22'),
      reviewer: '이준호', startedAt: '2026-09-29 10:00', progress: 100,
      fix: { reason: '타 채널 영상 무단 편집 사용 — 권리 증빙 제출 필요', by: '이준호', at: '2026-09-29 11:30', due: '2026-10-03', renotified: 2 },
      blockReason: '기한 내 권리 증빙 미제출' }
  ];

  window.ADMIN_REVIEW_DATA = {
    items: ITEMS.map(function (it) {
      var o = {};
      Object.keys(it).forEach(function (k) { o[k] = it[k]; });
      o.recheck = (it.rounds || []).length;
      o.version = 'v' + (o.recheck + 1);
      o.history = trail(it);
      return o;
    })
  };
})();
