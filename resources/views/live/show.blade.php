@extends('layouts.app')

@section('title', $video['title'] . ' · AIVEON')

{{-- 라이브 시청 페이지: 푸터 제외 (Figma "Main - 재생버튼 클릭시 - 라이브") --}}
@section('hide-footer', '1')

@section('content')
    <section class="watch">
        {{-- 좌측 : 플레이어 + 정보 + 댓글 --}}
        <div class="watch__main">
            <div class="watch__col-a">
            <div class="watch__player">
                <video class="js-watch-video" src="{{ asset($video['source']) }}"
                       poster="{{ asset($video['poster']) }}" playsinline preload="metadata"></video>
                <div class="watch__player-grad"></div>

                <div class="watch__topbar">
                    <a href="{{ route('main') }}" class="watch__back" aria-label="뒤로 가기"><img src="{{ asset('images/watch/ic_back.svg') }}" alt=""></a>
                    <div>
                        <p class="watch__topbar-title">{{ $video['topbarTitle'] }}</p>
                        <p class="watch__topbar-sub">{{ $video['topbarSub'] }}</p>
                    </div>
                </div>

                <button type="button" class="watch__play-center" aria-label="재생">
                    <img src="{{ asset('images/player/ic_play.svg') }}" alt="">
                </button>

                <div class="watch__progress" role="progressbar" aria-label="재생 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                    <span class="watch__progress-fill" style="width: 0%"></span>
                </div>

                <div class="watch__controls">
                    <button type="button" class="watch__ctrl watch__ctrl--play js-watch-play" aria-label="재생/일시정지">
                        <img src="{{ asset('images/watch/ic_play_sm.svg') }}" alt="">
                    </button>
                    <div class="watch__volume">
                        <button type="button" class="watch__ctrl watch__ctrl--mute js-watch-mute" aria-label="음소거" aria-pressed="false">
                            <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3Z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                            <svg class="icon-muted" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3Z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                        </button>
                        <input type="range" class="watch__volume-slider js-watch-volume" min="0" max="1" step="0.05" value="1" aria-label="음량 조절">
                    </div>
                    <span class="watch__time js-watch-time">0:00 / 0:00</span>
                    <button type="button" class="watch__ctrl watch__ctrl--full js-watch-full" aria-label="전체화면">
                        <img src="{{ asset('images/watch/ic_expand.svg') }}" alt="">
                    </button>
                </div>
            </div>

            <div class="watch__head">
                <div>
                    <h2 class="watch__title">{{ $video['title'] }}</h2>
                </div>
                <div class="watch__actions">
                    <a href="#" class="btn btn--ghost btn--icon">공유하기 <img src="{{ asset('images/common/ic_share.svg') }}" alt=""></a>
                    <a href="#" class="btn btn--ghost btn--icon">저장하기 <img src="{{ asset('images/common/ic_bookmark.svg') }}" alt=""></a>
                </div>
            </div>

            <div class="watch__info">
                <div class="player__channel">
                    <a href="#" class="player__channel-avatar"><img src="{{ asset($channel['avatar']) }}" alt=""></a>
                    <a href="#" class="player__channel-name">{{ $channel['name'] }}</a>
                    <button type="button" class="player__follow{{ $channel['following'] ? '' : ' player__follow--primary' }}">{{ $channel['following'] ? '팔로잉' : '팔로우' }}</button>
                </div>

                <ul class="hero__tags">
                    @foreach ($video['tags'] as $tag)
                        <li>{{ $tag }}</li>
                    @endforeach
                    @foreach ($video['ratings'] as $rating)
                        <li class="tag--age{{ preg_replace('/\D/', '', $rating) }}">{{ $rating }}</li>
                    @endforeach
                </ul>

                <div class="player__ai">
                    <a href="#" class="player__ai-label">사용 AI &nbsp;&gt;</a>
                    @foreach ($aiTools as $tool)
                        <span class="player__ai-chip{{ $tool['light'] ? ' player__ai-chip--light' : '' }}"><img src="{{ asset($tool['icon']) }}" alt="{{ $tool['name'] }}"></span>
                    @endforeach
                </div>

                {{-- 라이브 : 시청자수 + 설명 + 해시태그 (시청 페이지의 시놉시스 자리) --}}
                <div class="watch__live-meta">
                    <p class="watch__live-viewers"><span class="watch__live-dot" aria-hidden="true"></span>현재 <strong>{{ $video['viewers'] }}명</strong> 시청중</p>
                    <p class="watch__live-desc">{{ $video['description'] }}</p>
                    <p class="watch__hashtags">
                        @foreach ($video['hashtags'] as $tag)<a href="#">#{{ $tag }}</a>@endforeach
                    </p>
                </div>
            </div>

            </div>{{-- /.watch__col-a --}}

            {{-- 댓글 영역 --}}
            <div class="watch__discuss">
            <div class="watch__divider"></div>

            <div class="watch__comment-form">
                <span class="comment__avatar"><img src="{{ asset('images/main/creator_profile_04.jpg') }}" alt=""></span>
                <textarea class="watch__comment-input" placeholder="댓글 추가..." aria-label="댓글 입력"></textarea>
            </div>
            <div class="player__comments-actions">
                <button type="button" class="player__comments-cancel">취소</button>
                <button type="button" class="player__comments-submit">댓글</button>
            </div>

            <ul class="watch__comments">
                @foreach ($comments as $comment)
                    <li class="comment{{ $comment['is_reply'] ? ' comment--reply' : '' }}{{ !empty($comment['is_mine']) ? ' is-mine' : '' }}">
                        <span class="comment__avatar"><img src="{{ asset($comment['avatar']) }}" alt=""></span>
                        <div class="comment__body">
                            <div class="comment__meta"><span class="comment__name">{{ $comment['user'] }}</span><span class="comment__date">{{ $comment['date'] }}</span></div>
                            <p class="comment__text">{{ $comment['text'] }}</p>
                            <div class="comment__actions">
                                <button type="button"><img src="{{ asset('images/player/ic_heart.svg') }}" alt="">좋아요</button>
                                <button type="button">답글</button>
                            </div>
                        </div>
                        @if ($isLoggedIn)
                            {{-- 더보기 : 내 댓글=수정·삭제, 타인 댓글=신고하기 (노출은 .is-mine 기준 CSS 제어) --}}
                            <button type="button" class="comment__more js-comment-more" aria-label="댓글 옵션" aria-haspopup="true" aria-expanded="false"><img src="{{ asset('images/player/ic_more.svg') }}" alt=""></button>
                            <div class="comment__menu" role="menu">
                                <button type="button" class="comment__menu-item comment__menu-item--edit" role="menuitem">수정</button>
                                <button type="button" class="comment__menu-item comment__menu-item--delete" role="menuitem">삭제</button>
                                <button type="button" class="comment__menu-item comment__menu-item--report" role="menuitem">신고하기</button>
                            </div>
                        @endif
                    </li>
                @endforeach
            </ul>
            </div>{{-- /.watch__discuss --}}
        </div>

        {{-- 우측 사이드바 : Live 채널 + 광고 + 추천 영상 --}}
        <aside class="watch__side">
            <section class="watch__live-panel" aria-label="라이브 채널 목록">
                <h3 class="watch__live-title">Live 채널</h3>
                <ul class="watch__live-list">
                    @foreach ($liveChannels as $ch)
                        <li class="watch__live-item">
                            <a href="{{ route('live') }}" class="watch__live-thumb"><img src="{{ asset($ch['thumb']) }}" alt="" loading="lazy"></a>
                            <div class="watch__live-body">
                                <p class="watch__live-name">{{ $ch['title'] }}</p>
                                <p class="watch__live-time">{{ $ch['time'] }}</p>
                            </div>
                        </li>
                    @endforeach
                </ul>
            </section>

            {{-- 이벤트 배너(광고) : 추천 영상 위 --}}
            <a href="#" class="watch__ad" aria-label="광고">
                <img src="{{ asset('images/watch/ad_banner.jpg') }}" alt="FAITH THROUGH HARDSHIP - BORCELLE CHURCH 광고">
            </a>

            {{-- 추천 영상 : PC=이벤트 배너 아래 세로 나열 · 모바일=가로 스크롤 --}}
            <section class="watch__rec-section">
                <h3 class="watch__side-title">추천 영상</h3>
                <ul class="watch__rec-list" data-scroll-x tabindex="0" role="region" aria-label="추천 영상">
                    @foreach ($recommended as $rec)
                        <li>
                            <a href="{{ $rec['url'] }}" class="watch__rec">
                                <span class="watch__rec-thumb"><img src="{{ asset($rec['thumb']) }}" alt="" loading="lazy"></span>
                                <span class="watch__rec-body">
                                    <span class="watch__rec-title">{{ $rec['title'] }}</span>
                                    <span class="watch__rec-meta">{{ $rec['meta'] }}</span>
                                </span>
                            </a>
                        </li>
                    @endforeach
                </ul>
            </section>
        </aside>
    </section>
@endsection
