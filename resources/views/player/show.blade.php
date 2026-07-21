@extends('layouts.app')

@section('title', ($shorts[0]['title'] ?? '쇼츠') . ' · AIVEON')

{{-- 몰입형 플레이어 화면: 푸터 제외 + 문서 스크롤 잠금 (Figma 338:5895) --}}
@section('hide-footer', '1')
@section('body-class', 'page-player')

@section('content')
    <section class="player">
        {{-- 세로 피드 : 위로 드래그하면 다음 쇼츠가 아래에서 올라온다 --}}
        <div class="player__feed js-player-feed">
            @foreach ($shorts as $short)
                <article class="player__slide{{ $loop->first ? ' is-active' : '' }}" data-slide="{{ $loop->index }}">
                    <div class="player__stage">
                        {{-- 콘텐츠 정보 : 데스크톱(≥1600)은 좌하단, 그 이하는 영상 위 오버레이 --}}
                        <div class="player__info">
                            <div class="player__channel">
                                <a href="#" class="player__channel-avatar"><img src="{{ asset($short['channel']['avatar']) }}" alt=""></a>
                                <a href="#" class="player__channel-name">{{ $short['channel']['name'] }}</a>
                                <button type="button" class="player__follow{{ $short['channel']['following'] ? '' : ' player__follow--primary' }}">{{ $short['channel']['following'] ? '팔로잉' : '팔로우' }}</button>
                            </div>

                            <h2 class="player__title">{{ $short['title'] }}</h2>

                            <ul class="hero__tags">
                                @foreach ($short['tags'] as $tag)
                                    <li>{{ $tag }}</li>
                                @endforeach
                                @foreach ($short['ratings'] as $rating)
                                    <li class="tag--age{{ preg_replace('/\D/', '', $rating) }}">{{ $rating }}</li>
                                @endforeach
                            </ul>

                            <p class="player__synopsis">{!! nl2br(e($short['synopsis'])) !!}<br><a href="#" class="player__more">더보기</a></p>

                            <div class="player__ai">
                                <a href="#" class="player__ai-label">사용 AI &nbsp;&gt;</a>
                                @foreach ($short['aiTools'] as $tool)
                                    <span class="player__ai-chip{{ $tool['light'] ? ' player__ai-chip--light' : '' }}"><img src="{{ asset($tool['icon']) }}" alt="{{ $tool['name'] }}"></span>
                                @endforeach
                            </div>
                        </div>

                        <div class="player__video">
                            <video class="player__poster js-player-video" src="{{ asset($short['source']) }}"
                                   poster="{{ asset($short['poster']) }}" muted {{ $loop->first ? 'autoplay' : '' }} loop playsinline preload="{{ $loop->first ? 'auto' : 'none' }}"></video>
                            <div class="player__grad"></div>
                            <button type="button" class="player__mute js-player-mute is-muted" aria-label="음소거 해제" aria-pressed="true">
                                <img class="icon-muted" src="{{ asset('images/player/ic_mute.svg') }}" alt="">
                                <svg class="icon-unmuted" viewBox="0 0 63 63" fill="none" aria-hidden="true"><circle cx="31.5" cy="31.5" r="31.5" fill="#000" fill-opacity="0.7"/><path d="M29.5 21.5c.8-.7 2-.13 2 .93v18.14c0 1.06-1.2 1.63-2 .93l-5.2-4.5h-3.3c-.9 0-1.5-.67-1.5-1.5v-8c0-.83.6-1.5 1.5-1.5h3.3l5.2-4.5Z" fill="#fff"/><path d="M36.5 26c1.7 1.3 2.7 3.3 2.7 5.5s-1 4.2-2.7 5.5M40 22.5c2.8 2.1 4.5 5.4 4.5 9s-1.7 6.9-4.5 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>
                            </button>
                            <button type="button" class="player__play" aria-label="재생">
                                <img src="{{ asset('images/player/ic_play.svg') }}" alt="">
                            </button>
                            <div class="player__progress" role="progressbar" aria-label="재생 진행률"
                                 aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{ $short['progress'] }}">
                                <span class="player__progress-fill" style="width: {{ $short['progress'] }}%"></span>
                            </div>
                        </div>

                        <aside class="player__rail" aria-label="영상 액션">
                            <div class="player__rail-item">
                                <button type="button" class="player__rail-btn" aria-label="좋아요">
                                    <img src="{{ asset('images/player/ic_heart.svg') }}" alt="">
                                </button>
                                <span class="player__rail-label">{{ $short['likes'] }}</span>
                            </div>
                            <div class="player__rail-item">
                                <button type="button" class="player__rail-btn js-comments-toggle" aria-label="댓글" aria-expanded="false" aria-controls="player-comments">
                                    <img src="{{ asset('images/player/ic_comment.svg') }}" alt="">
                                </button>
                                <span class="player__rail-label">{{ $short['comments'] }}</span>
                            </div>
                            <div class="player__rail-item">
                                <button type="button" class="player__rail-btn" aria-label="공유">
                                    <img src="{{ asset('images/player/ic_export.svg') }}" alt="">
                                </button>
                                <span class="player__rail-label">공유</span>
                            </div>
                            <div class="player__rail-item">
                                <button type="button" class="player__rail-btn player__rail-btn--more" aria-label="더보기">
                                    <img src="{{ asset('images/player/ic_more.svg') }}" alt="">
                                </button>
                                <span class="player__rail-label">더보기</span>
                            </div>
                            <a href="#" class="player__rail-thumb" aria-label="{{ $short['channel']['name'] }} 채널">
                                <img src="{{ asset($short['channel']['thumb']) }}" alt="">
                            </a>
                        </aside>
                    </div>
                </article>
            @endforeach
        </div>

        {{-- 댓글 패널 : 댓글 버튼 클릭 시 오른쪽에서 슬라이드 인 (Figma 498:2734) --}}
        <aside class="player__comments" id="player-comments" aria-label="댓글" aria-hidden="true">
            <div class="player__comments-head">
                <h3 class="player__comments-title">댓글</h3>
                <button type="button" class="player__comments-close js-comments-close" aria-label="댓글 닫기">
                    <svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </button>
            </div>

            <ul class="player__comments-list">
                @foreach ($comments as $comment)
                    <li class="comment{{ !empty($comment['is_mine']) ? ' is-mine' : '' }}">
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

            <div class="player__comments-form">
                <span class="comment__avatar"><img src="{{ asset('images/main/creator_profile_04.jpg') }}" alt=""></span>
                <input type="text" class="player__comments-input" placeholder="댓글 추가..." aria-label="댓글 입력">
            </div>
            <div class="player__comments-actions">
                <button type="button" class="player__comments-cancel">취소</button>
                <button type="button" class="player__comments-submit">댓글</button>
            </div>
        </aside>
    </section>
@endsection
