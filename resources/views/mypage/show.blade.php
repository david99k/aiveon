@extends('layouts.app')

@section('title', '마이페이지 · AIVEON')

{{-- 마이페이지: 사이드바가 푸터까지 이어지도록 푸터 상단 여백 제거 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage mypage--library">
        @include('partials.mypage-sidebar')

        {{-- 모바일 전용 : 유튜브식 라이브러리 (프로필 + 시청 기록 + 메뉴). PC/태블릿은 우측 회원정보 폼. --}}
        <div class="mypage-lib">
            <div class="mypage-lib__profile">
                <img class="mypage-lib__avatar" src="{{ asset($account['avatar']) }}" alt="프로필 이미지">
                <div class="mypage-lib__id">
                    <strong class="mypage-lib__name">{{ $account['username'] }}</strong>
                    <a href="#" class="mypage-lib__channel">@synergy_on · 채널 보기 <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                </div>
            </div>

            <section class="mypage-lib__section" aria-label="시청 기록">
                <a href="#" class="mypage-lib__section-head">시청 기록 <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                <div class="scroll-x mypage-lib__row" data-scroll-x tabindex="0" role="region" aria-label="시청 기록">
                    @foreach ([['THE BETA','images/main/thumb_wide_beta.jpg','거스구스'],['궁의 어둠, 달의 노래','images/main/thumb_wide_palace.jpg','몽글스튜디오'],['알고리즘 러브','images/main/thumb_wide_algorithm.jpg','거스구스'],['아기 고양이의 모험','images/main/garo_img01.jpg','몽글스튜디오'],['한 소녀의 피클볼 도전기','images/main/garo_img02.jpg','거스구스']] as $h)
                        <a href="{{ route('detail') }}" class="mypage-lib__card">
                            <div class="mypage-lib__thumb"><img src="{{ asset($h[1]) }}" alt="" loading="lazy"></div>
                            <p class="mypage-lib__card-title">{{ $h[0] }}</p>
                            <p class="mypage-lib__card-meta">{{ $h[2] }}</p>
                        </a>
                    @endforeach
                </div>
            </section>

            <nav class="mypage-lib__menu" aria-label="마이페이지 메뉴">
                <a href="{{ route('mypage') }}"><img src="{{ asset('images/mypage/ic_setting.svg') }}" alt="">회원정보 변경</a>
                <a href="{{ route('favorites') }}"><img src="{{ asset('images/mypage/ic_favorite.svg') }}" alt="">즐겨찾기</a>
                <a href="{{ route('studio') }}"><img src="{{ asset('images/mypage/ic_creator.svg') }}" alt="">크리에이터 스튜디오</a>
                <a href="{{ route('faq') }}"><img src="{{ asset('images/mypage/ic_faq.svg') }}" alt="">고객센터</a>
                <a href="#"><img src="{{ asset('images/mypage/ic_notice.svg') }}" alt="">공지사항</a>
                <a href="#"><img src="{{ asset('images/mypage/ic_event.svg') }}" alt="">이벤트</a>
            </nav>
        </div>

        {{-- 우측 회원정보 폼 (PC/태블릿) --}}
        <div class="mypage__content">
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

            <div class="mypage__form">
                @foreach ($fields as $field)
                    <div class="mypage__field">
                        <span class="mypage__field-label">{{ $field['label'] }}</span>
                        <div class="mypage__field-box">
                            <span class="mypage__field-value{{ !empty($field['strong']) ? ' mypage__field-value--strong' : '' }}">{{ $field['value'] }}</span>
                            @if (!empty($field['change']))
                                <button type="button" class="mypage__field-change">변경</button>
                            @endif
                        </div>
                    </div>
                @endforeach

                <div class="mypage__field mypage__field--plain">
                    <span class="mypage__field-label">구독 내용</span>
                    <span class="mypage__field-plan">{{ $subscription }}</span>
                </div>
            </div>

            <div class="mypage__actions">
                <button type="button" class="mypage__btn mypage__btn--primary">완료</button>
                <button type="button" class="mypage__btn mypage__btn--cancel">취소</button>
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
