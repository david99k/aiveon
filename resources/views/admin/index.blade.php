{{--
    AIVEON ADMIN 셸 (SYNERGYON_ADMIN_메뉴화면설명서_V1.0).
    서비스 레이아웃(layouts.app)과 분리된 독립 화면 :
    상단 1차 메뉴 · 좌측 패널 · 콘텐츠는 js/admin.js 가 js/admin-data.js 기준으로 렌더링한다.
--}}
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>AIVEON ADMIN · 관리자</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
    <link rel="stylesheet" href="{{ asset('css/admin.css') }}">
</head>
<body class="adm-body">
    <div class="adm">
        {{-- 상단 : 로고 + 1차 메뉴(드롭다운으로 2차) · 실서비스는 메뉴 권한 관리 결과로 필터 --}}
        <header class="adm-top">
            <button type="button" class="adm-top__menu-btn" aria-label="메뉴 열기" aria-expanded="false">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </button>

            <a class="adm-top__logo" href="#/dashboard">
                <span class="adm-top__logo-name">AIVEON</span>
                <span class="adm-top__logo-badge">ADMIN</span>
            </a>

            <nav class="adm-gnb" aria-label="관리자 메뉴"></nav>

            <div class="adm-top__right">
                <button type="button" class="adm-top__bell" aria-label="알림">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                    <span class="dot" aria-hidden="true"></span>
                </button>
                <div class="adm-top__profile">
                    <span class="adm-top__avatar" aria-hidden="true">관</span>
                    <div class="adm-top__who">
                        <p class="name">운영관리자</p>
                        <p class="role">슈퍼관리자 · admin@synergyon.kr</p>
                    </div>
                </div>
            </div>
        </header>

        <div class="adm-shell">
            {{-- 좌측 패널 : 검색(상단) · 대시보드 · 즐겨찾기 · 전체 메뉴(좁은 화면) · 테마(하단) --}}
            <aside class="adm-side" aria-label="사이드 패널">
                <p class="adm-side__head">SIDE PANEL</p>

                <div class="adm-side__search">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                    <input type="search" placeholder="메뉴 검색" aria-label="메뉴 검색">
                </div>

                <nav class="adm-side__nav" aria-label="바로가기"></nav>

                <div class="adm-side__foot"></div>
            </aside>

            <div class="adm-main">
                <div class="adm-crumbbar">
                    <div class="adm-top__crumb" aria-label="현재 위치"></div>
                </div>
                <main class="adm-content" id="content"></main>
            </div>
        </div>

        <div class="adm-dim" aria-hidden="true"></div>
    </div>

    <script src="{{ asset('js/admin-data.js') }}"></script>
    <script src="{{ asset('js/admin.js') }}"></script>
</body>
</html>
