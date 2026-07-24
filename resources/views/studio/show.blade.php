@extends('layouts.app')

@section('title', '크리에이터 스튜디오 · AIVEON')

{{-- 마이페이지 셸 재사용 : 사이드바가 푸터까지 이어지도록 --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        {{-- 좌측 스튜디오 사이드바 --}}
        <aside class="mypage__side" aria-label="크리에이터 스튜디오 메뉴">
            <div class="mypage__profile">
                <img class="mypage__profile-avatar" src="{{ asset($channel['avatar']) }}" alt="">
                <div>
                    <p class="mypage__profile-name">synergy_on</p>
                    <p class="mypage__profile-plan">크리에이터</p>
                </div>
            </div>

            <a href="#" class="mypage__side-edit">내 채널 보기 &gt;</a>
            <a href="{{ route('upload') }}" class="mypage__subscribe">영상 업로드</a>

            <hr class="mypage__side-divider">

            <nav class="mypage__side-nav" aria-label="스튜디오 메뉴">
                <a href="{{ route('studio') }}" class="is-active" aria-current="page">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 18.4c1-2.2 3-3.4 5.5-3.4s4.5 1.2 5.5 3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    내 채널관리
                </a>
                <a href="#">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 9.5v5l4.2-2.5-4.2-2.5Z" fill="currentColor"/></svg>
                    콘텐츠 관리
                </a>
                <a href="#">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.6"/><path d="M16 14.5h2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    수익 관리
                </a>
                <a href="#">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12a8 8 0 1 0-3.1 6.3L21 19.5l-.9-3A7.9 7.9 0 0 0 21 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
                    댓글 관리
                </a>
                <a href="#">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    라이브 관리
                </a>
                <a href="#">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    채널 설정
                </a>
            </nav>
        </aside>

        {{-- 우측 : 내 채널관리 (대시보드) --}}
        <div class="mypage__content mypage__content--studio">
            <h2 class="studio__title">내 채널</h2>

            {{-- 데뷔 영상 업로드 안내 : 크리에이터 신청 완료 → 데뷔 영상 3개 제출 상태에서 노출 --}}
            @if (!empty($apply))
                <section class="studio__apply" aria-label="데뷔 영상 업로드 안내">
                    <div class="studio__apply-info">
                        <span class="studio__apply-badge">신청완료</span>
                        <h3 class="studio__apply-title">데뷔 영상을 올려주세요</h3>
                        <p class="studio__apply-desc">{{ $apply['total'] }}개의 영상을 올려주시면 내부 심사(IP · 계정 중복 확인)가 시작됩니다.</p>
                        <div class="studio__apply-progress">
                            <div class="studio__apply-track"><span class="studio__apply-fill" style="width: {{ round($apply['done'] / $apply['total'] * 100, 1) }}%"></span></div>
                            <span class="studio__apply-count">{{ $apply['done'] }}/{{ $apply['total'] }}</span>
                        </div>
                    </div>
                    <a href="{{ route('upload') }}" class="btn btn--primary studio__apply-btn">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v3.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                        영상 업로드
                    </a>
                </section>
            @endif

            {{-- 채널 프로필 --}}
            <section class="studio__channel" aria-label="채널 프로필">
                <div class="studio__channel-row">
                    <img class="studio__channel-avatar" src="{{ asset($channel['avatar']) }}" alt="채널 프로필 이미지">
                    <div class="studio__channel-info">
                        <div class="studio__channel-name">{{ $channel['name'] }} <span class="studio__creator-badge">크리에이터</span></div>
                        <p class="studio__channel-meta">{{ $channel['handle'] }} · 구독자 {{ $channel['subscribers'] }} · 영상 {{ $channel['videos'] }}개</p>
                    </div>
                    <div class="studio__channel-actions">
                        <a href="#" class="btn btn--ghost">채널 보기</a>
                        <a href="#" class="btn btn--primary">채널 편집</a>
                    </div>
                </div>
            </section>

            {{-- 핵심 지표 --}}
            <div class="studio__stats" aria-label="채널 핵심 지표">
                @foreach ($stats as $stat)
                    <div class="studio__stat">
                        <p class="studio__stat-label">{{ $stat['label'] }}</p>
                        <p class="studio__stat-value">{{ $stat['value'] }}</p>
                        <p class="studio__stat-diff studio__stat-diff--{{ $stat['dir'] }}">{{ $stat['diff'] }}</p>
                    </div>
                @endforeach
                <div class="studio__stat studio__stat--accent">
                    <p class="studio__stat-label">{{ $revenue['label'] }}</p>
                    <p class="studio__stat-value">{{ $revenue['value'] }}</p>
                    <a href="#" class="studio__stat-link">수익 관리 &gt;</a>
                </div>
            </div>

            {{-- 최근 콘텐츠 성과 / 할 일·알림 --}}
            <div class="studio__grid">
                <section class="studio__panel" aria-label="최근 콘텐츠 성과">
                    <h3 class="studio__panel-title">최근 콘텐츠 성과 <a href="#" class="studio__panel-more">콘텐츠 관리 &gt;</a></h3>

                    @foreach ($recent as $item)
                        <div class="studio__row">
                            <span class="studio__row-thumb"><img src="{{ asset($item['thumb']) }}" alt=""></span>
                            <span class="studio__row-title">{{ $item['title'] }}</span>
                            <span class="studio__row-meta">{{ $item['views'] }}</span>
                            <span class="st-badge st-badge--{{ $item['status'] }}">{{ $item['statusLabel'] }}</span>
                        </div>
                    @endforeach
                </section>

                <section class="studio__panel" aria-label="할 일 및 알림">
                    <h3 class="studio__panel-title">할 일 · 알림</h3>

                    <div class="studio__todo">
                        @foreach ($todos as $todo)
                            <a href="#">
                                @if ($todo['type'] === 'reject')
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4 21.5 20h-19L12 4Z" stroke="var(--field-error)" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10.5v4" stroke="var(--field-error)" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="0.9" fill="var(--field-error)"/></svg>
                                @elseif ($todo['type'] === 'review')
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="var(--brand-primary)" stroke-width="1.6"/><path d="M12 7.5V12l3 2" stroke="var(--brand-primary)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                @else
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="var(--accent-premium)" stroke-width="1.6"/><path d="M3 10h18" stroke="var(--accent-premium)" stroke-width="1.6"/></svg>
                                @endif
                                <span>{{ $todo['text'] }}
                                    <span class="studio__todo-sub">{{ $todo['sub'] }}</span>
                                </span>
                            </a>
                        @endforeach
                    </div>
                </section>
            </div>
        </div>
    </section>
@endsection
