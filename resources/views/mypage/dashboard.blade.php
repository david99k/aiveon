@extends('layouts.app')

@section('title', '마이페이지 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    {{--
        마이페이지 대시보드 (회원정보 + 허브 통합 · 단일 진입점).
        - 데스크톱 : 프로필 헤더 + 요약 카드 + 시청 기록 + 즐겨찾기 + 회원정보 카드
        - 모바일   : 유튜브식 라이브러리(.mypage-lib) + "회원정보 변경" 탭 전환(is-account-open)
        우측 상단 프로필 메뉴·하단 독·사이드바의 "마이페이지"가 모두 이 화면으로 온다.
    --}}
    <section class="mypage mypage--library">
        @include('partials.mypage-sidebar')

        {{-- 모바일 전용 : 라이브러리 (프로필 + 시청 기록 + 메뉴) --}}
        <div class="mypage-lib">
            <div class="mypage-lib__profile">
                <img class="mypage-lib__avatar" src="{{ asset($account['avatar']) }}" alt="프로필 이미지">
                <div class="mypage-lib__id">
                    <strong class="mypage-lib__name">{{ $account['username'] }}</strong>
                    <a href="{{ route('channel') }}" class="mypage-lib__channel">@synergy_on · 채널 보기 <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                </div>
            </div>

            <section class="mypage-lib__section" aria-label="시청 기록">
                <span class="mypage-lib__section-head">시청 기록</span>
                <div class="scroll-x mypage-lib__row" data-scroll-x tabindex="0" role="region" aria-label="시청 기록">
                    @foreach ($history as $item)
                        <a href="{{ $item['url'] }}" class="mypage-lib__card">
                            <div class="mypage-lib__thumb"><img src="{{ asset($item['thumb']) }}" alt="" loading="lazy"></div>
                            <p class="mypage-lib__card-title">{{ $item['title'] }}</p>
                            <p class="mypage-lib__card-meta">{{ $item['creator'] }}</p>
                        </a>
                    @endforeach
                </div>
            </section>

            <nav class="mypage-lib__menu" aria-label="마이페이지 메뉴">
                <a href="#account" class="js-account-open"><span class="mypage-lib__menu-icon icon-setting" aria-hidden="true"></span>회원정보 변경</a>
                <a href="{{ route('subscriptions') }}"><span class="mypage-lib__menu-icon icon-subscribe" aria-hidden="true"></span>구독</a>
                <a href="{{ route('studio') }}"><span class="mypage-lib__menu-icon icon-creator" aria-hidden="true"></span>크리에이터 스튜디오</a>
                <a href="{{ route('faq') }}"><span class="mypage-lib__menu-icon icon-faq" aria-hidden="true"></span>고객센터</a>
                <a href="{{ route('inquiries') }}"><span class="mypage-lib__menu-icon icon-inquiry" aria-hidden="true"></span>내 문의 내역</a>
                <a href="{{ route('notice') }}"><span class="mypage-lib__menu-icon icon-notice" aria-hidden="true"></span>공지사항</a>
                <a href="{{ route('event') }}"><span class="mypage-lib__menu-icon icon-event" aria-hidden="true"></span>이벤트</a>
                <a href="{{ route('ai-tools') }}"><span class="mypage-lib__menu-icon icon-aitool" aria-hidden="true"></span>AI 툴 도감</a>
            </nav>
        </div>

        {{-- 데스크톱 : 대시보드 (내 채널 관리와 동일 폭) --}}
        <div class="mypage__content mypage__content--dash">
            <h2 class="mypage__page-title">마이페이지</h2>

            {{-- 프로필 헤더 --}}
            <div class="mypage__header">
                <div class="mypage__avatar-wrap">
                    <img class="mypage__avatar" src="{{ asset($account['avatar']) }}" alt="프로필 이미지">
                    <button type="button" class="mypage__avatar-gear" aria-label="프로필 이미지 변경">
                        <img src="{{ asset('images/mypage/ic_setting.svg') }}" alt="">
                    </button>
                </div>
                <div class="mypage__identity">
                    <strong class="mypage__username">{{ $account['username'] }}</strong>
                    <div class="mypage__stats">
                        <span>게시물 {{ $account['posts'] }}</span>
                        <span>구독자 {{ $account['subscribers'] }}</span>
                    </div>
                </div>
            </div>

            {{-- 요약 카드 : 구독 플랜 / 시청 기록 / 즐겨찾기 / 내 문의 --}}
            <div class="mydash-cards">
                <a href="#" class="mydash-card">
                    <p class="mydash-card__label">구독 중인 플랜</p>
                    {{-- .js-plan-label : 프리미엄 데모 토글(initAuthDemo)이 Free/Premium 을 동기화 --}}
                    <p class="mydash-card__value js-plan-label">{{ $subscription }}</p>
                    <p class="mydash-card__sub">프리미엄으로 더 많은 콘텐츠 보기</p>
                </a>
                <a href="#history" class="mydash-card">
                    <p class="mydash-card__label">시청 기록</p>
                    <p class="mydash-card__value"><em>{{ count($history) }}</em>편</p>
                    <p class="mydash-card__sub">이어보기 : {{ $history[0]['title'] }}</p>
                </a>
                <a href="#favorites" class="mydash-card">
                    <p class="mydash-card__label">즐겨찾기</p>
                    <p class="mydash-card__value"><em>{{ count($favorites) }}</em>편</p>
                    <p class="mydash-card__sub">찜한 콘텐츠 모아보기</p>
                </a>
                <a href="{{ route('inquiries') }}" class="mydash-card">
                    <p class="mydash-card__label">내 문의 내역</p>
                    <p class="mydash-card__value"><em>{{ $inquirySummary['total'] }}</em>건</p>
                    <p class="mydash-card__sub">처리중 {{ $inquirySummary['progress'] }}건 · 답변 완료 {{ $inquirySummary['answered'] }}건</p>
                </a>
            </div>

            {{-- 회원정보 (사이드바 "회원정보 변경 >" · 모바일 라이브러리 메뉴에서 진입) --}}
            <section class="mydash-account" id="account" aria-label="회원정보">
                <button type="button" class="mydash-back js-account-back" aria-label="마이페이지로 돌아가기">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <h3 class="mydash-account__title">회원정보</h3>

                <div class="mypage__form">
                    @foreach ($fields as $field)
                        <div class="mypage__field">
                            <span class="mypage__field-label">{{ $field['label'] }}</span>
                            <div class="mypage__field-box">
                                <span class="mypage__field-value">{{ $field['value'] }}</span>
                                <button type="button" class="mypage__field-change">변경</button>
                            </div>
                        </div>
                    @endforeach

                    <div class="mypage__field mypage__field--plain">
                        <span class="mypage__field-label">구독 내용</span>
                        <span class="mypage__field-plan js-plan-label">{{ $subscription }}</span>
                    </div>
                </div>

                <div class="mypage__actions">
                    <button type="button" class="mypage__btn mypage__btn--primary">완료</button>
                    <button type="button" class="mypage__btn mypage__btn--cancel">취소</button>
                </div>
            </section>

            {{-- 시청 기록 · 즐겨찾기 : 좌우 패널 (크리에이터 스튜디오 "최근 콘텐츠 성과" 패턴 재사용) --}}
            <div class="studio__grid mydash-grid">
                <section class="studio__panel mydash-section" id="history" aria-label="시청 기록">
                    <h3 class="studio__panel-title">시청 기록 <a href="{{ route('history') }}" class="studio__panel-more">전체보기 &gt;</a></h3>
                    @foreach ($history as $item)
                        <a href="{{ $item['url'] }}" class="studio__row">
                            <span class="studio__row-thumb"><img src="{{ asset($item['thumb']) }}" alt="" loading="lazy"></span>
                            <span class="studio__row-title">{{ $item['title'] }}</span>
                            <span class="studio__row-meta">{{ $item['creator'] }}</span>
                            <span class="st-badge st-badge--review">{{ str_replace('지난 시청 ', '', $item['progress']) }}</span>
                        </a>
                    @endforeach
                </section>

                <section class="studio__panel mydash-section" id="favorites" aria-label="즐겨찾기">
                    <h3 class="studio__panel-title">즐겨찾기 <a href="{{ route('favorites') }}" class="studio__panel-more">전체보기 &gt;</a></h3>
                    @foreach (array_slice($favorites, 0, count($history)) as $item)
                        <a href="{{ $item['url'] }}" class="studio__row">
                            <span class="studio__row-thumb"><img src="{{ asset($item['thumb']) }}" alt="" loading="lazy"></span>
                            <span class="studio__row-title">{{ $item['title'] }}</span>
                            <span class="studio__row-meta">{{ $item['creator'] }}</span>
                            <span class="st-badge st-badge--live">PREMIUM</span>
                        </a>
                    @endforeach
                </section>
            </div>
        </div>
    </section>

    {{-- 프로필 이미지 변경 팝업 (아바타 기어 배지 클릭 시) --}}
    <div class="modal js-avatar-modal" id="modal-avatar" role="dialog" aria-modal="true" aria-labelledby="modal-avatar-title">
        <div class="modal__box">
            <div class="modal__head">
                <h2 class="modal__title" id="modal-avatar-title">프로필 이미지 변경</h2>
                <button type="button" class="modal__close js-avatar-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </div>
            <div class="avatar-modal">
                <img class="avatar-modal__preview js-avatar-preview" src="{{ asset($account['avatar']) }}" alt="현재 프로필 이미지">
                <input type="file" accept="image/*" class="js-avatar-file" hidden>
                <div class="avatar-modal__buttons">
                    <button type="button" class="btn btn--primary js-avatar-change">사진 변경</button>
                    <button type="button" class="btn btn--ghost js-avatar-delete">사진 삭제</button>
                </div>
            </div>
        </div>
    </div>
@endsection
