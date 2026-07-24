{{-- 마이페이지 좌측 계정 사이드바 (회원정보 / 즐겨찾기 / 자주하는 질문 공용) --}}
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
        <a href="{{ route('studio') }}"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_favorite.svg') }}" alt="">크리에이터</a>
        <a href="{{ route('faq') }}"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_faq.svg') }}" alt="">자주하는 질문</a>
        <a href="#"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_inquiry.svg') }}" alt="">1:1 문의</a>
        <a href="#"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_notice.svg') }}" alt="">공지사항</a>
        <a href="#"><img class="mypage__side-nav-icon" src="{{ asset('images/mypage/ic_event.svg') }}" alt="">이벤트</a>
    </nav>
</aside>
