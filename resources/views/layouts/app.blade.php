<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'AIVEON')</title>

    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11.2.6/swiper-bundle.min.css">
    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    <script>
        /* TOP6 랭킹 숫자용 Gothic A1 숫자 글리프 선로드 (unicode-range 슬라이스 FOUT 방지) */
        if (document.fonts && document.fonts.load) { document.fonts.load('700 200px "Gothic A1"', '0123456789'); }
    </script>
    @stack('styles')
</head>
<body class="@yield('body-class')">
    <a href="#content" class="skip-link">본문 바로가기</a>

    <div class="wrap">
        @include('partials.gnb')

        <main id="content" class="content">
            @yield('content')
        </main>

        {{-- 몰입형 화면(플레이어 등)은 @section('hide-footer', '1') 로 푸터를 제외한다 --}}
        @hasSection('hide-footer')
        @else
            @include('partials.footer')
        @endif
    </div>

    <script src="https://cdn.jsdelivr.net/npm/swiper@11.2.6/swiper-bundle.min.js" defer></script>
    <script src="{{ asset('js/main.js') }}" defer></script>
    @stack('scripts')
</body>
</html>
