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

    <a href="{{ route('mypage') }}" class="mypage__side-edit">회원정보 변경 &gt;</a>
    <a href="#" class="mypage__subscribe">Premium 구독</a>

    <hr class="mypage__side-divider">

    <nav class="mypage__side-nav" aria-label="마이페이지 메뉴">
        <a href="{{ route('favorites') }}"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_favorite.svg') }}" alt="">즐겨찾기</a>

        {{-- 크리에이터 스튜디오 : 아코디언 (내 채널 관리 / 콘텐츠 관리 / 수익 관리 / 댓글 관리) --}}
        <div class="mypage__side-group{{ $studioOpen ? ' is-open' : '' }}{{ $studioSub ? ' is-active' : '' }}">
            <button type="button" class="mypage__side-parent js-studio-toggle" aria-expanded="{{ $studioOpen ? 'true' : 'false' }}">
                <img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_creator.svg') }}" alt="">
                크리에이터 스튜디오
                <svg class="mypage__side-parent-chevron" viewBox="0 0 14 8" fill="none" aria-hidden="true"><path d="M1 1l6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="mypage__side-sub">
                <a href="{{ route('studio') }}" @class(['is-active' => $studioSub === 'channel']) @if ($studioSub === 'channel') aria-current="page" @endif>내 채널 관리</a>
                <a href="{{ route('studio.content') }}" @class(['is-active' => $studioSub === 'content']) @if ($studioSub === 'content') aria-current="page" @endif>콘텐츠 관리</a>
                <a href="#" @class(['is-active' => $studioSub === 'revenue'])>수익 관리</a>
                <a href="#" @class(['is-active' => $studioSub === 'comment'])>댓글 관리</a>
            </div>
        </div>

        <a href="{{ route('faq') }}"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_faq.svg') }}" alt="">자주하는 질문</a>
        <a href="{{ route('inquiry') }}"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_inquiry.svg') }}" alt="">1:1 문의</a>
        <a href="#"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_notice.svg') }}" alt="">공지사항</a>
        <a href="#"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_event.svg') }}" alt="">이벤트</a>
    </nav>
</aside>
