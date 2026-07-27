@extends('layouts.app')

@section('title', $event['title'] . ' · 이벤트 · AIVEON')

@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 이벤트 상세 : 배너 → 개요 → 참여 방법 → 경품 → 유의사항 --}}
        <div class="mypage__content">
            <a href="{{ route('event') }}" class="board__back">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                이벤트
            </a>

            <article class="event-post">
                <figure class="event-post__banner">
                    <img src="{{ asset($event['thumb']) }}" alt="">
                </figure>

                <header class="event-post__head">
                    <span class="event-card__status event-card__status--{{ $event['status'] }}">{{ $event['statusLabel'] }}</span>
                    <h2 class="event-post__title">{{ $event['title'] }}</h2>
                    <p class="event-post__period">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M8 3v4M16 3v4M3.5 10h17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                        {{ $event['period'] }}
                    </p>
                </header>

                <p class="event-post__body">{!! nl2br(e($event['body'])) !!}</p>

                {{-- 참여 방법 --}}
                <section class="event-post__section">
                    <h3 class="event-post__subtitle">참여 방법</h3>
                    <ol class="event-steps">
                        @foreach ($event['how'] as $i => $step)
                            <li class="event-step">
                                <span class="event-step__num">{{ $i + 1 }}</span>
                                <span class="event-step__text">{{ $step }}</span>
                            </li>
                        @endforeach
                    </ol>
                </section>

                {{-- 경품 --}}
                <section class="event-post__section">
                    <h3 class="event-post__subtitle">경품 안내</h3>
                    <ul class="event-prizes">
                        @foreach ($event['prizes'] as $p)
                            <li class="event-prize">
                                <span class="event-prize__rank">{{ $p['rank'] }}</span>
                                <span class="event-prize__reward">{{ $p['reward'] }}</span>
                            </li>
                        @endforeach
                    </ul>
                </section>

                {{-- 유의사항 --}}
                <section class="event-post__section">
                    <h3 class="event-post__subtitle">유의사항</h3>
                    <ul class="event-notes">
                        @foreach ($event['notes'] as $note)
                            <li>{{ $note }}</li>
                        @endforeach
                    </ul>
                </section>

                @if ($event['status'] === 'ongoing')
                    <div class="event-post__cta">
                        <a href="{{ route('upload') }}" class="btn btn--primary">지금 참여하기</a>
                    </div>
                @else
                    <div class="event-post__cta">
                        <span class="event-post__ended">종료된 이벤트입니다.</span>
                    </div>
                @endif
            </article>
        </div>
    </section>
@endsection
