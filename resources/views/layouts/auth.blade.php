<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'AIVEON')</title>

    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="{{ asset('css/main.css') }}">
    @stack('styles')
</head>
<body>
    <a href="#content" class="skip-link">본문 바로가기</a>

    <div class="wrap">
        @include('partials.gnb')

        <main id="content" class="auth">
            @yield('content')
        </main>
    </div>

    <script src="{{ asset('js/main.js') }}" defer></script>
    @stack('scripts')
</body>
</html>
