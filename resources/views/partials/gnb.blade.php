{{-- GNB : 로고 + 주 메뉴 + 유틸(언어/검색/구독/프로필) --}}
@php
    /* 컨트롤러가 $gnbMenus를 넘기지 않는 페이지에서도 기본 메뉴가 나오도록 폴백 */
    $gnbMenus = $gnbMenus ?? [
        ['label' => '추천', 'url' => route('main'), 'active' => true],
        ['label' => 'AI 쇼츠', 'url' => '#'],
        ['label' => 'AI 애니메이션', 'url' => route('category', 'animation')],
        ['label' => 'AI BL', 'url' => route('category', 'bl')],
        ['label' => 'AI 숏폼 드라마', 'url' => route('category', 'shortform')],
        ['label' => 'AI 라이브 & 채널', 'url' => route('live')],
        ['label' => '성인 19+', 'url' => route('category', 'adult')],
    ];

    /* 프로필 이미지 : 로그인 전엔 기본 아이콘, 로그인 후엔 유저 아바타.
       인증 연동 시 컨트롤러(또는 View Composer)에서
       $user = ['avatar' => auth()->user()->avatar_url, ...] 형태로 내려주면 된다. */
    $user = $user ?? null;
    $profileImage = !empty($user['avatar']) ? $user['avatar'] : 'images/common/default_icon.png';
@endphp
<header class="gnb">
    <div class="gnb__left">
        <h1><a href="{{ url('/') }}" class="gnb__logo">AIVEON</a></h1>

        <nav class="gnb__nav" aria-label="주 메뉴">
            @foreach ($gnbMenus as $menu)
                <a href="{{ $menu['url'] ?? '#' }}"
                   class="gnb__nav-link{{ !empty($menu['active']) ? ' is-active' : '' }}"
                   @if (!empty($menu['active'])) aria-current="page" @endif>
                    {{ $menu['label'] ?? '' }}
                </a>
            @endforeach
        </nav>
    </div>

    <div class="gnb__utils">
        <a href="{{ route('search') }}" class="gnb__icon-btn gnb__icon-btn--search" aria-label="검색">
            <img src="{{ asset('images/common/ic_search.svg') }}" alt="">
        </a>
        <a href="#" class="gnb__upload">업로드 +</a>

        {{-- 프로필 : 로그인 전 기본 아이콘 + 호버 시 로그인 유도 팝업 / 로그인 후 유저 아바타 --}}
        <div class="gnb__profile-wrap">
            <a href="#" class="gnb__profile" aria-label="내 프로필" aria-haspopup="true">
                <img src="{{ asset($profileImage) }}" alt="">
            </a>
            @if (empty($user))
                <div class="gnb__profile-pop" role="menu">
                    <p class="gnb__profile-pop-text">로그인하고 다채로운<br>AI 영상을 계속 감상하세요</p>
                    <a href="{{ route('login') }}" class="gnb__profile-pop-btn" role="menuitem">로그인</a>
                </div>
            @endif
        </div>
    </div>
</header>
