/* ============================================================
   VIBUZZ ADMIN — 심사·승인 관리 화면 (콘텐츠 관리 › 심사·승인 관리)
   기준 : 260914_심사승인관리_탭및상태체계_개편기획서

   흐름  업로드 → 시스템 자동 점검 → 영상 심사 대기 → 영상 심사 중 → 승인
         → 등급 심사 → 게시 완료
   보완  영상 심사 중 → 보완 요청 → 보완 대기 → 보완본 제출 → 자동 재점검
         → 영상 심사 대기(재심사)

   - 자동 점검은 메인 탭 없이 결과 배지와 처리 이력으로만 표시한다.
   - 한 건은 현재 상태 기준으로 하나의 탭에만 속한다. 전체 탭은 상세 보기만 제공한다.
   - 상태 변경은 commit() 한 곳을 지난다 — 실서비스에서는 여기서 상태 전환 API 를 호출하고
     (서버가 동시 심사를 막고 최신 상태·탭 카운트를 돌려준다), 실패하면 이전 값으로 되돌린다.
   ============================================================ */
(function () {
  'use strict';

  var UI = window.ADMIN_UI;
  if (!UI) { return; }
  var el = UI.el;

  /* ---------- 상수 ---------- */
  var STATE = {
    upload: { label: '업로드', tone: 'mute' },
    wait: { label: '영상 심사 대기', tone: 'info' },
    review: { label: '영상 심사 중', tone: 'brand' },
    fix: { label: '보완 대기', tone: 'warn' },
    rating: { label: '등급 심사', tone: 'info' },
    done: { label: '게시 완료', tone: 'ok' },
    blocked: { label: '최종 차단', tone: 'err' }
  };
  var GRADES = ['전체관람가', '12세 이상', '15세 이상', '청소년관람불가'];
  var CONTENT_INFO = ['주제', '선정성', '폭력성', '대사', '공포', '약물', '모방위험'];
  var HOLD_REASONS = ['정책 해석 필요(정책팀 문의)', '권리·출처 확인 대기', '제출자 추가 자료 확인 필요', '영상 재생 이상(기술 확인 필요)', '기타'];
  var FIX_REASONS = ['정책 위반 구간 편집 필요', '권리·출처 증빙 보완', '협찬·광고 표기 보완', '메타데이터(제목·설명·썸네일) 수정', '자막·음성 품질 보완', '기타'];
  var BLOCK_REASONS = ['기한 내 보완 미제출', '보완 후에도 정책 위반 지속', '권리 침해 확인', '반복 위반 크리에이터', '기타'];
  var FIX_DUE_DAYS = 3;

  /* 권한 : 조회 전용은 상세 보기만, 영상 심사 · 등급 심사 권한을 나누고 최종 차단은 고권한으로 둔다 */
  var ROLES = [
    { key: 'super', label: '슈퍼관리자', perms: ['view', 'review', 'notify', 'rate', 'block'] },
    { key: 'reviewer', label: '영상 심사 담당', perms: ['view', 'review', 'notify'] },
    { key: 'rater', label: '등급 심사 담당', perms: ['view', 'rate'] },
    { key: 'viewer', label: '조회 전용', perms: ['view'] }
  ];
  var ME = '운영관리자';

  var TABS = [
    { key: 'all', label: '전체', states: null },
    { key: 'wait', label: '영상 심사 대기', states: ['wait'] },
    { key: 'review', label: '영상 심사 중', states: ['review'] },
    { key: 'fix', label: '보완 대기', states: ['fix'] },
    { key: 'rating', label: '등급 심사', states: ['rating'] },
    { key: 'done', label: '게시 완료', states: ['done'] }
  ];

  /* ---------- 상태 (화면 이동 후 돌아와도 유지되도록 모듈에 둔다) ---------- */
  var items = ((window.ADMIN_REVIEW_DATA || {}).items || []).slice();
  var view = { tab: 'all', q: '', kind: '전체', role: 'super' };

  /* ---------- 시각 ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function stampNow() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function dayAfter(days) {
    var d = new Date(Date.now() + days * 864e5);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function parse(s) { return Date.parse(String(s).replace(' ', 'T')); }
  function since(s) {
    var m = Math.max(0, Math.floor((Date.now() - parse(s)) / 60000));
    if (m < 1) { return '방금'; }
    if (m < 60) { return m + '분'; }
    var h = Math.floor(m / 60);
    if (h < 24) { return h + '시간 ' + (m % 60) + '분'; }
    return Math.floor(h / 24) + '일 ' + (h % 24) + '시간';
  }

  /* ---------- 권한 · 조회 ---------- */
  function role() { return ROLES.filter(function (r) { return r.key === view.role; })[0] || ROLES[0]; }
  function can(perm) { return role().perms.indexOf(perm) >= 0; }
  function findItem(id) { return items.filter(function (x) { return x.id === id; })[0] || null; }
  function tabOf(key) { return TABS.filter(function (t) { return t.key === key; })[0] || TABS[0]; }

  /* 탭 카운트와 목록은 같은 조회 기준(검색어)을 쓴다 */
  function matchQuery(it) {
    var q = view.q.trim().toLowerCase();
    if (!q) { return true; }
    return [it.id, it.cid, it.title, it.creator].join(' ').toLowerCase().indexOf(q) >= 0;
  }
  function inTab(it, tab) { return !tab.states || tab.states.indexOf(it.state) >= 0; }
  function countOf(tab) { return items.filter(function (it) { return matchQuery(it) && inTab(it, tab); }).length; }
  function rowsOf(tab) {
    return items.filter(function (it) {
      if (!matchQuery(it) || !inTab(it, tab)) { return false; }
      if (tab.key === 'wait' && view.kind === '신규') { return !it.recheck; }
      if (tab.key === 'wait' && view.kind === '재심사') { return it.recheck > 0; }
      return true;
    });
  }

  /* ---------- 상태 변경 (불변 갱신 + 감사 이력) ----------
     changes 로 새 객체를 만들고 이력 한 줄을 덧붙인다. 원본 객체는 건드리지 않는다. */
  function commit(id, changes, log) {
    var prev = findItem(id);
    if (!prev) { return null; }
    var entry = { at: stampNow(), from: prev.state, to: changes.state || prev.state, by: ME, kind: 'human', reason: log };
    var next = Object.assign({}, prev, changes, { history: prev.history.concat([entry]) });
    if (changes.state && changes.state !== prev.state) { next.enteredAt = entry.at; }
    /* 실서비스 연동 지점 : 여기서 상태 전환 API 를 호출한다.
       응답의 최신 상태·탭 카운트로 갱신하고, 409(다른 심사자가 선점)·실패 시에는
       교체 전 목록으로 되돌린 뒤 "처리하지 못했습니다. 다시 시도해 주세요." 를 안내한다. */
    items = items.map(function (x) { return x.id === id ? next : x; });
    return next;
  }
  function systemLog(id, changes, log) {
    var prev = findItem(id);
    var entry = { at: stampNow(), from: prev.state, to: changes.state || prev.state, by: '시스템', kind: 'system', reason: log };
    var next = Object.assign({}, prev, changes, { history: prev.history.concat([entry]) });
    if (changes.state && changes.state !== prev.state) { next.enteredAt = entry.at; }
    items = items.map(function (x) { return x.id === id ? next : x; });
  }

  /* ---------- 공용 표시 ---------- */
  function stateBadge(it) {
    if (it.state === 'review' && it.hold) { return UI.badge({ b: '심사 보류', t: 'warn' }); }
    var s = STATE[it.state] || STATE.upload;
    return UI.badge({ b: s.label, t: s.tone });
  }
  function autoBadge(it) {
    var warn = it.auto.items.filter(function (x) { return x.warn; }).length;
    return UI.badge(warn ? { b: '통과 · 경고 ' + warn, t: 'warn' } : { b: '통과', t: 'ok' });
  }
  function kindBadge(it) {
    return it.recheck ? UI.badge({ b: '재심사 ' + it.recheck + '차', t: 'brand' }) : UI.badge({ b: '신규', t: 'mute' });
  }
  function contentCell(it) {
    var box = el('div', 'rv-content');
    box.appendChild(el('strong', 'rv-content__title', it.title));
    box.appendChild(el('span', 'rv-content__sub', it.cid + ' · ' + it.creator + ' · ' + it.version));
    return box;
  }
  function progressCell(it) {
    var box = el('div', 'rv-progress');
    var bar = el('span', 'rv-progress__bar');
    var fill = el('span', 'rv-progress__fill');
    fill.style.width = Math.min(100, Math.max(0, it.progress || 0)) + '%';
    bar.appendChild(fill);
    box.appendChild(bar);
    box.appendChild(el('span', 'rv-progress__val', (it.progress || 0) + '%'));
    box.setAttribute('aria-label', '영상 확인 진행률 ' + (it.progress || 0) + '%');
    return box;
  }
  function dueCell(it) {
    var today = dayAfter(0);
    if (it.fix.due < today) { return UI.badge({ b: it.fix.due + ' · 기한 경과', t: 'err' }); }
    if (it.fix.due === today) { return UI.badge({ b: it.fix.due + ' · 오늘 마감', t: 'warn' }); }
    return document.createTextNode(it.fix.due);
  }
  function longText(t) { return el('span', 'rv-long', t || '-'); }
  function infoText(list) { return list && list.length ? list.join(', ') : '-'; }
  function pending(t) { return el('span', 'rv-pending', t || '미입력'); }

  /* ---------- 탭별 열 정의 ---------- */
  var COLUMNS = {
    all: [
      ['현재 상태', stateBadge],
      ['자동 점검', autoBadge],
      ['상태 진입', function (it) { return it.enteredAt; }]
    ],
    wait: [
      ['구분', kindBadge],
      ['자동 점검', autoBadge],
      ['대기 시간', function (it) {
        var t = since(it.enteredAt);
        var late = Date.now() - parse(it.enteredAt) > 864e5;
        return late ? UI.badge({ b: t, t: 'warn' }) : t;
      }]
    ],
    review: [
      ['심사자', function (it) { return it.reviewer + (it.reviewer === ME ? ' (나)' : ''); }],
      ['시작 시각', function (it) { return it.startedAt; }],
      ['진행률', progressCell],
      ['보류', function (it) { return it.hold ? longText(it.hold.reason) : pending('-'); }]
    ],
    fix: [
      ['보완 사유', function (it) { return longText(it.fix.reason); }],
      ['요청자', function (it) { return it.fix.by; }],
      ['요청 시각', function (it) { return it.fix.at; }],
      ['제출 기한', dueCell],
      ['재알림', function (it) { return it.fix.renotified ? it.fix.renotified + '회' : pending('없음'); }]
    ],
    rating: [
      ['이용등급', function (it) { return it.rating ? it.rating.grade : pending(); }],
      ['내용정보', function (it) { return it.rating ? infoText(it.rating.info) : pending(); }],
      ['판정 사유', function (it) { return it.rating ? longText(it.rating.reason) : pending(); }],
      ['승인 심사자', function (it) { return it.approvedBy || '-'; }]
    ],
    done: [
      ['최종 등급', function (it) { return UI.badge({ b: it.rating.grade, t: it.rating.grade === '청소년관람불가' ? 'err' : 'mute' }); }],
      ['내용정보', function (it) { return infoText(it.rating.info); }],
      ['게시일', function (it) { return it.publishedAt; }]
    ]
  };

  /* ---------- 탭별 행 행동 ----------
     전체 탭은 상세 보기만. 상태 변경은 해당 업무 탭에서만 노출한다. */
  var ACTIONS = {
    all: ['detail'],
    wait: ['detail', 'start'],
    review: ['detail', 'complete', 'hold', 'resume'],
    fix: ['detail', 'notify', 'block'],
    rating: ['detail', 'rate', 'history'],
    done: ['detail', 'post', 'trail']
  };
  var ACTION_DEF = {
    detail: { label: '상세 보기', kind: 'ghost', perm: 'view', run: function (it) { openDetail(it.id); } },
    start: { label: '심사 시작', kind: 'primary', perm: 'review', run: function (it) { doStart(it.id); } },
    complete: { label: '심사 완료', kind: 'primary', perm: 'review', mine: true, when: function (it) { return !it.hold; }, run: function (it) { openComplete(it.id); } },
    hold: { label: '심사 보류', kind: 'ghost', perm: 'review', mine: true, when: function (it) { return !it.hold; }, run: function (it) { openHold(it.id); } },
    resume: { label: '심사 재개', kind: 'primary', perm: 'review', mine: true, when: function (it) { return !!it.hold; }, run: function (it) { doResume(it.id); } },
    notify: { label: '요청 내용 재알림', kind: 'ghost', perm: 'notify', run: function (it) { doNotify(it.id); } },
    block: { label: '최종 차단', kind: 'danger', perm: 'block', run: function (it) { openBlock(it.id); } },
    rate: { label: '등급 확정', kind: 'primary', perm: 'rate', run: function (it) { openRating(it.id); } },
    history: { label: '심사 이력', kind: 'ghost', perm: 'view', run: function (it) { openDetail(it.id, true); } },
    post: { label: '게시물 보기', kind: 'ghost', perm: 'view', run: function (it) { UI.showToast('게시물 ' + it.postId + ' 페이지를 엽니다 (서비스 연동 지점)'); } },
    trail: { label: '처리 이력', kind: 'ghost', perm: 'view', run: function (it) { openDetail(it.id, true); } }
  };
  /* 심사 시작으로 선점한 건은 선점한 심사자만 이어서 처리한다(슈퍼관리자는 예외) */
  function blockedByOwner(def, it) {
    return def.mine && view.role !== 'super' && it.reviewer !== ME;
  }
  function actionsCell(it, tabKey) {
    var box = el('div', 'rv-actions');
    ACTIONS[tabKey].forEach(function (key) {
      var def = ACTION_DEF[key];
      if (!can(def.perm)) { return; }
      if (def.when && !def.when(it)) { return; }
      var b = el('button', 'adm-btn adm-btn--sm adm-btn--' + def.kind, def.label);
      b.type = 'button';
      if (blockedByOwner(def, it)) {
        b.disabled = true;
        b.title = '담당 심사자(' + it.reviewer + ')만 처리할 수 있습니다';
      }
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!b.disabled) { def.run(it); }
      });
      box.appendChild(b);
    });
    return box;
  }

  /* ---------- 대화상자 (기존 .adm-modal 스타일 재사용) ---------- */
  var dlgSeq = 0;
  var openApi = null;   /* 열려 있는 대화상자 (한 번에 하나) */
  function openDialog(o) {
    var prevFocus = document.activeElement;
    var back = el('div', 'adm-modal');
    var dim = el('div', 'adm-modal__dim');
    var panel = el('div', 'adm-modal__panel' + (o.wide ? ' rv-modal--wide' : ''));
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');

    var head = el('div', 'adm-modal__head');
    var htext = el('div');
    var h = el('h3', 'adm-modal__title', o.title);
    h.id = 'rv-dlg-' + (++dlgSeq);
    panel.setAttribute('aria-labelledby', h.id);
    htext.appendChild(h);
    if (o.desc) { htext.appendChild(el('p', 'adm-modal__desc', o.desc)); }
    head.appendChild(htext);
    panel.appendChild(head);

    var body = el('div', 'adm-modal__body');
    var err = el('div', 'rv-error');
    err.hidden = true;
    err.setAttribute('role', 'alert');
    body.appendChild(err);
    var holder = el('div');
    body.appendChild(holder);
    panel.appendChild(body);

    var foot = el('div', 'adm-modal__foot');
    var cancel = el('button', 'adm-btn adm-btn--ghost', o.cancelLabel || '취소');
    cancel.type = 'button';
    foot.appendChild(cancel);
    var ok = null;
    if (o.submit) {
      ok = el('button', 'adm-btn adm-btn--' + (o.kind || 'primary'), o.submit);
      ok.type = 'button';
      foot.appendChild(ok);
    }
    panel.appendChild(foot);

    var api = {
      body: holder,
      ok: ok,
      cancel: cancel,
      panel: panel,
      error: function (msgs) {
        err.innerHTML = '';
        err.hidden = !msgs || !msgs.length;
        if (err.hidden) { return; }
        err.appendChild(el('strong', null, '입력이 필요한 항목이 있습니다'));
        var ul = el('ul');
        msgs.forEach(function (m) { ul.appendChild(el('li', null, m)); });
        err.appendChild(ul);
        body.scrollTop = 0;
      },
      close: function (keepFocus) {
        if (openApi === api) { openApi = null; }
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('hashchange', onNav);
        if (back.parentNode) { back.parentNode.removeChild(back); }
        document.body.classList.remove('adm-modal-open');
        if (!keepFocus && prevFocus && prevFocus.isConnected && prevFocus.focus) { prevFocus.focus(); }
      }
    };
    function onKey(e) {
      /* 열린 선택 상자를 닫는 Esc 는 대화상자까지 닫지 않는다 */
      if (e.key === 'Escape') {
        if (!e.defaultPrevented && !(e.target && e.target.tagName === 'SELECT')) { api.close(); }
        return;
      }
      if (e.key !== 'Tab') { return; }
      /* 숨긴 단계([hidden])의 입력은 포커스 순환에서 뺀다 */
      var f = Array.prototype.filter.call(
        panel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'),
        function (n) { return !n.closest('[hidden]'); }
      );
      if (!f.length) { return; }
      var first = f[0], last = f[f.length - 1];
      if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    cancel.addEventListener('click', function () {
      if (o.onCancel && o.onCancel(api) === false) { return; }
      api.close();
    });
    /* 입력이 있는 대화상자는 바깥 클릭으로 닫지 않는다(작성 중인 사유 유실 방지) */
    dim.addEventListener('click', function () { if (!o.submit) { api.close(); } });
    document.addEventListener('keydown', onKey);
    /* 다른 화면으로 이동하면(뒤로 가기 등) 대화상자를 함께 닫는다 */
    function onNav() { api.close(true); }
    window.addEventListener('hashchange', onNav);
    if (ok) { ok.addEventListener('click', function () { o.onSubmit(api); }); }

    if (o.build) { o.build(api); }
    if (openApi) { openApi.close(true); }
    openApi = api;
    back.appendChild(dim);
    back.appendChild(panel);
    document.body.appendChild(back);
    document.body.classList.add('adm-modal-open');
    var firstField = panel.querySelector('input, select, textarea') || ok || cancel;
    firstField.focus();
    return api;
  }

  /* 대화상자 입력 행 */
  function field(labelText, req, node, hint) {
    var row = el('div', 'adm-modal__row');
    var lb = el('p', 'adm-modal__label', labelText);
    if (req) { lb.appendChild(el('span', 'req', '*')); }
    row.appendChild(lb);
    var f = el('div', 'adm-modal__field');
    f.appendChild(node);
    if (hint) { f.appendChild(el('p', 'adm-form__hint', hint)); }
    row.appendChild(f);
    return row;
  }
  function selectOf(options, ph) {
    var s = document.createElement('select');
    var p = document.createElement('option');
    p.value = ''; p.textContent = ph || '선택하세요';
    s.appendChild(p);
    options.forEach(function (v) {
      var op = document.createElement('option');
      op.value = v; op.textContent = v;
      s.appendChild(op);
    });
    return s;
  }
  function textareaOf(ph) {
    var t = document.createElement('textarea');
    t.rows = 3;
    t.placeholder = ph || '';
    return t;
  }
  function choiceGroup(name, options, multi) {
    var g = el('div', 'rv-choices' + (multi ? ' rv-choices--multi' : ''));
    g.setAttribute('role', multi ? 'group' : 'radiogroup');
    options.forEach(function (v) {
      var lb = el('label', 'rv-choice');
      var input = document.createElement('input');
      input.type = multi ? 'checkbox' : 'radio';
      input.name = name;
      input.value = v;
      lb.appendChild(input);
      lb.appendChild(el('span', null, v));
      g.appendChild(lb);
    });
    return g;
  }
  function picked(group) {
    return Array.prototype.filter.call(group.querySelectorAll('input'), function (i) { return i.checked; })
      .map(function (i) { return i.value; });
  }
  function targetBox(it) {
    var tg = el('div', 'adm-modal__target');
    tg.appendChild(el('span', 'adm-modal__target-label', '대상'));
    tg.appendChild(el('strong', null, it.id + ' · ' + it.title));
    return tg;
  }

  /* ---------- 처리 후 : 표를 다시 그리고 결과를 알린다 ---------- */
  var repaint = function () {};
  function done(api, msg) {
    if (api) { api.close(true); }
    repaint(true);
    UI.showToast(msg);
  }

  /* ---------- 심사 시작 : 누른 사람으로 자동 배정 ---------- */
  function doStart(id) {
    var it = findItem(id);
    if (!it || it.state !== 'wait') { UI.showToast('이미 다른 심사자가 시작한 건입니다. 목록을 새로 불러옵니다.'); repaint(true); return; }
    var at = stampNow();
    commit(id, { state: 'review', reviewer: ME, startedAt: at, progress: 0, hold: null }, '심사 시작 (심사자 자동 배정 : ' + ME + ')');
    done(null, it.id + ' 심사를 시작했습니다 · 영상 심사 중 탭에서 이어서 진행합니다.');
  }

  /* ---------- 심사 완료 : 승인 → 등급 심사 / 보완 요청 → 보완 대기 ---------- */
  function openComplete(id) {
    var it = findItem(id);
    var result, reasonSel, detail, due, fixBox, memo;
    openDialog({
      title: '심사 완료',
      desc: '영상 확인 결과를 입력합니다. 승인하면 등급 심사로, 보완 요청하면 보완 대기로 이동합니다.',
      submit: '심사 완료',
      build: function (api) {
        api.body.appendChild(targetBox(it));
        result = choiceGroup('rv-result', ['승인', '보완 요청']);
        api.body.appendChild(field('심사 결과', true, result));

        fixBox = el('div', 'rv-subform');
        fixBox.hidden = true;
        reasonSel = selectOf(FIX_REASONS, '보완 사유를 선택하세요');
        fixBox.appendChild(field('보완 사유', true, reasonSel));
        detail = textareaOf('수정이 필요한 구간·항목을 구체적으로 적어주세요 (제출자에게 그대로 전달됩니다)');
        fixBox.appendChild(field('요청 내용', true, detail));
        due = document.createElement('input');
        due.type = 'date';
        due.value = dayAfter(FIX_DUE_DAYS);
        due.min = dayAfter(0);
        fixBox.appendChild(field('제출 기한', true, due, '기본 ' + FIX_DUE_DAYS + '일 · 기한이 지나면 최종 차단 대상이 됩니다.'));
        api.body.appendChild(fixBox);

        memo = textareaOf('심사 의견 (선택)');
        var memoRow = field('심사 의견', false, memo, '처리 이력에 함께 기록됩니다.');
        api.body.appendChild(memoRow);

        result.addEventListener('change', function () {
          var isFix = picked(result)[0] === '보완 요청';
          fixBox.hidden = !isFix;
          memoRow.hidden = isFix;
          api.ok.className = 'adm-btn adm-btn--' + (isFix ? 'danger' : 'primary');
          api.ok.textContent = isFix ? '보완 요청' : '승인';
          api.error(null);
        });
      },
      onSubmit: function (api) {
        var r = picked(result)[0];
        if (!r) { api.error(['심사 결과(승인 또는 보완 요청)를 선택하세요.']); return; }
        if (r === '승인') {
          commit(id, { state: 'rating', progress: 100, approvedBy: ME, hold: null }, '영상 심사 승인' + (memo.value.trim() ? ' — ' + memo.value.trim() : ''));
          done(api, it.id + ' 승인 · 등급 심사로 이동했습니다.');
          return;
        }
        var miss = [];
        if (!reasonSel.value) { miss.push('보완 사유를 선택하세요.'); }
        if (!detail.value.trim()) { miss.push('요청 내용을 입력하세요.'); }
        if (!due.value) { miss.push('제출 기한을 지정하세요.'); }
        else if (due.value < dayAfter(0)) { miss.push('제출 기한은 오늘 이후로 지정하세요.'); }
        if (miss.length) { api.error(miss); return; }
        var reason = reasonSel.value + ' — ' + detail.value.trim();
        commit(id, {
          state: 'fix', progress: 100, hold: null,
          fix: { reason: reason, by: ME, at: stampNow(), due: due.value, renotified: 0 }
        }, '보완 요청 — ' + reason + ' (기한 ' + due.value + ')');
        done(api, it.id + ' 보완을 요청했습니다 · 제출자에게 알림을 보냈습니다.');
      }
    });
  }

  /* ---------- 심사 보류 / 재개 ---------- */
  function openHold(id) {
    var it = findItem(id);
    var reasonSel, detail;
    openDialog({
      title: '심사 보류',
      desc: '진행을 일시 중단합니다. 건은 영상 심사 중 탭에 보류 표시로 남고, 재개하면 이어서 심사합니다.',
      submit: '보류',
      kind: 'danger',
      build: function (api) {
        api.body.appendChild(targetBox(it));
        reasonSel = selectOf(HOLD_REASONS, '보류 사유를 선택하세요');
        api.body.appendChild(field('보류 사유', true, reasonSel));
        detail = textareaOf('보류 배경과 재개 조건을 남겨주세요');
        api.body.appendChild(field('상세 내용', false, detail, '처리 이력에 함께 기록됩니다.'));
      },
      onSubmit: function (api) {
        if (!reasonSel.value) { api.error(['보류 사유를 선택하세요.']); return; }
        var reason = reasonSel.value + (detail.value.trim() ? ' — ' + detail.value.trim() : '');
        commit(id, { hold: { reason: reason, at: stampNow() } }, '심사 보류 — ' + reason);
        done(api, it.id + ' 심사를 보류했습니다.');
      }
    });
  }
  function doResume(id) {
    var it = findItem(id);
    commit(id, { hold: null }, '심사 재개');
    done(null, it.id + ' 심사를 재개했습니다.');
  }

  /* ---------- 보완 대기 : 재알림 · 최종 차단 ---------- */
  function doNotify(id) {
    var it = findItem(id);
    var fix = Object.assign({}, it.fix, { renotified: (it.fix.renotified || 0) + 1 });
    commit(id, { fix: fix }, '보완 요청 내용 재알림 (' + fix.renotified + '회차)');
    done(null, it.creator + '에게 보완 요청 내용을 다시 알렸습니다.');
  }
  function openBlock(id) {
    var it = findItem(id);
    var reasonSel, detail, word;
    openDialog({
      title: '최종 차단',
      desc: '보완 대기 건을 더 이상 심사하지 않고 차단합니다. 고권한 행동으로 처리 이력에 남습니다.',
      submit: '최종 차단',
      kind: 'danger',
      build: function (api) {
        api.body.appendChild(targetBox(it));
        api.body.appendChild(el('p', 'adm-modal__note', '차단된 콘텐츠는 게시할 수 없고 탭 목록에서 빠집니다(전체 탭에서만 조회). 해제는 별도 정책과 권한으로 처리합니다.'));
        reasonSel = selectOf(BLOCK_REASONS, '차단 사유를 선택하세요');
        api.body.appendChild(field('차단 사유', true, reasonSel));
        detail = textareaOf('처리 배경과 근거를 남겨주세요');
        api.body.appendChild(field('상세 사유', false, detail));
        word = document.createElement('input');
        word.type = 'text';
        word.autocomplete = 'off';
        word.placeholder = it.id;
        api.body.appendChild(field('확인 입력', true, word, '대상 심사 ID(' + it.id + ')를 그대로 입력하세요.'));
      },
      onSubmit: function (api) {
        var miss = [];
        if (!reasonSel.value) { miss.push('차단 사유를 선택하세요.'); }
        if (word.value.trim() !== it.id) { miss.push('확인 입력란에 ' + it.id + ' 를 정확히 입력하세요.'); }
        if (miss.length) { api.error(miss); return; }
        var reason = reasonSel.value + (detail.value.trim() ? ' — ' + detail.value.trim() : '');
        commit(id, { state: 'blocked', blockReason: reason }, '최종 차단 — ' + reason);
        done(api, it.id + ' 최종 차단했습니다.');
      }
    });
  }

  /* ---------- 등급 확정 : 입력 → 확인 2단계 ---------- */
  function openRating(id) {
    var it = findItem(id);
    var grade, info, reason, form, step = 1;
    openDialog({
      title: '등급 확정',
      desc: '이용등급(단일)·내용정보(복수)·판정 사유를 입력합니다. 확정하면 게시 처리됩니다.',
      submit: '다음',
      wide: true,
      /* 확인 단계의 "이전" 은 닫지 않고 입력 단계로 되돌린다 */
      onCancel: function (api) {
        if (step !== 2) { return true; }
        step = 1;
        form.hidden = false;
        var sum = api.body.querySelector('.rv-summary');
        if (sum) { api.body.removeChild(sum); }
        api.cancel.textContent = '취소';
        api.ok.textContent = '다음';
        return false;
      },
      build: function (api) {
        form = el('div');
        form.appendChild(targetBox(it));
        grade = choiceGroup('rv-grade', GRADES);
        form.appendChild(field('이용등급', true, grade, '기본값 없이 하나를 직접 선택합니다.'));
        info = choiceGroup('rv-info', CONTENT_INFO, true);
        form.appendChild(field('내용정보', true, info, '해당하는 항목을 모두 선택합니다 (현재 시안은 해당 여부만 저장).'));
        reason = textareaOf('등급 판정 근거를 적어주세요');
        form.appendChild(field('판정 사유', true, reason));
        api.body.appendChild(form);
      },
      onSubmit: function (api) {
        var g = picked(grade)[0];
        var inf = picked(info);
        var rs = reason.value.trim();
        if (step === 1) {
          var miss = [];
          if (!g) { miss.push('이용등급을 선택하세요.'); }
          if (!inf.length) { miss.push('내용정보를 1개 이상 선택하세요.'); }
          if (!rs) { miss.push('판정 사유를 입력하세요.'); }
          if (miss.length) { api.error(miss); return; }
          api.error(null);
          step = 2;
          form.hidden = true;
          api.body.appendChild(ratingSummary(it, g, inf, rs));
          api.ok.textContent = '등급 확정';
          api.cancel.textContent = '이전';
          api.ok.focus();
          return;
        }
        var at = stampNow();
        var postId = 'P-' + (58200 + Math.floor(Math.random() * 700));
        commit(id, { rating: { grade: g, info: inf, reason: rs, by: ME, at: at } },
          '등급 확정 — ' + g + ' · ' + inf.join(', '));
        /* 게시 완료는 시스템이 게시 처리에 성공했을 때 진입한다.
           게시 방식(즉시 자동 게시 / 별도 게시 승인)은 기획 확정 사항 — 시안은 즉시 자동 게시 */
        systemLog(id, { state: 'done', publishedAt: at, postId: postId }, '게시 처리 완료 (' + postId + ')');
        done(api, it.id + ' 등급을 ' + g + '(으)로 확정하고 게시했습니다.');
      }
    });
  }
  function ratingSummary(it, g, inf, rs) {
    var box = el('div', 'rv-summary');
    box.appendChild(el('p', 'rv-summary__lead', '아래 내용으로 등급을 확정할까요? 확정 후 변경은 별도 권한이 필요합니다.'));
    var dl = el('dl', 'rv-summary__list');
    [['대상', it.id + ' · ' + it.title], ['이용등급', g], ['내용정보', inf.join(', ')], ['판정 사유', rs]].forEach(function (r) {
      var row = el('div');
      row.appendChild(el('dt', null, r[0]));
      row.appendChild(el('dd', null, r[1]));
      dl.appendChild(row);
    });
    box.appendChild(dl);
    return box;
  }

  /* ---------- 상세 보기 (조회 전용) ---------- */
  function detailSection(title, rows) {
    var sec = el('section', 'rv-detail__sec');
    sec.appendChild(el('h4', 'rv-detail__title', title));
    var dl = el('dl', 'rv-detail__list');
    rows.forEach(function (r) {
      var row = el('div');
      row.appendChild(el('dt', null, r[0]));
      var dd = el('dd');
      if (r[1] && r[1].nodeType) { dd.appendChild(r[1]); } else { dd.textContent = r[1] === undefined || r[1] === null || r[1] === '' ? '-' : r[1]; }
      row.appendChild(dd);
      dl.appendChild(row);
    });
    sec.appendChild(dl);
    return sec;
  }
  function autoList(it) {
    var ul = el('ul', 'rv-autolist');
    it.auto.items.forEach(function (x) {
      var li = el('li');
      li.appendChild(UI.badge(x.warn ? { b: '경고', t: 'warn' } : { b: '정상', t: 'ok' }));
      li.appendChild(el('span', null, x.name + (x.warn ? ' — ' + x.warn : '')));
      ul.appendChild(li);
    });
    return ul;
  }
  function historyList(it) {
    var sec = el('section', 'rv-detail__sec');
    sec.appendChild(el('h4', 'rv-detail__title', '처리 이력 (' + it.history.length + ')'));
    var ol = el('ol', 'rv-history');
    it.history.slice().reverse().forEach(function (h) {
      var li = el('li', 'rv-history__item' + (h.kind === 'system' ? ' is-system' : ''));
      var top = el('div', 'rv-history__top');
      top.appendChild(UI.badge(h.kind === 'system' ? { b: '시스템 자동', t: 'mute' } : { b: '사람 심사', t: 'brand' }));
      var flow = (h.from ? (STATE[h.from] || {}).label + ' → ' : '') + (STATE[h.to] || {}).label;
      top.appendChild(el('span', 'rv-history__flow', h.from === h.to ? (STATE[h.to] || {}).label + ' (상태 유지)' : flow));
      top.appendChild(el('span', 'rv-history__at', h.at + ' · ' + h.by));
      li.appendChild(top);
      if (h.reason) { li.appendChild(el('p', 'rv-history__reason', h.reason)); }
      ol.appendChild(li);
    });
    sec.appendChild(ol);
    return sec;
  }
  function openDetail(id, toHistory) {
    var it = findItem(id);
    openDialog({
      title: it.id + ' 심사 상세',
      desc: '조회 전용 화면입니다. 상태 변경은 해당 업무 탭에서 처리합니다.',
      cancelLabel: '닫기',
      wide: true,
      build: function (api) {
        var wrap = el('div', 'rv-detail');
        wrap.appendChild(detailSection('기본 정보', [
          ['콘텐츠', it.cid + ' · ' + it.title],
          ['제출자', it.creator],
          ['현재 상태', stateBadge(it)],
          ['상태 진입', it.enteredAt],
          ['구분', it.recheck ? '재심사 ' + it.recheck + '차 (' + it.version + ')' : '신규 (' + it.version + ')']
        ]));
        var autoSec = detailSection('시스템 자동 점검', [['수행 시각', it.auto.at], ['결과', autoBadge(it)]]);
        autoSec.appendChild(autoList(it));
        wrap.appendChild(autoSec);
        if (it.reviewer) {
          wrap.appendChild(detailSection('영상 심사', [
            ['심사자', it.reviewer],
            ['시작 시각', it.startedAt],
            ['영상 확인', progressCell(it)],
            ['보류', it.hold ? it.hold.reason + ' (' + it.hold.at + ')' : '없음'],
            ['승인', it.approvedBy ? it.approvedBy : '-']
          ]));
        }
        if (it.fix) {
          wrap.appendChild(detailSection('보완 요청', [
            ['보완 사유', it.fix.reason],
            ['요청자 · 시각', it.fix.by + ' · ' + it.fix.at],
            ['제출 기한', it.fix.due],
            ['재알림', it.fix.renotified ? it.fix.renotified + '회' : '없음']
          ].concat(it.blockReason ? [['최종 차단', it.blockReason]] : [])));
        }
        if (it.rating) {
          wrap.appendChild(detailSection('등급 심사 · 게시', [
            ['이용등급', it.rating.grade],
            ['내용정보', infoText(it.rating.info)],
            ['판정 사유', it.rating.reason],
            ['확정', it.rating.by + ' · ' + it.rating.at],
            ['게시', it.publishedAt ? it.publishedAt + ' · ' + it.postId : '-']
          ]));
        }
        var hist = historyList(it);
        wrap.appendChild(hist);
        api.body.appendChild(wrap);
        if (toHistory) {
          window.setTimeout(function () { hist.scrollIntoView({ block: 'start' }); }, 0);
        }
      }
    });
  }

  /* ---------- 화면 골격 : 탭 · 조회 조건 · 표 ---------- */
  function buildTabs(onPick) {
    var bar = el('div', 'rv-tabs');
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', '심사 상태');
    TABS.forEach(function (t) {
      var b = el('button', 'rv-tab' + (t.key === view.tab ? ' is-on' : ''));
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(t.key === view.tab));
      b.setAttribute('aria-controls', 'rv-panel');
      b.id = 'rv-tab-' + t.key;
      b.tabIndex = t.key === view.tab ? 0 : -1;
      b.appendChild(el('span', 'rv-tab__label', t.label));
      b.appendChild(el('span', 'rv-tab__count', String(countOf(t))));
      b.addEventListener('click', function () { onPick(t.key); });
      bar.appendChild(b);
    });
    /* 좌우 화살표로 탭 이동 (WAI-ARIA tabs) */
    bar.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') { return; }
      var idx = TABS.map(function (t) { return t.key; }).indexOf(view.tab);
      var next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
      e.preventDefault();
      onPick(TABS[next].key, true);
    });
    return bar;
  }
  function buildToolbar(onChange) {
    var bar = el('div', 'adm-filter rv-toolbar');
    var qItem = el('label', 'adm-filter__item');
    qItem.appendChild(el('span', null, '검색'));
    var q = document.createElement('input');
    q.type = 'search';
    q.placeholder = '심사 ID·콘텐츠·제출자 검색';
    q.value = view.q;
    q.addEventListener('input', function () { view.q = q.value; onChange('q'); });
    qItem.appendChild(q);
    bar.appendChild(qItem);

    if (view.tab === 'wait') {
      var kItem = el('label', 'adm-filter__item');
      kItem.appendChild(el('span', null, '구분'));
      var k = document.createElement('select');
      ['전체', '신규', '재심사'].forEach(function (v) {
        var op = document.createElement('option');
        op.textContent = v;
        if (v === view.kind) { op.selected = true; }
        k.appendChild(op);
      });
      k.addEventListener('change', function () { view.kind = k.value; onChange('kind'); });
      kItem.appendChild(k);
      bar.appendChild(kItem);
    }

    /* 시안 전용 : 권한별로 노출되는 행동을 확인한다. 실서비스는 로그인 관리자 권한으로 결정 */
    var rItem = el('label', 'adm-filter__item rv-toolbar__role');
    rItem.appendChild(el('span', null, '권한 미리보기 (시안)'));
    var r = document.createElement('select');
    ROLES.forEach(function (ro) {
      var op = document.createElement('option');
      op.value = ro.key;
      op.textContent = ro.label;
      if (ro.key === view.role) { op.selected = true; }
      r.appendChild(op);
    });
    r.addEventListener('change', function () { view.role = r.value; onChange('role'); });
    rItem.appendChild(r);
    bar.appendChild(rItem);
    return bar;
  }
  function buildTable(tab) {
    var card = el('div', 'adm-card');
    card.id = 'rv-panel';
    card.setAttribute('role', 'tabpanel');
    card.setAttribute('aria-labelledby', 'rv-tab-' + tab.key);
    card.tabIndex = -1;
    var rows = rowsOf(tab);
    var cols = COLUMNS[tab.key];

    var wrap = el('div', 'adm-table-wrap');
    var table = el('table', 'adm-table rv-table');
    var thead = document.createElement('thead');
    var trh = document.createElement('tr');
    ['심사 ID', '콘텐츠'].concat(cols.map(function (c) { return c[0]; }), ['관리']).forEach(function (h) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    rows.forEach(function (it) {
      var tr = document.createElement('tr');
      tr.className = 'is-clickable';
      tr.tabIndex = 0;
      tr.setAttribute('aria-label', it.id + ' 상세 보기');
      tr.appendChild(el('td', 'rv-id', it.id));
      var tdC = el('td');
      tdC.appendChild(contentCell(it));
      tr.appendChild(tdC);
      cols.forEach(function (c) {
        var td = el('td');
        var v = c[1](it);
        if (v && v.nodeType) { td.appendChild(v); } else { td.textContent = v === undefined || v === null ? '' : v; }
        tr.appendChild(td);
      });
      var tdA = el('td');
      tdA.appendChild(actionsCell(it, tab.key));
      tr.appendChild(tdA);
      tr.addEventListener('click', function () { openDetail(it.id); });
      tr.addEventListener('keydown', function (e) {
        if (e.target === tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDetail(it.id); }
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    card.appendChild(wrap);

    if (!rows.length) {
      card.appendChild(el('p', 'rv-empty', view.q ? '검색 조건에 맞는 건이 없습니다.' : tab.label + ' 상태인 건이 없습니다.'));
    }
    var foot = el('div', 'adm-paging');
    foot.appendChild(el('span', 'adm-paging__info', '총 ' + rows.length + '건'));
    card.appendChild(foot);
    return card;
  }

  /* 탭은 주소(#/content/review/<탭>)에 남겨 새로고침·공유해도 같은 탭이 열리게 한다.
     hashchange 가 다시 그리면서 스크롤이 튀지 않도록 replaceState 로 바꾼다. */
  function readTabFromHash() {
    var parts = (location.hash || '').replace(/^#\/?/, '').split('/');
    var key = parts[2];
    view.tab = key && TABS.some(function (t) { return t.key === key; }) ? key : 'all';
    if (view.tab !== 'wait') { view.kind = '전체'; }
  }
  function writeTabToHash(sec, s) {
    var h = '#/' + sec.key + '/' + s.id + (view.tab === 'all' ? '' : '/' + view.tab);
    if (location.hash !== h && window.history && window.history.replaceState) { window.history.replaceState(null, '', h); }
  }

  /* ---------- 진입점 : admin.js 의 custom 화면 렌더러 ---------- */
  function renderReview(ctx) {
    if (openApi) { openApi.close(true); }   /* 화면을 떠났다 돌아오면 남은 대화상자를 닫는다 */
    readTabFromHash();
    var root = el('div', 'rv');
    var tabsSlot = el('div');
    var toolSlot = el('div');
    var tableSlot = el('div');
    root.appendChild(tabsSlot);
    root.appendChild(toolSlot);
    root.appendChild(tableSlot);

    function pickTab(key, viaKey) {
      view.tab = key;
      if (key !== 'wait') { view.kind = '전체'; }
      writeTabToHash(ctx.sec, ctx.s);
      paintToolbar();   /* 구분 필터는 대기 탭에서만 있으므로 탭이 바뀔 때만 다시 만든다 */
      paint();
      var t = document.getElementById('rv-tab-' + key);
      if (t && viaKey) { t.focus(); }
    }
    /* 조회 조건은 입력 중에 다시 만들지 않는다 — 한글 조합 입력과 선택 상자 포커스가 유지된다 */
    function paintToolbar() {
      toolSlot.innerHTML = '';
      toolSlot.appendChild(buildToolbar(function () { paint(); }));
    }
    /* 탭(카운트)과 목록만 같은 조회 기준으로 다시 그린다 */
    function paint(focus) {
      tabsSlot.innerHTML = '';
      tabsSlot.appendChild(buildTabs(pickTab));
      tableSlot.innerHTML = '';
      tableSlot.appendChild(buildTable(tabOf(view.tab)));
      /* 좁은 화면에서 가로 스크롤되는 탭 줄 안에서 현재 탭이 보이게 한다 */
      window.setTimeout(function () {   /* 첫 렌더는 화면에 붙은 뒤에야 폭을 잴 수 있다 */
        var onTab = root.querySelector('.rv-tab.is-on');
        var tabBar = root.querySelector('.rv-tabs');
        if (onTab && tabBar && tabBar.scrollWidth > tabBar.clientWidth) {
          tabBar.scrollLeft = onTab.offsetLeft - tabBar.offsetLeft - (tabBar.clientWidth - onTab.offsetWidth) / 2;
        }
      }, 0);
      if (focus === true) {
        var cur = document.getElementById('rv-tab-' + view.tab);
        if (cur) { cur.focus(); }
      }
    }
    repaint = paint;
    paintToolbar();
    paint();
    return root;
  }

  window.ADMIN_SCREENS = window.ADMIN_SCREENS || {};
  window.ADMIN_SCREENS.review = renderReview;
})();
