/* ============================================================
   AIVEON ADMIN (시너지온 관리자) — 화면 렌더러
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
    warn: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4 21.5 20h-19L12 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="0.9" fill="currentColor"/></svg>'
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

  /* ---------- 사이드바 ---------- */
  function renderSidebar(route) {
    var nav = document.querySelector('.adm-side__nav');
    if (!nav) { return; }
    nav.innerHTML = '';

    var home = el('a', 'adm-side__home' + (route.sec === 'dashboard' ? ' is-active' : ''));
    home.href = '#/dashboard';
    home.appendChild(svgNode(ICONS.home));
    home.appendChild(document.createTextNode('대시보드'));
    if (route.sec === 'dashboard') { home.setAttribute('aria-current', 'page'); }
    nav.appendChild(home);

    DATA.sections.forEach(function (sec) {
      var isActive = route.sec === sec.key;
      var g = el('div', 'adm-side__group' + (isActive ? ' is-open has-active' : ''));
      var head = el('button', 'adm-side__group-head');
      head.type = 'button';
      head.setAttribute('aria-expanded', isActive ? 'true' : 'false');
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
        var a = el('a');
        a.href = '#/' + sec.key + '/' + s.id;
        a.appendChild(document.createTextNode(s.title));
        if (s.depth3) { a.appendChild(el('span', 'adm-depth3', '3단계')); }
        if (isActive && route.id === s.id) {
          a.className = 'is-active';
          a.setAttribute('aria-current', 'page');
        }
        sub.appendChild(a);
      });
      g.appendChild(sub);
      nav.appendChild(g);
    });
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
    svg.appendChild(svgEl('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    return svg;
  }
  function areaChart(chart) {
    var w = 720, h = 200, padL = 8, padR = 8, padT = 14, padB = chart.labels ? 26 : 10;
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
    if (chart.labels) {
      chart.labels.forEach(function (lb, i) {
        if (pts.length > 8 && i % 2) { return; } /* 라벨 과밀 방지 */
        var t = svgEl('text', { x: padL + i * step, y: h - 8, 'text-anchor': 'middle', fill: 'rgba(255,255,255,0.35)', 'font-size': 10 });
        t.textContent = lb;
        svg.appendChild(t);
      });
    }
    return svg;
  }
  function barChart(chart) {
    var w = 720, h = 200, padL = 8, padR = 8, padT = 14, padB = chart.labels ? 26 : 10;
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
    if (chart.labels) {
      chart.labels.forEach(function (lb, i) {
        if (pts.length > 8 && i % 2) { return; }
        var t = svgEl('text', { x: padL + i * slot + slot / 2, y: h - 8, 'text-anchor': 'middle', fill: 'rgba(255,255,255,0.35)', 'font-size': 10 });
        t.textContent = lb;
        svg.appendChild(t);
      });
    }
    return svg;
  }

  /* ---------- 화면 구성 요소 ---------- */
  function buildPageHead(sec, s) {
    var head = el('div', 'adm-page-head');
    var text = el('div', 'adm-page-head__text');
    var title = el('h2', 'adm-page-head__title', s.title);
    if (s.depth3) { title.appendChild(el('span', 'adm-page-head__depth', '3단계 화면')); }
    text.appendChild(title);
    text.appendChild(el('p', 'adm-page-head__desc', s.desc));
    head.appendChild(text);
    if (s.headActions && s.headActions.length) {
      var acts = el('div', 'adm-page-head__actions');
      s.headActions.forEach(function (a, i) {
        var b = el('button', 'adm-btn ' + (i === 0 ? 'adm-btn--primary' : 'adm-btn--ghost'), a);
        b.type = 'button';
        acts.appendChild(b);
      });
      head.appendChild(acts);
    }
    return head;
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
  function buildTable(s) {
    var card = el('div', 'adm-card');
    var wrap = el('div', 'adm-table-wrap');
    var table = el('table', 'adm-table');
    var thead = document.createElement('thead');
    var trh = document.createElement('tr');
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
    (s.rows || []).forEach(function (row) {
      var tr = document.createElement('tr');
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
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    card.appendChild(wrap);

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
  function buildStats(s) {
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
      var ccard = el('div', 'adm-card adm-chart-card');
      var chead = el('div', 'adm-card__head');
      chead.appendChild(el('h3', 'adm-card__title', s.chart.label));
      if (s.chart.unit) { chead.appendChild(el('span', 'adm-card__more', '단위: ' + s.chart.unit)); }
      ccard.appendChild(chead);
      var cbody = el('div', 'adm-card__body');
      cbody.appendChild(s.chart.kind === 'bar' ? barChart(s.chart) : areaChart(s.chart));
      ccard.appendChild(cbody);
      box.appendChild(ccard);
    }
    if (s.columns && s.rows) {
      box.appendChild(buildTable(s));
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
    chart: {
      label: '최근 14일 시청 시간 추이', unit: '시간',
      points: [61200, 64800, 63100, 68400, 72900, 81300, 84100, 76200, 74800, 77500, 80100, 85400, 83900, 81204],
      labels: ['7/15', '7/16', '7/17', '7/18', '7/19', '7/20', '7/21', '7/22', '7/23', '7/24', '7/25', '7/26', '7/27', '오늘']
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
      sp.appendChild(sparkline(k.spark, k.dir === 'down' ? 'rgba(241,96,99,0.8)' : 'rgba(94,234,212,0.8)'));
      card.appendChild(sp);
      kpis.appendChild(card);
    });
    box.appendChild(kpis);

    var grid = el('div', 'adm-dash-grid');

    /* 시청 추이 차트 */
    var ccard = el('div', 'adm-card full');
    var chead = el('div', 'adm-card__head');
    chead.appendChild(el('h3', 'adm-card__title', DASH.chart.label));
    chead.appendChild(el('span', 'adm-card__more', '단위: ' + DASH.chart.unit));
    ccard.appendChild(chead);
    var cbody = el('div', 'adm-card__body');
    cbody.appendChild(areaChart(DASH.chart));
    ccard.appendChild(cbody);
    grid.appendChild(ccard);

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
        content.appendChild(buildTable(s));
      } else if (s.type === 'detail') {
        content.appendChild(buildPanels(s));
      } else if (s.type === 'form') {
        content.appendChild(buildForm(s));
      } else if (s.type === 'stats') {
        if (s.filters && s.filters.length) { content.appendChild(buildFilters(s.filters)); }
        content.appendChild(buildStats(s));
      }
    }
    renderSidebar(route);
    updateCrumb(route, sec, s);
    document.querySelector('.adm').classList.remove('side-open');
    window.scrollTo(0, 0);
  }

  /* ---------- 메뉴 검색 ---------- */
  function initSearch() {
    var box = document.querySelector('.adm-top__search');
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

  /* ---------- 초기화 ---------- */
  function init() {
    var burger = document.querySelector('.adm-top__menu-btn');
    var adm = document.querySelector('.adm');
    if (burger && adm) {
      burger.addEventListener('click', function () { adm.classList.toggle('side-open'); });
      var dim = document.querySelector('.adm-dim');
      if (dim) { dim.addEventListener('click', function () { adm.classList.remove('side-open'); }); }
    }
    initSearch();
    window.addEventListener('hashchange', render);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
