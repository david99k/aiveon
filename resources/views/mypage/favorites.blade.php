@extends('layouts.app')

@section('title', '마이페이지 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 마이페이지 허브 : 시청 기록 + 즐겨찾기 (구독중인 크리에이터는 "구독" 페이지로 분리) --}}
        <div class="mypage__content">
            <h2 class="mypage__page-title">마이페이지</h2>

            {{-- 시청 기록 --}}
            <section class="hub">
                <div class="hub__head">
                    <h3 class="hub__title">시청 기록</h3>
                    <a href="#" class="hub__more">전체보기 &gt;</a>
                </div>
                <div class="scroll-x hub__row" data-scroll-x tabindex="0" role="region" aria-label="시청 기록">
                    <ul class="poster-list">
                        @foreach ($history as $item)
                            <li>
                                <div class="poster-card hub-history">
                                    <a href="{{ $item['url'] }}" class="poster-card__link">
                                        <figure class="poster-card__thumb">
                                            <img src="{{ asset($item['thumb']) }}" alt="" loading="lazy">
                                            <span class="hub-history__progress">{{ $item['progress'] }}</span>
                                        </figure>
                                        <div class="poster-card__info">
                                            <strong class="poster-card__title">{{ $item['title'] }}</strong>
                                            <span class="poster-card__meta">
                                                <img class="poster-card__avatar" src="{{ asset($item['creator_avatar']) }}" alt="" loading="lazy">
                                                {{ $item['creator'] }} · 조회수 {{ $item['views'] }}
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </section>

            {{-- 즐겨찾기 --}}
            <section class="hub">
                <div class="hub__head">
                    <h3 class="hub__title">즐겨찾기 <span class="hub__count">{{ count($favorites) }}</span></h3>
                </div>
                <div class="fav-grid">
                    @foreach ($favorites as $item)
                        <x-poster-card :item="$item" />
                    @endforeach
                </div>
            </section>
        </div>
    </section>
@endsection
