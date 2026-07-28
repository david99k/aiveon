{{-- 마이페이지 좌측 계정 사이드바 (회원정보 / 즐겨찾기 / 크리에이터 스튜디오 / 자주하는 질문 / 1:1 문의 공용) --}}
@php
    /* $studioSub : 크리에이터 스튜디오 하위 활성 항목 (channel|content|revenue|comment).
       값이 있으면 아코디언이 펼쳐진 상태 + 해당 항목이 활성으로 렌더된다. */
    $studioSub = $studioSub ?? null;
    $studioOpen = $studioSub !== null;
@endphp
<aside class="mypage__side" aria-label="계정 메뉴">
    <div class="mypage__profile">
        <img class="mypage__profile-avatar" src="{{ asset('images/common/avatar_user.jpg') }}" alt="">
        <div>
            <p class="mypage__profile-name">synergy_on</p>
            <p class="mypage__profile-plan">free</p>
        </div>
    </div>

    {{-- 회원정보는 마이페이지 대시보드의 #account 카드로 통합됨 --}}
    <a href="{{ route('mypage') }}#account" class="mypage__side-edit">회원정보 변경 &gt;</a>
    <a href="#" class="mypage__subscribe">Premium 구독</a>

    <hr class="mypage__side-divider">

    <nav class="mypage__side-nav" aria-label="마이페이지 메뉴">
        <a href="{{ route('mypage') }}"><span class="mypage__side-nav-icon icon-mypage" aria-hidden="true"></span>마이페이지</a>
        <a href="{{ route('subscriptions') }}"><span class="mypage__side-nav-icon icon-subscribe" aria-hidden="true"></span>구독</a>

        {{-- 크리에이터 스튜디오 : 아코디언 (내 채널 관리 / 콘텐츠 관리 / 수익 관리 / 댓글 관리) --}}
        <div class="mypage__side-group{{ $studioOpen ? ' is-open' : '' }}{{ $studioSub ? ' is-active' : '' }}">
            <button type="button" class="mypage__side-parent js-studio-toggle" aria-expanded="{{ $studioOpen ? 'true' : 'false' }}">
                <span class="mypage__side-nav-icon icon-creator" aria-hidden="true"></span>
                크리에이터 스튜디오
                <svg class="mypage__side-parent-chevron" viewBox="0 0 14 8" fill="none" aria-hidden="true"><path d="M1 1l6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="mypage__side-sub">
                <a href="{{ route('studio') }}" @class(['is-active' => $studioSub === 'channel']) @if ($studioSub === 'channel') aria-current="page" @endif>내 채널 관리</a>
                <a href="{{ route('studio.content') }}" @class(['is-active' => $studioSub === 'content']) @if ($studioSub === 'content') aria-current="page" @endif>콘텐츠 관리</a>
                <a href="{{ route('studio.revenue') }}" @class(['is-active' => $studioSub === 'revenue']) @if ($studioSub === 'revenue') aria-current="page" @endif>수익 관리</a>
                <a href="{{ route('studio.comments') }}" @class(['is-active' => $studioSub === 'comment']) @if ($studioSub === 'comment') aria-current="page" @endif>댓글 관리</a>
            </div>
        </div>

        <a href="{{ route('faq') }}"><span class="mypage__side-nav-icon icon-faq" aria-hidden="true"></span>자주하는 질문</a>
        <a href="{{ route('inquiry') }}"><span class="mypage__side-nav-icon icon-inquiry" aria-hidden="true"></span>1:1 문의</a>
        <a href="{{ route('notice') }}"><span class="mypage__side-nav-icon icon-notice" aria-hidden="true"></span>공지사항</a>
        <a href="{{ route('event') }}"><span class="mypage__side-nav-icon icon-event" aria-hidden="true"></span>이벤트</a>
        <a href="{{ route('ai-tools') }}"><span class="mypage__side-nav-icon icon-aitool" aria-hidden="true"></span>AI 툴 도감</a>
    </nav>
</aside>
