@extends('layouts.app')

@section('title', '구독 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 구독 : 구독중인 크리에이터 + 구독 채널 최신 영상(크리에이터 무관 · 최신순) --}}
        <div class="mypage__content">
            <h2 class="mypage__page-title">구독</h2>

            {{-- 구독중인 크리에이터 --}}
            <section class="hub">
                <div class="hub__head">
                    <h3 class="hub__title">구독중인 크리에이터 <span class="hub__count">{{ count($creators) }}</span></h3>
                    <a href="#" class="hub__more">전체보기 &gt;</a>
                </div>
                <div class="scroll-x hub__row" data-scroll-x tabindex="0" role="region" aria-label="구독중인 크리에이터">
                    <ul class="creator-list">
                        @foreach ($creators as $creator)
                            <x-creator-item :creator="$creator" />
                        @endforeach
                    </ul>
                </div>
            </section>

            {{-- 구독 채널 최신 영상 --}}
            <section class="hub">
                <div class="hub__head">
                    <h3 class="hub__title">최신 영상</h3>
                    <span class="hub__note">구독중인 채널의 새 영상을 최신순으로 보여드려요</span>
                </div>

                <div class="fav-grid">
                    @foreach ($feed as $item)
                        <div class="poster-card sub-card">
                            <a href="{{ $item['url'] }}" class="poster-card__link">
                                <figure class="poster-card__thumb">
                                    <img src="{{ asset($item['thumb']) }}" alt="" loading="lazy">
                                    @if ($item['is_premium'])
                                        <span class="badge badge--premium">PREMIUM</span>
                                    @endif
                                    @if ($item['is_new'])
                                        <span class="sub-card__new">NEW</span>
                                    @endif
                                </figure>

                                <div class="poster-card__info">
                                    <strong class="poster-card__title">{{ $item['title'] }}</strong>
                                    <span class="poster-card__meta">
                                        <img class="poster-card__avatar" src="{{ asset($item['creator_avatar']) }}" alt="" loading="lazy">
                                        {{ $item['creator'] }}
                                    </span>
                                    <span class="sub-card__time">{{ $item['uploaded'] }}</span>
                                </div>
                            </a>
                        </div>
                    @endforeach
                </div>
            </section>
        </div>
    </section>
@endsection
