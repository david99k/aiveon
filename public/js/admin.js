/* ============================================================
   VIBUZZ ADMIN (시너지온 관리자) — 화면 렌더러
   - 메뉴 구조 : SYNERGYON_ADMIN_메뉴화면설명서_V1.0 (대시보드 + 01~11)
   - 화면 데이터 : js/admin-data.js 의 window.ADMIN_DATA
   - 해시 라우팅 (#/섹션/화면) 기반 데모 · 실서비스 연동 시
     서버 라우팅/권한(메뉴 권한 관리 기준)으로 교체하는 지점
   ============================================================ */
(function () {
  'use strict';

  var DATA = window.ADMIN_DATA || { sections: [] };

  /* ---------- 공용 아이콘 (스트로크 라인) ---------- */
  var ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    chevron: '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4 21.5 20h-19L12 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="0.9" fill="currentColor"/></svg>',
    starOff: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3.8 2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.73-5.2 2.73 1-5.8-4.2-4.1 5.8-.85L12 3.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    starOn: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3.8 2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.73-5.2 2.73 1-5.8-4.2-4.1 5.8-.85L12 3.8Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
  };

  /* 1단계 메뉴 아이콘 (라인 스타일 · 업무 성격별로 실루엣을 다르게) */
  var SEC_ICONS = {
    /* 01 회원 관리 : 사람 둘 */
    member: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9.5" cy="8" r="3.3" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 19.5c0-2.9 2.7-5 6-5s6 2.1 6 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16 5.2a3.3 3.3 0 0 1 0 6.1M17.5 14.9c2 .7 3.4 2.4 3.4 4.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    /* 02 콘텐츠 관리 : 콘텐츠 자산 스택(작은 크기에서도 또렷하도록 필름스트립 대신 레이어) */
    content: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.4 21 8l-9 4.6L3 8l9-4.6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3.6 12.6 12 16.9l8.4-4.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.6 16.6 12 20.9l8.4-4.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    /* 03 크리에이터 관리 : 캠코더 */
    creator: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.8" y="7" width="13" height="10" rx="2.4" stroke="currentColor" stroke-width="1.7"/><path d="M15.8 11.2 21 8.6v6.8l-5.2-2.6" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="7.6" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/></svg>',
    /* 04 광고 관리 : 확성기 */
    ad: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4.5V5.5L8 10H5a1 1 0 0 0-1 1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M19 9.5a4 4 0 0 1 0 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8 15v4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    /* 05 정산 관리 : 지폐 */
    settle: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.8" y="6" width="18.4" height="12" rx="2.4" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.6"/><path d="M6 9.5v5M18 9.5v5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    /* 06 포인트 관리 : 코인 */
    point: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.4" stroke="currentColor" stroke-width="1.7"/><path d="M10.2 16V8.4h2.6a2.4 2.4 0 0 1 0 4.8h-2.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    /* 07 신고 관리 : 깃발 */
    report: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 21V4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M6 4.6h10.6l-2 3.7 2 3.7H6" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    /* 08 운영 관리 : 공지 말풍선 */
    ops: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-5 3.5V6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 8.8h8M8 12.2h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    /* 09 통계·리포트 : 막대 차트 */
    stats: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M7 20v-5.5M12 20V7M17 20v-8.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    /* 10 시스템 관리 : 설정 슬라이더(톱니는 18px에서 태양처럼 뭉개져 대체) */
    system: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 8.4h16.8M3.5 15.6h16.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="9" cy="8.4" r="2.5" stroke="currentColor" stroke-width="1.7"/><circle cx="15" cy="15.6" r="2.5" stroke="currentColor" stroke-width="1.7"/></svg>',
    /* 11 인공지능·시스템 운영 : 프로세서 */
    ai: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="2.2" stroke="currentColor" stroke-width="1.7"/><rect x="10" y="10" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 3.4v3.1M14.5 3.4v3.1M9.5 17.5v3.1M14.5 17.5v3.1M20.6 9.5h-3.1M20.6 14.5h-3.1M6.5 9.5H3.4M6.5 14.5H3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
  };

  /* ---------- DOM 헬퍼 (텍스트는 항상 textContent 로 삽입) ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined && text !== null) { n.textContent = String(text); }
    return n;
  }
  function svgNode(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstChild;
  }

  /* ---------- 라우팅 ---------- */
  function parseHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    if (!h || h === 'dashboard') { return { sec: 'dashboard', id: null }; }
    var parts = h.split('/');
    return { sec: parts[0], id: parts[1] || null };
  }
  function findSection(key) {
    for (var i = 0; i < DATA.sections.length; i++) {
      if (DATA.sections[i].key === key) { return DATA.sections[i]; }
    }
    return null;
  }
  function findScreen(sec, id) {
    if (!sec) { return null; }
    for (var i = 0; i < sec.screens.length; i++) {
      if (sec.screens[i].id === id) { return sec.screens[i]; }
    }
    return sec.screens[0] || null;
  }

  /* ---------- 활성 메뉴 판정 ----------
     목록에서만 진입하는 화면(회원 상세 등)은 메뉴에 없으므로 그 섹션의 첫 메뉴를 활성으로 본다. */
  function activeIdOf(sec, route) {
    if (route.sec !== sec.key) { return null; }
    var hiddenNow = sec.screens.some(function (s) { return s.id === route.id && s.hideInNav; });
    if (!hiddenNow) { return route.id; }
    return (sec.screens.filter(function (s) { return !s.hideInNav; })[0] || {}).id;
  }

  /* ---------- 상단 1차 메뉴 + 드롭다운 2차 ---------- */
  var gnbItems = [];
  function closeGnb(except) {
    gnbItems.forEach(function (it) {
      if (it.wrap === except) { return; }
      it.wrap.classList.remove('is-open');
      it.btn.setAttribute('aria-expanded', 'false');
    });
  }
  function renderTopNav(route) {
    var nav = document.querySelector('.adm-gnb');
    if (!nav) { return; }
    nav.innerHTML = '';
    gnbItems = [];

    DATA.sections.forEach(function (sec) {
      var activeId = activeIdOf(sec, route);
      var wrap = el('div', 'adm-gnb__item' + (activeId ? ' is-current' : ''));

      /* 상단 메뉴는 11개가 한 줄에 들어가야 해서 아이콘 없이 라벨만 둔다(아이콘은 좌측 전체 메뉴에 있음).
         내용이 링크 목록뿐이라 role="menu"(화살표 키 모델) 대신 디스클로저 패턴으로 둔다 — Tab 이동이 그대로 유효하다. */
      var btn = el('button', 'adm-gnb__btn');
      btn.type = 'button';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'adm-gnb-menu-' + sec.key);
      btn.appendChild(el('span', 'adm-gnb__label', sec.title));
      var chev = svgNode(ICONS.chevron);
      chev.setAttribute('class', 'adm-gnb__chevron');
      btn.appendChild(chev);
      wrap.appendChild(btn);

      var menu = el('div', 'adm-gnb__menu');
      menu.id = 'adm-gnb-menu-' + sec.key;
      var visible = sec.screens.filter(function (s) { return !s.hideInNav; });
      /* 항목이 많은 섹션은 2열로 펼쳐 세로로 길어지지 않게 한다 */
      if (visible.length > 9) { menu.classList.add('adm-gnb__menu--wide'); }
      visible.forEach(function (s) {
        var a = el('a', 'adm-gnb__link');
        a.href = '#/' + sec.key + '/' + s.id;
        /* 3단계 표시는 메뉴에선 생략한다(대부분의 항목에 붙어 변별력이 없다). 화면 제목에만 남긴다. */
        a.appendChild(document.createTextNode(s.title));
        if (s.id === activeId) {
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'page');
        }
        a.addEventListener('click', function () { closeGnb(null); });
        menu.appendChild(a);
      });
      wrap.appendChild(menu);

      var entry = { wrap: wrap, btn: btn, open: function (on) { setOpen(on); } };
      gnbItems.push(entry);

      function setOpen(on) {
        wrap.classList.toggle('is-open', on);
        btn.setAttribute('aria-expanded', String(on));
      }
      /* hover 로 이미 열린 걸 클릭이 곧바로 닫아버리지 않도록 열린 경로를 구분한다 */
      var hoverOpened = false;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var on = hoverOpened || !wrap.classList.contains('is-open');
        hoverOpened = false;
        closeGnb(null);
        setOpen(on);
      });
      /* 마우스에서만 hover 로 열린다. 터치의 합성 마우스 이벤트를 배제하려고 pointer:fine 까지 본다 */
      function hoverable() { return window.matchMedia('(hover: hover) and (pointer: fine)').matches; }
      wrap.addEventListener('mouseenter', function () {
        if (!hoverable()) { return; }
        closeGnb(wrap);
        hoverOpened = !wrap.classList.contains('is-open');
        setOpen(true);
      });
      wrap.addEventListener('mouseleave', function () {
        if (!hoverable()) { return; }
        /* 키보드로 메뉴 안에 들어가 있으면 마우스가 지나가도 닫지 않는다(포커스 유실 방지) */
        if (wrap.contains(document.activeElement)) { return; }
        hoverOpened = false;
        setOpen(false);
      });

      nav.appendChild(wrap);
    });
    fitTopNav();
  }

  /* 상단 메뉴가 한 줄에 다 들어가는지 실측한다.
     라벨 길이·글꼴·확대 배율에 좌우되지 않도록 미디어쿼리 대신 측정으로 판단하고,
     바로 접지 말고 먼저 여백을 줄여(gnb-tight) 본 뒤에도 넘칠 때만 좌측 전체 메뉴로 넘긴다. */
  function fitTopNav() {
    var nav = document.querySelector('.adm-gnb');
    var adm = document.querySelector('.adm');
    if (!nav || !adm) { return; }
    function fits() {
      var needed = 0;
      Array.prototype.forEach.call(nav.children, function (c) { needed += c.offsetWidth; });
      return needed <= nav.getBoundingClientRect().width + 1;
    }
    adm.classList.remove('gnb-collapsed', 'gnb-tight');
    if (fits()) { return; }
    adm.classList.add('gnb-tight');       /* 관리자 정보 숨김 + 메뉴 여백 축소 */
    if (fits()) { return; }
    adm.classList.add('gnb-collapsed');
  }

  /* ---------- 즐겨찾기 ----------
     localStorage 에 {sec, id} 목록을 저장한다. 실서비스에서는 관리자 계정별 설정 API 로 교체. */
  var FAV_KEY = 'vibuzz-adm-favs';
  /* 저장값은 사용자가 직접 건드릴 수 있으므로 읽을 때마다 형태를 검증한다.
     항목이 깨져 있어도 화면 전체가 죽지 않아야 한다. */
  function readFavs() {
    var arr;
    try {
      var raw = localStorage.getItem(FAV_KEY);
      arr = raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
    if (Object.prototype.toString.call(arr) !== '[object Array]') { return []; }
    var seen = {};
    var out = [];
    arr.forEach(function (f) {
      if (!f || typeof f !== 'object') { return; }
      if (typeof f.sec !== 'string' || typeof f.id !== 'string') { return; }
      var k = f.sec + '/' + f.id;
      if (seen[k]) { return; }        /* 중복 항목 제거 */
      seen[k] = true;
      out.push({ sec: f.sec, id: f.id });
    });
    return out;
  }
  function writeFavs(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) { /* 프라이빗 모드 - 무시 */ }
  }
  function favIndex(list, secKey, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].sec === secKey && list[i].id === id) { return i; }
    }
    return -1;
  }
  function isFav(secKey, id) { return favIndex(readFavs(), secKey, id) >= 0; }
  function toggleFav(secKey, id) {
    var list = readFavs();
    var i = favIndex(list, secKey, id);
    if (i >= 0) { list.splice(i, 1); } else { list.push({ sec: secKey, id: id }); }
    writeFavs(list);
    renderSidePanel(parseHash());
    return i < 0;
  }

  /* ---------- 좌측 패널 : 대시보드 · 즐겨찾기 · 전체 메뉴(모바일) ---------- */
  function renderSidePanel(route) {
    var nav = document.querySelector('.adm-side__nav');
    if (!nav) { return; }
    nav.innerHTML = '';

    var home = el('a', 'adm-side__home' + (route.sec === 'dashboard' ? ' is-active' : ''));
    home.href = '#/dashboard';
    home.appendChild(svgNode(ICONS.home));
    home.appendChild(document.createTextNode('대시보드'));
    if (route.sec === 'dashboard') { home.setAttribute('aria-current', 'page'); }
    nav.appendChild(home);

    /* 즐겨찾기 */
    var favBox = el('section', 'adm-fav');
    var favHead = el('p', 'adm-fav__head');
    favHead.appendChild(svgNode(ICONS.starOn));
    favHead.appendChild(el('span', null, '즐겨찾는 메뉴'));
    var favs = readFavs();
    var resolved = favs.map(function (f) {
      var sec = findSection(f.sec);
      if (!sec) { return null; }
      var s = null;
      for (var i = 0; i < sec.screens.length; i++) { if (sec.screens[i].id === f.id) { s = sec.screens[i]; } }
      return s ? { sec: sec, s: s } : null;
    }).filter(Boolean);
    favHead.appendChild(el('span', 'adm-fav__count', String(resolved.length)));
    favBox.appendChild(favHead);

    if (!resolved.length) {
      favBox.appendChild(el('p', 'adm-fav__empty', '각 화면 우측 상단의 ☆ 버튼을 누르면 여기에 추가됩니다.'));
    } else {
      var list = el('div', 'adm-fav__list');
      resolved.forEach(function (h, idx) {
        var row = el('div', 'adm-fav__row');
        var a = el('a', 'adm-fav__link');
        a.href = '#/' + h.sec.key + '/' + h.s.id;
        /* 상위 메뉴명은 목록에 노출하지 않는다(툴팁으로만 확인) */
        a.title = h.sec.title + ' › ' + h.s.title;
        a.appendChild(el('span', 'adm-fav__name', h.s.title));
        if (route.sec === h.sec.key && activeIdOf(h.sec, route) === h.s.id) {
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'page');
        }
        var del = el('button', 'adm-fav__del');
        del.type = 'button';
        del.setAttribute('aria-label', h.s.title + ' 즐겨찾기 해제');
        del.innerHTML = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
        del.addEventListener('click', function () {
          toggleFav(h.sec.key, h.s.id);   /* 목록이 다시 그려지므로 이 버튼은 사라진다 */
          syncFavBtn();
          showToast('즐겨찾기에서 제외했습니다 · ' + h.s.title);
          /* 사라진 버튼 대신 같은 자리(없으면 마지막 · 그것도 없으면 안내문)로 포커스를 옮긴다 */
          var next = document.querySelectorAll('.adm-fav__del');
          var to = next[idx] || next[next.length - 1] || document.querySelector('.adm-fav__empty');
          if (to) { if (to.tabIndex < 0 && to.className === 'adm-fav__empty') { to.tabIndex = -1; } to.focus(); }
        });
        row.appendChild(a);
        row.appendChild(del);
        list.appendChild(row);
      });
      favBox.appendChild(list);
    }
    nav.appendChild(favBox);

    /* 전체 메뉴 아코디언 : 상단 메뉴가 접히는 좁은 화면에서만 노출 */
    var all = el('section', 'adm-side__all');
    all.appendChild(el('p', 'adm-side__all-head', '전체 메뉴'));
    DATA.sections.forEach(function (sec) {
      var activeId = activeIdOf(sec, route);
      var g = el('div', 'adm-side__group' + (activeId ? ' is-open has-active' : ''));
      var head = el('button', 'adm-side__group-head');
      head.type = 'button';
      head.setAttribute('aria-expanded', activeId ? 'true' : 'false');
      var secIco = el('span', 'adm-side__group-icon');
      secIco.setAttribute('aria-hidden', 'true');
      if (SEC_ICONS[sec.key]) { secIco.appendChild(svgNode(SEC_ICONS[sec.key])); }
      head.appendChild(secIco);
      head.appendChild(el('span', 'adm-side__group-title', sec.title));
      var chev = svgNode(ICONS.chevron);
      chev.setAttribute('class', 'adm-side__group-chevron');
      head.appendChild(chev);
      head.addEventListener('click', function () {
        var open = g.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      g.appendChild(head);

      var sub = el('div', 'adm-side__sub');
      sec.screens.forEach(function (s) {
        if (s.hideInNav) { return; }
        var a = el('a');
        a.href = '#/' + sec.key + '/' + s.id;
        a.appendChild(document.createTextNode(s.title));
        if (s.id === activeId) {
          a.className = 'is-active';
          a.setAttribute('aria-current', 'page');
        }
        sub.appendChild(a);
      });
      g.appendChild(sub);
      all.appendChild(g);
    });
    nav.appendChild(all);
  }

  /* ---------- 배지 ---------- */
  function badge(cell) {
    var b = el('span', 'adm-badge adm-badge--' + (cell.t || 'mute'), cell.b);
    return b;
  }

  /* ---------- 차트 (인라인 SVG · 외부 라이브러리 없음) ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  var gradSeq = 0;
  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) { n.setAttribute(k, attrs[k]); }
    return n;
  }
  function sparkline(points, color, w, h) {
    w = w || 84; h = h || 30;
    var max = Math.max.apply(null, points), min = Math.min.apply(null, points);
    var span = (max - min) || 1;
    var step = w / (points.length - 1);
    var d = points.map(function (p, i) {
      return (i ? 'L' : 'M') + (i * step).toFixed(1) + ' ' + (h - 3 - ((p - min) / span) * (h - 6)).toFixed(1);
    }).join(' ');
    var svg = svgEl('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, 'aria-hidden': 'true' });
    var sp = svgEl('path', { d: d, fill: 'none', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    sp.style.stroke = color; /* var() 지원을 위해 style 로 지정 (테마 전환 시 자동 반영) */
    sp.style.opacity = '0.85';
    svg.appendChild(sp);
    return svg;
  }
  /* 차트 좌표계 (viewBox 기준). SVG 는 width:100% 로 늘어나므로
     축 라벨을 <text> 로 그리면 글자도 같이 확대된다(약 2배).
     → 라벨은 SVG 밖 HTML 로 뽑아 CSS px 크기를 고정하고, x 위치만 % 로 맞춘다. */
  var CH_W = 720, CH_H = 200, CH_PAD = { l: 8, r: 8, t: 14, b: 10 };

  /* 표시할 라벨 인덱스 선별 : 첫·마지막은 항상 포함, 중간은 균등 간격으로 솎아낸다. */
  function chartTicks(n, maxTicks) {
    var out = [], i;
    if (n <= 1) { return n ? [0] : out; }
    var every = Math.ceil((n - 1) / ((maxTicks || 14) - 1));
    for (i = 0; i < n - 1; i += every) { out.push(i); }
    /* 마지막 라벨(오늘·현재 등)은 의미가 있으므로 반드시 노출 — 너무 붙으면 직전 것을 뺀다. */
    if (out.length && (n - 1) - out[out.length - 1] < every * 0.6) { out.pop(); }
    out.push(n - 1);
    return out;
  }

  function chartAxis(chart, xAt) {
    var axis = el('div', 'adm-chart-axis');
    var n = chart.labels.length;
    var ticks = chartTicks(n, chart.maxTicks);
    ticks.forEach(function (i) {
      var t = el('span', 'adm-chart-axis__tick', chart.labels[i]);
      t.style.left = (xAt(i, n) / CH_W * 100).toFixed(3) + '%';
      axis.appendChild(t);
    });
    return axis;
  }

  /* 차트 본체 + 축 라벨을 묶은 렌더 단위 */
  function chartFigure(chart) {
    var fig = el('div', 'adm-chart');
    var isBar = chart.kind === 'bar';
    fig.appendChild(isBar ? barChart(chart) : areaChart(chart));
    if (chart.labels && chart.labels.length) {
      var iw = CH_W - CH_PAD.l - CH_PAD.r;
      fig.appendChild(chartAxis(chart, isBar
        ? function (i, n) { return CH_PAD.l + (iw / n) * (i + 0.5); }
        : function (i, n) { return n > 1 ? CH_PAD.l + (iw / (n - 1)) * i : CH_PAD.l + iw / 2; }
      ));
    }
    return fig;
  }

  function areaChart(chart) {
    var w = CH_W, h = CH_H, padL = CH_PAD.l, padR = CH_PAD.r, padT = CH_PAD.t, padB = CH_PAD.b;
    var pts = chart.points;
    var max = Math.max.apply(null, pts), min = Math.min.apply(null, pts);
    var span = (max - min) || 1;
    var iw = w - padL - padR, ih = h - padT - padB;
    var step = iw / (pts.length - 1);
    var xy = pts.map(function (p, i) {
      return [padL + i * step, padT + ih - ((p - min) / span) * ih];
    });
    var line = xy.map(function (c, i) { return (i ? 'L' : 'M') + c[0].toFixed(1) + ' ' + c[1].toFixed(1); }).join(' ');
    var gid = 'admgrad' + (gradSeq++);
    var svg = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, class: 'adm-chart-svg', role: 'img' });
    var defs = svgEl('defs', {});
    var grad = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
    var s1 = svgEl('stop', { offset: '0%' }); s1.style.stopColor = '#a78bfa'; s1.style.stopOpacity = 0.32;
    var s2 = svgEl('stop', { offset: '100%' }); s2.style.stopColor = '#a78bfa'; s2.style.stopOpacity = 0;
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad); svg.appendChild(defs);
    /* 가로 그리드 3줄 */
    for (var gI = 1; gI <= 3; gI++) {
      var gy = padT + (ih / 4) * gI;
      svg.appendChild(svgEl('line', { x1: padL, y1: gy, x2: w - padR, y2: gy, stroke: 'rgba(255,255,255,0.06)', 'stroke-width': 1 }));
    }
    svg.appendChild(svgEl('path', { d: line + ' L' + (padL + iw).toFixed(1) + ' ' + (padT + ih) + ' L' + padL + ' ' + (padT + ih) + ' Z', fill: 'url(#' + gid + ')' }));
    svg.appendChild(svgEl('path', { d: line, fill: 'none', stroke: '#a78bfa', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    var last = xy[xy.length - 1];
    svg.appendChild(svgEl('circle', { cx: last[0], cy: last[1], r: 3.4, fill: '#a78bfa' }));
    return svg;
  }
  function barChart(chart) {
    var w = CH_W, h = CH_H, padL = CH_PAD.l, padR = CH_PAD.r, padT = CH_PAD.t, padB = CH_PAD.b;
    var pts = chart.points;
    var max = Math.max.apply(null, pts) || 1;
    var iw = w - padL - padR, ih = h - padT - padB;
    var slot = iw / pts.length;
    var bw = Math.min(26, slot * 0.55);
    var svg = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, class: 'adm-chart-svg', role: 'img' });
    for (var gI = 1; gI <= 3; gI++) {
      var gy = padT + (ih / 4) * gI;
      svg.appendChild(svgEl('line', { x1: padL, y1: gy, x2: w - padR, y2: gy, stroke: 'rgba(255,255,255,0.06)', 'stroke-width': 1 }));
    }
    pts.forEach(function (p, i) {
      var bh = Math.max(2, (p / max) * ih);
      var x = padL + i * slot + (slot - bw) / 2;
      svg.appendChild(svgEl('rect', { x: x.toFixed(1), y: (padT + ih - bh).toFixed(1), width: bw.toFixed(1), height: bh.toFixed(1), rx: 4, fill: i === pts.length - 1 ? '#a78bfa' : 'rgba(167,139,250,0.42)' }));
    });
    return svg;
  }

  /* ---------- 토스트 ---------- */
  var TOAST_OK = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8 12.3 2.6 2.6L16 9.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function showToast(msg) {
    var wrap = document.querySelector('.adm-toast-wrap');
    if (!wrap) {
      wrap = el('div', 'adm-toast-wrap');
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(wrap);
    }
    var t = el('div', 'adm-toast');
    t.appendChild(svgNode(TOAST_OK));
    t.appendChild(el('span', null, msg));
    wrap.appendChild(t);
    window.setTimeout(function () { t.classList.add('is-out'); }, 4200);
    window.setTimeout(function () { if (t.parentNode) { t.parentNode.removeChild(t); } }, 4600);
  }

  /* ---------- 확인 모달 ----------
     되돌릴 수 없는 조치(강제 탈퇴 등) 전용. 사유 선택 · 고지 동의 · 대상 식별자 재입력을
     모두 통과해야 실행 버튼이 열린다. 실제 처리 API 는 onSubmit 지점에서 연동한다. */
  function confirmRow(labelText, req, node, hint) {
    var row = el('div', 'adm-modal__row');
    var lb = el('label', 'adm-modal__label', labelText);
    if (req) { lb.appendChild(el('span', 'req', '*')); }
    row.appendChild(lb);
    var field = el('div', 'adm-modal__field');
    field.appendChild(node);
    if (hint) { field.appendChild(el('p', 'adm-form__hint', hint)); }
    row.appendChild(field);
    return row;
  }
  function openConfirm(cfg, sec, trigger) {
    var prev = document.activeElement;
    var back = el('div', 'adm-modal');
    var dim = el('div', 'adm-modal__dim');
    var panel = el('div', 'adm-modal__panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');

    /* 헤더 */
    var head = el('div', 'adm-modal__head');
    var ic = el('span', 'adm-modal__icon');
    ic.appendChild(svgNode(ICONS.warn));
    head.appendChild(ic);
    var htext = el('div');
    var h = el('h3', 'adm-modal__title', cfg.title || '확인');
    h.id = 'adm-modal-title';
    panel.setAttribute('aria-labelledby', h.id);
    htext.appendChild(h);
    if (cfg.desc) { htext.appendChild(el('p', 'adm-modal__desc', cfg.desc)); }
    head.appendChild(htext);
    panel.appendChild(head);

    var body = el('div', 'adm-modal__body');
    if (cfg.target) {
      var tg = el('div', 'adm-modal__target');
      tg.appendChild(el('span', 'adm-modal__target-label', '대상'));
      tg.appendChild(el('strong', null, cfg.target));
      body.appendChild(tg);
    }
    if (cfg.note) { body.appendChild(el('p', 'adm-modal__note', cfg.note)); }

    /* 사유 */
    var reason = null;
    if (cfg.reasons && cfg.reasons.length) {
      reason = document.createElement('select');
      var ph = document.createElement('option');
      ph.value = ''; ph.textContent = '사유를 선택하세요';
      reason.appendChild(ph);
      cfg.reasons.forEach(function (r) {
        var op = document.createElement('option');
        op.value = r; op.textContent = r;
        reason.appendChild(op);
      });
      body.appendChild(confirmRow(cfg.reasonLabel || '처리 사유', true, reason));
    }

    /* 상세 사유 */
    var detail = document.createElement('textarea');
    detail.rows = 3;
    detail.placeholder = '처리 배경과 근거를 남겨주세요';
    body.appendChild(confirmRow(cfg.detailLabel || '상세 사유', false, detail, cfg.detailHint));

    /* 고지 동의 */
    var agreeBox = null;
    if (cfg.agree) {
      var al = el('label', 'adm-modal__agree');
      agreeBox = document.createElement('input');
      agreeBox.type = 'checkbox';
      al.appendChild(agreeBox);
      al.appendChild(el('span', null, cfg.agree));
      body.appendChild(al);
    }

    /* 대상 식별자 재입력 */
    var word = null;
    if (cfg.word) {
      word = document.createElement('input');
      word.type = 'text';
      word.autocomplete = 'off';
      word.placeholder = cfg.word;
      body.appendChild(confirmRow(cfg.wordLabel || '확인 입력', true, word, cfg.wordHint));
    }

    panel.appendChild(body);

    /* 푸터 */
    var foot = el('div', 'adm-modal__foot');
    var cancel = el('button', 'adm-btn adm-btn--ghost', '취소');
    cancel.type = 'button';
    var ok = el('button', 'adm-btn adm-btn--danger', cfg.submit || '실행');
    ok.type = 'button';
    ok.disabled = true;
    foot.appendChild(cancel);
    foot.appendChild(ok);
    panel.appendChild(foot);

    function sync() {
      var pass = true;
      if (reason && !reason.value) { pass = false; }
      if (agreeBox && !agreeBox.checked) { pass = false; }
      if (word && word.value.trim() !== cfg.word) { pass = false; }
      ok.disabled = !pass;
    }
    if (reason) { reason.addEventListener('change', sync); }
    if (agreeBox) { agreeBox.addEventListener('change', sync); }
    if (word) { word.addEventListener('input', sync); }

    function close() {
      document.removeEventListener('keydown', onKey);
      if (back.parentNode) { back.parentNode.removeChild(back); }
      document.body.classList.remove('adm-modal-open');
      var focusBack = trigger || prev;
      if (focusBack && focusBack.focus) { focusBack.focus(); }
    }
    function onKey(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') { return; }
      /* 포커스를 모달 안에 가둔다. 비활성(disabled) 실행 버튼이 마지막으로 잡히면 트랩이 새므로 제외한다. */
      var f = panel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]');
      if (!f.length) { return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    cancel.addEventListener('click', close);
    dim.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    ok.addEventListener('click', function () {
      if (ok.disabled) { return; }
      /* 실서비스 연동 지점 : 여기서 처리 API 를 호출하고 응답 후 화면을 갱신한다. */
      close();
      showToast(cfg.done || '처리되었습니다.');
      if (cfg.goto && sec) { location.hash = '#/' + sec.key + '/' + cfg.goto; }
    });

    back.appendChild(dim);
    back.appendChild(panel);
    document.body.appendChild(back);
    document.body.classList.add('adm-modal-open');
    sync();
    (reason || detail).focus();
  }

  /* ---------- 표 선택 상태 ----------
     표(buildTable)와 페이지 헤더 버튼(buildPageHead)이 서로 다른 시점에 만들어지므로
     선택 결과를 여기에 모아두고 구독자에게 알린다. 화면을 새로 그릴 때마다 초기화한다. */
  var selIds = [];
  var selSubs = [];
  function resetSelection() { selIds = []; selSubs = []; }
  function setSelection(ids) {
    selIds = ids;
    selSubs.forEach(function (fn) { fn(ids); });
  }
  function onSelection(fn) { selSubs.push(fn); fn(selIds); }

  /* ---------- 화면 구성 요소 ---------- */
  function buildPageHead(sec, s) {
    var head = el('div', 'adm-page-head');
    var text = el('div', 'adm-page-head__text');
    var title = el('h2', 'adm-page-head__title', s.title);
    if (s.depth3) { title.appendChild(el('span', 'adm-page-head__depth', '3단계 화면')); }
    text.appendChild(title);
    text.appendChild(el('p', 'adm-page-head__desc', s.desc));
    head.appendChild(text);

    var acts = el('div', 'adm-page-head__actions');
    /* 즐겨찾기 : 좌측 패널의 "즐겨찾는 메뉴" 와 연결된다. 메뉴에 없는 화면(상세 등)은 제외 */
    if (sec && s.id && !s.hideInNav) {
      var fav = el('button', 'adm-fav-btn');
      fav.type = 'button';
      fav.setAttribute('data-fav-sec', sec.key);
      fav.setAttribute('data-fav-id', s.id);
      acts.appendChild(fav);
      paintFavBtn(fav);
      fav.addEventListener('click', function () {
        var added = toggleFav(sec.key, s.id);
        paintFavBtn(fav);
        showToast(added ? '즐겨찾기에 추가했습니다 · ' + s.title : '즐겨찾기에서 제외했습니다 · ' + s.title);
      });
    }

    if (s.headActions && s.headActions.length) {
      s.headActions.forEach(function (a, i) {
        /* 문자열이면 기존대로(첫 번째 primary), 객체면 kind/goto 를 지정할 수 있다.
           kind : primary | ghost | danger,  goto : 같은 섹션 안 이동할 화면 id */
        var label = (typeof a === 'string') ? a : a.label;
        var kind = (typeof a === 'string') ? (i === 0 ? 'primary' : 'ghost') : (a.kind || 'ghost');
        var b = el('button', 'adm-btn adm-btn--' + kind, label);
        b.type = 'button';

        /* 선택한 행에만 적용되는 일괄 처리 : 선택 전에는 눌리지 않고, 선택 수를 라벨에 붙인다 */
        if (a && a.needsSelection) {
          onSelection(function (ids) {
            b.disabled = !ids.length;
            b.textContent = ids.length ? label + ' (' + ids.length + ')' : label;
          });
        }

        if (a && a.confirm) {
          b.addEventListener('click', function () {
            if (b.disabled) { return; }
            var cfg = a.confirm;
            if (a.needsSelection) {
              /* 대상 문구를 선택 결과로 채운다 */
              var head = selIds.slice(0, 3).join(', ');
              cfg = {};
              Object.keys(a.confirm).forEach(function (k) { cfg[k] = a.confirm[k]; });
              cfg.target = selIds.length + '명 · ' + head + (selIds.length > 3 ? ' 외 ' + (selIds.length - 3) + '명' : '');
              cfg.done = (a.confirm.done || '처리되었습니다.').replace('{n}', String(selIds.length));
            }
            openConfirm(cfg, sec, b);
          });
        } else if (a && a.goto && sec) {
          b.addEventListener('click', function () { location.hash = '#/' + sec.key + '/' + a.goto; });
        } else if (a && a.toast) {
          /* 확인이 필요 없는 동작(내보내기·재계산 등) : 실행 후 결과만 알린다 */
          b.addEventListener('click', function () {
            if (b.disabled) { return; }
            var msg = a.toast;
            if (a.needsSelection) { msg = msg.replace('{n}', String(selIds.length)); }
            showToast(msg);
          });
        }
        acts.appendChild(b);
      });
    }
    if (acts.childNodes.length) { head.appendChild(acts); }
    return head;
  }
  /* 즐겨찾기 버튼 표시 갱신 (아이콘 · 라벨 · 상태) */
  function paintFavBtn(btn) {
    var on = isFav(btn.getAttribute('data-fav-sec'), btn.getAttribute('data-fav-id'));
    btn.innerHTML = on ? ICONS.starOn : ICONS.starOff;
    btn.appendChild(el('span', null, on ? '즐겨찾기 해제' : '즐겨찾기'));
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
  }
  /* 좌측 패널에서 해제했을 때 본문 버튼도 같이 되돌린다 */
  function syncFavBtn() {
    var btn = document.querySelector('.adm-fav-btn');
    if (btn) { paintFavBtn(btn); }
  }
  function buildNote(textStr) {
    var n = el('div', 'adm-note');
    n.appendChild(svgNode(ICONS.warn));
    n.appendChild(el('span', null, textStr));
    return n;
  }
  function buildFilters(filters) {
    var bar = el('div', 'adm-filter');
    filters.forEach(function (f) {
      var item = el('label', 'adm-filter__item');
      item.appendChild(el('span', null, f.label));
      if (f.type === 'select') {
        var sel = document.createElement('select');
        (f.options || ['전체']).forEach(function (o) {
          var op = document.createElement('option');
          op.textContent = o;
          sel.appendChild(op);
        });
        item.appendChild(sel);
      } else if (f.type === 'date') {
        var di = document.createElement('input');
        di.type = 'date';
        item.appendChild(di);
      } else {
        var si = document.createElement('input');
        si.type = 'search';
        si.placeholder = f.ph || '검색어 입력';
        item.appendChild(si);
      }
      bar.appendChild(item);
    });
    var submit = el('div', 'adm-filter__submit');
    var q = el('button', 'adm-btn adm-btn--primary', '조회'); q.type = 'button';
    var r = el('button', 'adm-btn adm-btn--ghost', '초기화'); r.type = 'button';
    submit.appendChild(q); submit.appendChild(r);
    bar.appendChild(submit);
    return bar;
  }
  function buildTable(s, sec) {
    /* 행 클릭 → 상세 이동.
       s.detail 로 대상 화면을 직접 지정할 수 있고, 없으면 목록(list) → 상세(detail) 관례를 따른다. */
    var detailHash = null;
    if (sec && s.type === 'table') {
      var detId = s.detail || (s.id === 'list' ? 'detail' : null);
      if (detId && sec.screens.filter(function (x) { return x.id === detId; })[0]) {
        detailHash = '#/' + sec.key + '/' + detId;
      }
    }

    var card = el('div', 'adm-card');
    var wrap = el('div', 'adm-table-wrap');
    var table = el('table', 'adm-table' + (s.select ? ' adm-table--select' : ''));
    var thead = document.createElement('thead');
    var trh = document.createElement('tr');
    var allBox = null;
    if (s.select) {
      var thSel = document.createElement('th');
      thSel.scope = 'col';
      thSel.className = 'adm-table__sel';
      allBox = document.createElement('input');
      allBox.type = 'checkbox';
      allBox.setAttribute('aria-label', '전체 선택');
      thSel.appendChild(allBox);
      trh.appendChild(thSel);
    }
    (s.columns || []).forEach(function (c) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = c;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    var lastCol = (s.columns || []).length - 1;
    var boxes = [];
    (s.rows || []).forEach(function (row) {
      var tr = document.createElement('tr');
      if (s.select) {
        var tdSel = document.createElement('td');
        tdSel.className = 'adm-table__sel';
        var box = document.createElement('input');
        box.type = 'checkbox';
        box.value = String(row[0]);
        box.setAttribute('aria-label', String(row[0]) + ' 선택');
        /* 체크박스 칸은 행 클릭(상세 이동)에 반응하지 않아야 한다 */
        tdSel.addEventListener('click', function (e) { e.stopPropagation(); });
        box.addEventListener('change', function () { syncSel(); });
        boxes.push(box);
        tdSel.appendChild(box);
        tr.appendChild(tdSel);
      }
      row.forEach(function (cell, ci) {
        var td = document.createElement('td');
        if (cell && typeof cell === 'object') {
          td.appendChild(badge(cell));
        } else if (ci === lastCol && /^(상세|수정|보기|처리|관리|다운로드)$/.test(String(cell))) {
          td.appendChild(el('span', 'cell-link', cell));
        } else {
          td.textContent = cell === null || cell === undefined ? '' : cell;
          if (String(cell).length > 26) { td.className = 'is-long'; }
        }
        tr.appendChild(td);
      });
      if (detailHash) {
        tr.className = 'is-clickable';
        tr.tabIndex = 0;
        tr.setAttribute('role', 'link');
        tr.setAttribute('aria-label', String(row[0]) + ' 상세 보기');
        var go = function () { location.hash = detailHash; };
        tr.addEventListener('click', go);
        tr.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        });
      }
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);

    /* 선택 상태 : 헤더 전체선택 · 선택 요약 바 · 페이지 헤더 버튼과 연동 */
    var selBar = null;
    function syncSel() {
      var picked = boxes.filter(function (b) { return b.checked; });
      var ids = picked.map(function (b) { return b.value; });
      picked.forEach(function () {});
      boxes.forEach(function (b) { b.closest('tr').classList.toggle('is-picked', b.checked); });
      if (allBox) {
        allBox.checked = boxes.length > 0 && ids.length === boxes.length;
        allBox.indeterminate = ids.length > 0 && ids.length < boxes.length;
      }
      if (selBar) {
        selBar.hidden = !ids.length;
        var cnt = selBar.querySelector('.adm-selbar__count');
        if (cnt) { cnt.textContent = ids.length + '건 선택됨'; }
      }
      setSelection(ids);
    }
    if (s.select) {
      if (allBox) {
        allBox.addEventListener('change', function () {
          boxes.forEach(function (b) { b.checked = allBox.checked; });
          syncSel();
        });
      }
      selBar = el('div', 'adm-selbar');
      selBar.hidden = true;
      selBar.appendChild(el('strong', 'adm-selbar__count', '0건 선택됨'));
      var clr = el('button', 'adm-selbar__clear', '선택 해제');
      clr.type = 'button';
      clr.addEventListener('click', function () {
        boxes.forEach(function (b) { b.checked = false; });
        syncSel();
      });
      selBar.appendChild(clr);
      card.appendChild(selBar);
    }

    card.appendChild(wrap);
    if (s.select) { syncSel(); }

    /* 페이지네이션 (시안 데모) */
    var paging = el('div', 'adm-paging');
    paging.appendChild(el('span', 'adm-paging__info', '총 ' + (120 + (s.rows || []).length * 13) + '건 중 1 - ' + (s.rows || []).length + '건'));
    var pnav = el('div', 'adm-paging__nav');
    ['이전', '1', '2', '3', '4', '다음'].forEach(function (p, i) {
      var b = el('button', i === 1 ? 'is-cur' : null, p);
      b.type = 'button';
      pnav.appendChild(b);
    });
    paging.appendChild(pnav);
    card.appendChild(paging);
    return card;
  }
  function buildPanels(s) {
    var box = document.createDocumentFragment();
    var grid = el('div', 'adm-panels');
    (s.panels || []).forEach(function (p) {
      var panel = el('section', 'adm-panel');
      panel.appendChild(el('h3', 'adm-panel__title', p.title));
      var body = el('dl', 'adm-panel__body');
      (p.fields || []).forEach(function (f) {
        var row = el('div', 'adm-panel__row');
        row.appendChild(el('dt', null, f[0]));
        row.appendChild(el('dd', null, f[1]));
        body.appendChild(row);
      });
      panel.appendChild(body);
      grid.appendChild(panel);
    });
    box.appendChild(grid);
    if (s.timeline && s.timeline.length) {
      var tcard = el('div', 'adm-card adm-timeline');
      tcard.style.marginTop = '14px';
      var thead2 = el('div', 'adm-card__head');
      thead2.appendChild(el('h3', 'adm-card__title', '최근 이력'));
      tcard.appendChild(thead2);
      var tbody2 = el('div', 'adm-card__body');
      s.timeline.forEach(function (t) {
        var item = el('div', 'adm-timeline__item' + (t.tone ? ' t-' + t.tone : ''));
        item.appendChild(el('span', 'adm-timeline__time', t.time));
        item.appendChild(el('span', 'adm-timeline__text', t.text));
        tbody2.appendChild(item);
      });
      tcard.appendChild(tbody2);
      box.appendChild(tcard);
    }
    return box;
  }
  function buildForm(s) {
    var card = el('div', 'adm-card');
    var body = el('div', 'adm-card__body');
    var form = el('form', 'adm-form');
    form.setAttribute('onsubmit', 'return false');
    (s.formRows || []).forEach(function (f, idx) {
      var row = el('div', 'adm-form__row');
      var label = el('label', 'adm-form__label', f.label);
      if (f.req) { label.appendChild(el('span', 'req', '*')); }
      var fid = 'adm-f-' + idx;
      label.setAttribute('for', fid);
      row.appendChild(label);
      var field = el('div', 'adm-form__field');
      if (f.type === 'textarea') {
        var ta = document.createElement('textarea');
        ta.id = fid; ta.value = f.value || '';
        field.appendChild(ta);
      } else if (f.type === 'select') {
        var sel = document.createElement('select');
        sel.id = fid;
        (f.options || []).forEach(function (o) {
          var op = document.createElement('option');
          op.textContent = o;
          if (o === f.value) { op.selected = true; }
          sel.appendChild(op);
        });
        field.appendChild(sel);
      } else if (f.type === 'radio' || f.type === 'check') {
        var rg = el('div', 'adm-form__radios');
        (f.options || []).forEach(function (o, oi) {
          var lb = document.createElement('label');
          var input = document.createElement('input');
          input.type = f.type === 'check' ? 'checkbox' : 'radio';
          input.name = fid;
          if (f.type === 'radio' ? o === f.value : (f.value || '').indexOf(o) >= 0) { input.checked = true; }
          else if (f.type === 'radio' && !f.value && oi === 0) { input.checked = true; }
          lb.appendChild(input);
          lb.appendChild(document.createTextNode(o));
          rg.appendChild(lb);
        });
        field.appendChild(rg);
      } else if (f.type === 'file') {
        var fz = el('div', 'adm-form__file', f.value || '파일을 끌어오거나 클릭해서 선택하세요');
        field.appendChild(fz);
      } else if (f.type === 'readonly') {
        field.appendChild(el('div', 'adm-form__readonly', f.value || ''));
      } else {
        var input2 = document.createElement('input');
        input2.type = f.type === 'date' ? 'date' : 'text';
        input2.id = fid;
        input2.value = f.value || '';
        field.appendChild(input2);
      }
      if (f.hint) { field.appendChild(el('p', 'adm-form__hint', f.hint)); }
      row.appendChild(field);
      form.appendChild(row);
    });
    var actions = el('div', 'adm-form__actions');
    var cancel = el('button', 'adm-btn adm-btn--ghost', '취소'); cancel.type = 'button';
    var tmp = el('button', 'adm-btn adm-btn--ghost', '임시 저장'); tmp.type = 'button';
    var save = el('button', 'adm-btn adm-btn--primary', '저장하기'); save.type = 'submit';
    actions.appendChild(cancel); actions.appendChild(tmp); actions.appendChild(save);
    form.appendChild(actions);
    body.appendChild(form);
    card.appendChild(body);
    return card;
  }
  /* ---------- 차트 카드 (제목 + 단위 + 기간 세그먼트 + 본체) ----------
     chart.ranges 가 있으면 시간·일·월 세그먼트를 렌더하고, 선택 시 본체만 다시 그린다. */
  function rangeView(chart, r) {
    return {
      kind: r.kind || chart.kind,
      label: r.label || chart.label,
      unit: r.unit || chart.unit,
      points: r.points,
      labels: r.labels,
      maxTicks: r.maxTicks || chart.maxTicks
    };
  }
  function buildChartCard(chart, cls) {
    var card = el('div', 'adm-card' + (cls ? ' ' + cls : ''));
    var head = el('div', 'adm-card__head');
    var title = el('h3', 'adm-card__title', chart.label);
    var unit = el('span', 'adm-card__more', chart.unit ? '단위: ' + chart.unit : '');
    var body = el('div', 'adm-card__body');
    head.appendChild(title);
    head.appendChild(unit);

    function draw(view) {
      title.textContent = view.label;
      unit.textContent = view.unit ? '단위: ' + view.unit : '';
      while (body.firstChild) { body.removeChild(body.firstChild); }
      body.appendChild(chartFigure(view));
    }

    if (chart.ranges && chart.ranges.length) {
      var seg = el('div', 'adm-seg');
      seg.setAttribute('role', 'group');
      seg.setAttribute('aria-label', '기간 단위 선택');
      var btns = chart.ranges.map(function (r) {
        var b = el('button', 'adm-seg__btn', r.tab);
        b.type = 'button';
        seg.appendChild(b);
        return b;
      });
      head.appendChild(seg);
      var pick = function (idx) {
        btns.forEach(function (b, i) {
          b.className = 'adm-seg__btn' + (i === idx ? ' is-on' : '');
          b.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
        });
        draw(rangeView(chart, chart.ranges[idx]));
      };
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () { pick(i); });
      });
      var start = 0;
      chart.ranges.forEach(function (r, i) { if (r.key === chart.range) { start = i; } });
      pick(start);
    } else {
      draw(chart);
    }
    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  function buildStats(s, sec) {
    var box = document.createDocumentFragment();
    if (s.kpis && s.kpis.length) {
      var kpis = el('div', 'adm-kpis');
      s.kpis.forEach(function (k) {
        var card = el('div', 'adm-kpi');
        card.appendChild(el('p', 'adm-kpi__label', k.label));
        card.appendChild(el('p', 'adm-kpi__value', k.value));
        if (k.diff) { card.appendChild(el('p', 'adm-kpi__diff ' + (k.dir || ''), k.diff)); }
        kpis.appendChild(card);
      });
      box.appendChild(kpis);
    }
    if (s.chart) {
      box.appendChild(buildChartCard(s.chart, 'adm-chart-card'));
    }
    if (s.columns && s.rows) {
      box.appendChild(buildTable(s, sec));
    }
    return box;
  }

  /* ---------- 대시보드 (00 · 관리자 메인 + KPI + 최근 작업 + 알림) ---------- */
  var DASH = {
    kpis: [
      { label: '전체 회원', value: '128,417', diff: '▲ 1,248 (이번 주)', dir: 'up', spark: [102, 105, 104, 109, 112, 118, 121, 120, 124, 126, 125, 128] },
      { label: '오늘 활성 이용자', value: '24,932', diff: '▲ 8.2% (어제 대비)', dir: 'up', spark: [18, 19, 17, 20, 22, 21, 23, 22, 24, 23, 24, 25] },
      { label: '게시 중 콘텐츠', value: '3,482', diff: '▲ 57 (이번 주)', dir: 'up', spark: [30, 31, 31, 32, 32, 33, 33, 34, 34, 34, 35, 35] },
      { label: '오늘 시청 시간', value: '81,204시간', diff: '▼ 2.1% (어제 대비)', dir: 'down', spark: [88, 84, 86, 85, 87, 83, 84, 82, 85, 83, 82, 81] },
      { label: '이번 달 매출', value: '₩412,080,000', diff: '▲ 6.4% (지난달 대비)', dir: 'up', spark: [31, 33, 32, 35, 34, 36, 37, 36, 38, 39, 40, 41] },
      { label: '정산 대기 금액', value: '₩38,120,000', diff: '지급 예정 7월 31일', dir: 'flat', spark: [42, 40, 41, 39, 40, 38, 39, 38, 39, 38, 38, 38] }
    ],
    /* 시청 시간 추이 — 기간 단위(시간·일·월)를 세그먼트로 전환한다.
       월 단위는 값이 너무 커져 가독성이 떨어지므로 '천 시간' 으로 환산해 표기한다. */
    chart: {
      label: '시청 시간 추이', unit: '시간', range: 'day',
      ranges: [
        {
          key: 'hour', tab: '시간', unit: '시간', label: '최근 24시간 시청 시간 추이',
          points: [2980, 2140, 1520, 1080, 860, 940, 1380, 1960, 2410, 2620, 2780, 2950,
            3410, 3280, 3140, 3260, 3520, 3980, 4620, 5340, 6180, 6740, 6120, 4900],
          labels: ['0시', '1시', '2시', '3시', '4시', '5시', '6시', '7시', '8시', '9시', '10시', '11시',
            '12시', '13시', '14시', '15시', '16시', '17시', '18시', '19시', '20시', '21시', '22시', '현재']
        },
        {
          key: 'day', tab: '일', unit: '시간', label: '최근 14일 시청 시간 추이',
          points: [61200, 64800, 63100, 68400, 72900, 81300, 84100, 76200, 74800, 77500, 80100, 85400, 83900, 81204],
          labels: ['7/15', '7/16', '7/17', '7/18', '7/19', '7/20', '7/21', '7/22', '7/23', '7/24', '7/25', '7/26', '7/27', '오늘']
        },
        {
          key: 'month', tab: '월', unit: '천 시간', label: '최근 12개월 시청 시간 추이',
          points: [1682, 1745, 1698, 1810, 1924, 2087, 2015, 2143, 2098, 2264, 2352, 2287],
          labels: ['8월', '9월', '10월', '11월', '12월', '1월', '2월', '3월', '4월', '5월', '6월', '이번 달']
        }
      ]
    },
    queue: [
      { count: 12, label: '콘텐츠 심사 대기', href: '#/content/review' },
      { count: 4, label: '크리에이터 신청', href: '#/creator/list' },
      { count: 7, label: '지급 승인 대기', href: '#/settle/pay' },
      { count: 9, label: '신고 처리 대기', href: '#/report/content' },
      { count: 3, label: '품질검사 실패', href: '#/content/qc' },
      { count: 2, label: '인코딩 오류', href: '#/ai/encode' }
    ],
    recent: [
      { tone: 'ok', text: '콘텐츠 C-2049 「그 계절, 우리가 사랑한 시간」 12화 게시 승인', time: '10:42' },
      { tone: 'info', text: '크리에이터 CR-011 몽글스튜디오 계약 v2.1 갱신 저장', time: '10:15' },
      { tone: 'warn', text: '회원 U-88401 신고 3건 접수 — 검토 배정', time: '09:58' },
      { tone: 'ok', text: '7월 2차 크리에이터 정산 잠정 금액 계산 완료', time: '09:30' },
      { tone: 'err', text: '광고 캠페인 CP-3021 소재 검수 반려 처리', time: '어제' },
      { tone: 'info', text: '공지 「7월 서비스 점검 안내」 예약 게시 등록', time: '어제' }
    ],
    alarms: [
      { tone: 'err', text: 'GPU 대기열 지연 — 화질개선 작업 6건 30분 초과', time: '방금' },
      { tone: 'warn', text: '지급 승인 요청 7건이 승인 기한(오늘 18:00) 도래', time: '32분 전' },
      { tone: 'warn', text: '신고 처리 SLA 임박 4건 (24시간 초과 예정)', time: '1시간 전' },
      { tone: 'info', text: 'AI 모델 upscale-v3.2 검증 완료 — 적용 승인 필요', time: '3시간 전' },
      { tone: 'ok', text: '야간 백업 정상 완료 (검증 통과)', time: '06:00' }
    ],
    health: [
      { name: '응용 서비스', val: '정상 99.98%', pct: 99, tone: '' },
      { name: '인코딩 파이프라인', val: '지연 76%', pct: 76, tone: 'warn' },
      { name: 'GPU 대기열', val: '혼잡 58%', pct: 58, tone: 'err' },
      { name: '데이터베이스', val: '정상 99.9%', pct: 99, tone: '' },
      { name: '저장소 여유', val: '82% 사용', pct: 82, tone: 'warn' }
    ]
  };
  function buildDashboard() {
    var box = document.createDocumentFragment();

    var head = el('div', 'adm-page-head');
    var text = el('div', 'adm-page-head__text');
    text.appendChild(el('h2', 'adm-page-head__title', '대시보드'));
    text.appendChild(el('p', 'adm-page-head__desc', '전체 서비스 운영 현황과 담당 업무 알림을 확인하는 관리자 시작 화면입니다. 항목을 선택하면 해당 업무 화면으로 이동합니다.'));
    head.appendChild(text);
    var acts = el('div', 'adm-page-head__actions');
    acts.appendChild(el('span', 'adm-badge adm-badge--ok', '시스템 정상'));
    head.appendChild(acts);
    box.appendChild(head);

    /* KPI (핵심 성과지표) */
    var kpis = el('div', 'adm-kpis');
    DASH.kpis.forEach(function (k) {
      var card = el('div', 'adm-kpi');
      card.appendChild(el('p', 'adm-kpi__label', k.label));
      card.appendChild(el('p', 'adm-kpi__value', k.value));
      card.appendChild(el('p', 'adm-kpi__diff ' + k.dir, k.diff));
      var sp = el('span', 'adm-kpi__spark');
      sp.appendChild(sparkline(k.spark, k.dir === 'down' ? 'var(--adm-err)' : 'var(--adm-mint)'));
      card.appendChild(sp);
      kpis.appendChild(card);
    });
    box.appendChild(kpis);

    var grid = el('div', 'adm-dash-grid');

    /* 시청 추이 차트 (시간·일·월 전환) */
    grid.appendChild(buildChartCard(DASH.chart, 'full'));

    /* 승인·처리 대기 큐 */
    var qcard = el('div', 'adm-card full');
    var qhead = el('div', 'adm-card__head');
    qhead.appendChild(el('h3', 'adm-card__title', '승인·처리 대기'));
    qhead.appendChild(el('span', 'adm-card__more', '선택 시 해당 업무 화면으로 이동'));
    qcard.appendChild(qhead);
    var qbody = el('div', 'adm-card__body');
    var queue = el('div', 'adm-queue');
    DASH.queue.forEach(function (q) {
      var a = el('a', 'adm-queue__item');
      a.href = q.href;
      a.appendChild(el('p', 'adm-queue__count', q.count));
      a.appendChild(el('p', 'adm-queue__label', q.label));
      queue.appendChild(a);
    });
    qbody.appendChild(queue);
    qcard.appendChild(qbody);
    grid.appendChild(qcard);

    /* 최근 작업 */
    var rcard = el('div', 'adm-card');
    var rhead = el('div', 'adm-card__head');
    rhead.appendChild(el('h3', 'adm-card__title', '최근 작업'));
    rhead.appendChild(el('span', 'adm-card__more', '내 처리 이력 기준'));
    rcard.appendChild(rhead);
    var rbody = el('div', 'adm-card__body');
    var rlist = el('div', 'adm-list');
    DASH.recent.forEach(function (r) {
      var item = el('div', 'adm-list__item');
      item.appendChild(el('span', 'adm-list__dot t-' + r.tone));
      item.appendChild(el('span', 'adm-list__text', r.text));
      item.appendChild(el('span', 'adm-list__time', r.time));
      rlist.appendChild(item);
    });
    rbody.appendChild(rlist);
    rcard.appendChild(rbody);
    grid.appendChild(rcard);

    /* 알림 + 시스템 상태 */
    var side = el('div');
    var acard = el('div', 'adm-card');
    var ahead = el('div', 'adm-card__head');
    ahead.appendChild(el('h3', 'adm-card__title', '알림'));
    ahead.appendChild(el('span', 'adm-card__more', '권한 범위 내 알림만 표시'));
    acard.appendChild(ahead);
    var abody = el('div', 'adm-card__body');
    var alist = el('div', 'adm-list');
    DASH.alarms.forEach(function (r) {
      var item = el('div', 'adm-list__item');
      item.appendChild(el('span', 'adm-list__dot t-' + r.tone));
      item.appendChild(el('span', 'adm-list__text', r.text));
      item.appendChild(el('span', 'adm-list__time', r.time));
      alist.appendChild(item);
    });
    abody.appendChild(alist);
    acard.appendChild(abody);
    side.appendChild(acard);

    var hcard = el('div', 'adm-card');
    hcard.style.marginTop = '14px';
    var hhead = el('div', 'adm-card__head');
    hhead.appendChild(el('h3', 'adm-card__title', '시스템 상태'));
    var hlink = el('a', 'adm-card__more', '시스템 상태 화면 >');
    hlink.href = '#/ai/status';
    hhead.appendChild(hlink);
    hcard.appendChild(hhead);
    var hbody = el('div', 'adm-card__body');
    var health = el('div', 'adm-health');
    DASH.health.forEach(function (hh) {
      var row = el('div', 'adm-health__row');
      row.appendChild(el('span', 'adm-health__name', hh.name));
      var bar = el('div', 'adm-health__bar');
      var fill = el('div', 'adm-health__fill ' + hh.tone);
      fill.style.width = hh.pct + '%';
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'adm-health__val', hh.val));
      health.appendChild(row);
    });
    hbody.appendChild(health);
    hcard.appendChild(hbody);
    side.appendChild(hcard);
    grid.appendChild(side);

    box.appendChild(grid);
    return box;
  }

  /* ---------- 렌더 ---------- */
  function updateCrumb(route, sec, s) {
    var crumb = document.querySelector('.adm-top__crumb');
    if (!crumb) { return; }
    crumb.innerHTML = '';
    if (route.sec === 'dashboard') {
      crumb.appendChild(el('span', 'cur', '대시보드'));
    } else if (sec && s) {
      crumb.appendChild(el('span', null, sec.num + ' ' + sec.title));
      crumb.appendChild(el('span', 'sep', '›'));
      crumb.appendChild(el('span', 'cur', s.title));
    }
  }
  function render() {
    var route = parseHash();
    var content = document.querySelector('.adm-content');
    if (!content) { return; }
    content.innerHTML = '';
    resetSelection();
    var sec = null, s = null;

    if (route.sec === 'dashboard' || !DATA.sections.length) {
      content.appendChild(buildDashboard());
    } else {
      sec = findSection(route.sec);
      if (!sec) { location.hash = '#/dashboard'; return; }
      s = findScreen(sec, route.id);
      if (!s) { location.hash = '#/dashboard'; return; }
      content.appendChild(buildPageHead(sec, s));
      if (s.note) { content.appendChild(buildNote(s.note)); }
      if (s.type === 'table') {
        if (s.filters && s.filters.length) { content.appendChild(buildFilters(s.filters)); }
        content.appendChild(buildTable(s, sec));
      } else if (s.type === 'detail') {
        content.appendChild(buildPanels(s));
      } else if (s.type === 'form') {
        content.appendChild(buildForm(s));
      } else if (s.type === 'stats') {
        if (s.filters && s.filters.length) { content.appendChild(buildFilters(s.filters)); }
        content.appendChild(buildStats(s, sec));
      }
    }
    renderTopNav(route);
    renderSidePanel(route);
    updateCrumb(route, sec, s);
    closeGnb(null);
    document.querySelector('.adm').classList.remove('side-open');
    window.scrollTo(0, 0);
  }

  /* ---------- 메뉴 검색 (좌측 패널 상단) ---------- */
  function initSearch() {
    var box = document.querySelector('.adm-side__search');
    if (!box) { return; }
    var input = box.querySelector('input');
    var result = el('div', 'adm-top__search-result');
    box.appendChild(result);
    function close() { result.classList.remove('is-open'); }
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      result.innerHTML = '';
      if (!q) { close(); return; }
      var hits = [];
      DATA.sections.forEach(function (sec) {
        sec.screens.forEach(function (s) {
          if (s.hideInNav) { return; }
          if ((sec.title + ' ' + s.title).toLowerCase().indexOf(q) >= 0) {
            hits.push({ sec: sec, s: s });
          }
        });
      });
      if (!hits.length) {
        result.appendChild(el('p', 'empty', '일치하는 메뉴가 없습니다'));
      } else {
        hits.slice(0, 12).forEach(function (h) {
          var a = el('a');
          a.href = '#/' + h.sec.key + '/' + h.s.id;
          a.appendChild(document.createTextNode(h.sec.title + ' › '));
          var b = document.createElement('b');
          b.textContent = h.s.title;
          a.appendChild(b);
          a.addEventListener('click', function () { input.value = ''; close(); });
          result.appendChild(a);
        });
      }
      result.classList.add('is-open');
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) { close(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });
  }

  /* ---------- 다크 / 라이트 테마 (좌측 패널 하단) ---------- */
  function initTheme() {
    var KEY = 'vibuzz-adm-theme';
    var right = document.querySelector('.adm-side__foot');
    if (!right || right.querySelector('.adm-theme')) { return; }

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* 프라이빗 모드 등 - 무시 */ }

    var box = el('div', 'adm-theme');
    box.setAttribute('role', 'radiogroup');
    box.setAttribute('aria-label', '화면 테마');

    var MODES = [
      { key: 'dark', label: '다크', icon: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' },
      { key: 'light', label: '라이트', icon: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v2M12 19v2M21 12h-2M5 12H3M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M17.7 17.7l-1.4-1.4M7.7 7.7 6.3 6.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' }
    ];
    var btns = {};

    function apply(mode) {
      document.documentElement.setAttribute('data-adm-theme', mode);
      MODES.forEach(function (m) {
        btns[m.key].classList.toggle('is-on', m.key === mode);
        btns[m.key].setAttribute('aria-checked', String(m.key === mode));
      });
      try { localStorage.setItem(KEY, mode); } catch (e) { /* 무시 */ }
    }

    MODES.forEach(function (m) {
      var b = el('button', 'adm-theme__btn');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.innerHTML = m.icon;
      b.appendChild(el('span', null, m.label));
      b.addEventListener('click', function () { apply(m.key); });
      btns[m.key] = b;
      box.appendChild(b);
    });

    right.insertBefore(box, right.firstChild);
    apply(saved === 'light' ? 'light' : 'dark');
  }

  /* ---------- 초기화 ---------- */
  function init() {
    var burger = document.querySelector('.adm-top__menu-btn');
    var adm = document.querySelector('.adm');
    if (burger && adm) {
      burger.addEventListener('click', function () {
        var open = adm.classList.toggle('side-open');
        burger.setAttribute('aria-expanded', String(open));
      });
      var dim = document.querySelector('.adm-dim');
      if (dim) {
        dim.addEventListener('click', function () {
          adm.classList.remove('side-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      }
    }
    /* 드롭다운은 바깥 클릭·Esc 로 닫는다. Esc 로 닫을 때는 포커스를 연 버튼으로 되돌린다. */
    document.addEventListener('click', function () { closeGnb(null); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') { return; }
      var opened = null;
      gnbItems.forEach(function (it) { if (it.wrap.classList.contains('is-open')) { opened = it; } });
      if (!opened) { return; }            /* 열린 메뉴가 없으면 모달 등 다른 소비자에게 넘긴다 */
      closeGnb(null);
      opened.btn.focus();
      e.stopPropagation();
    });
    var fitTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(fitTimer);
      fitTimer = window.setTimeout(fitTopNav, 120);
    });
    /* CDN 웹폰트가 늦게 붙으면 라벨 폭이 달라지므로 로드 후 한 번 더 잰다 */
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(fitTopNav);
    }
    initSearch();
    initTheme();
    window.addEventListener('hashchange', render);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
