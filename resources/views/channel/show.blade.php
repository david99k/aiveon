@extends('layouts.app')

@section('title', $channel['name'] . ' · AIVEON')

@section('content')
    {{-- 크리에이터 공개 채널 (유튜브 채널 페이지 구조 기반) --}}
    <section class="channel">
        {{-- 배너 --}}
        <div class="channel__banner">
            <img src="{{ asset($channel['banner']) }}" alt="">
        </div>

        {{-- 채널 헤더 : 아바타 + 기본 정보 + 구독 --}}
        <header class="channel__head">
            <img class="channel__avatar" src="{{ asset($channel['avatar']) }}" alt="">

            <div class="channel__id">
                <h1 class="channel__name">{{ $channel['name'] }}</h1>
                <p class="channel__meta">
                    <span class="channel__handle">{{ $channel['handle'] }}</span>
                    <span>구독자 {{ $channel['subscribers'] }}</span>
                    <span>영상 {{ $channel['videos'] }}개</span>
                </p>
                <p class="channel__tagline">{{ $channel['tagline'] }}
                    <a href="#channel-info" class="channel__more">더보기</a>
                </p>
            </div>

            <div class="channel__actions">
                <button type="button" class="btn btn--primary channel__subscribe js-channel-subscribe">구독</button>
                <button type="button" class="channel__bell" aria-label="알림 설정">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10.3 19a2 2 0 0 0 3.4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                </button>
            </div>
        </header>

        {{-- 탭 (고객센터 탭 패턴 재사용) --}}
        <div class="cs-tabs channel__tabs" role="tablist" aria-label="채널 메뉴">
            @foreach ($tabs as $tab)
                <button type="button" @class(['cs-tab', 'is-active' => !empty($tab['active'])]) role="tab" aria-selected="{{ !empty($tab['active']) ? 'true' : 'false' }}">{{ $tab['label'] }}</button>
            @endforeach
        </div>

        {{-- 대표 영상 --}}
        <section class="channel__featured">
            <a href="{{ $featured['url'] }}" class="channel__featured-thumb">
                <img src="{{ asset($featured['thumb']) }}" alt="">
            </a>
            <div class="channel__featured-info">
                <span class="channel__featured-label">대표 영상</span>
                <h2 class="channel__featured-title">{{ $featured['title'] }}</h2>
                <p class="channel__featured-meta">{{ $featured['meta'] }}</p>
                <p class="channel__featured-desc">{{ $featured['desc'] }}</p>
                <a href="{{ $featured['url'] }}" class="btn btn--primary">바로재생</a>
            </div>
        </section>

        {{-- 인기 / 최신 영상 (세로 포스터 행) --}}
        <x-poster-row title="인기 영상" :items="$popular" />
        <x-poster-row title="최신 영상" :items="$latest" />

        {{-- 재생목록 --}}
        <section class="section">
            <h2 class="section__title">재생목록</h2>
            <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="재생목록">
                <ul class="channel__playlists">
                    @foreach ($playlists as $pl)
                        <li class="channel__playlist">
                            <a href="#">
                                <span class="channel__playlist-thumb">
                                    <img src="{{ asset($pl['thumb']) }}" alt="" loading="lazy">
                                    <span class="channel__playlist-count">{{ $pl['count'] }}</span>
                                </span>
                                <strong class="channel__playlist-title">{{ $pl['title'] }}</strong>
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>
        </section>

        {{-- 채널 정보 --}}
        <section class="section" id="channel-info">
            <h2 class="section__title">채널 정보</h2>
            <div class="channel__info">
                <p class="channel__desc">{!! nl2br(e($channel['description'])) !!}</p>

                <dl class="channel__stats">
                    <div><dt>구독자</dt><dd>{{ $channel['subscribers'] }}</dd></div>
                    <div><dt>총 조회수</dt><dd>{{ $channel['views'] }}</dd></div>
                    <div><dt>영상</dt><dd>{{ $channel['videos'] }}개</dd></div>
                    <div><dt>가입일</dt><dd>{{ $channel['since'] }}</dd></div>
                </dl>

                {{-- 이 채널이 주로 쓰는 AI 툴 (AIVEON 고유 : 업로드 시 기록한 "사용한 AI") --}}
                <div class="channel__tools">
                    <span class="channel__tools-label">주로 사용하는 AI 툴</span>
                    <ul class="channel__tools-list">
                        @foreach ($channel['tools'] as $tool)
                            <li><a href="{{ route('ai-tools') }}">{{ $tool }}</a></li>
                        @endforeach
                    </ul>
                </div>

                <ul class="channel__links">
                    @foreach ($channel['links'] as $link)
                        <li><a href="{{ $link['url'] }}">{{ $link['label'] }}</a></li>
                    @endforeach
                </ul>
            </div>
        </section>
    </section>
@endsection
