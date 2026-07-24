@extends('layouts.app')

@section('title', ($pageTitle ?? 'AIVEON'))

@section('content')
    {{-- 상단 비주얼 (2026-07-23) :
         · 추천(홈) → 빅 히어로 3-슬라이드(Swiper)
         · 드라마/영화/애니메이션/BL → 카테고리 전용 빅 히어로
         · 성인19+ → 세로 포스터 캐러셀(상단 배너)
         · 그 외 → 상단 여백 --}}
    @if (!empty($heroPosters))
        @include('partials.poster-banner', ['posters' => $heroPosters])
    @elseif (!empty($heroes))
        @include('partials.hero', ['heroes' => $heroes])
    @else
        <div class="cat-top-gap"></div>
    @endif

    {{-- 시청중인 영상 --}}
    <x-poster-row title="시청중인 영상" :items="$watching" />

    {{-- AIVEON TOP 10 --}}
    <section class="section section--top">
        <h2 class="section__title">AIVEON TOP 10</h2>

        <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="AIVEON TOP 10">
            <ol class="rank-list">
                @foreach ($topList as $item)
                    <x-rank-card :item="$item" :rank="$loop->iteration" />
                @endforeach
            </ol>
        </div>
    </section>

    {{-- 새로운 영상 --}}
    <x-poster-row title="새로운 영상" :items="$newPosters" />

    {{-- 크리에이터 --}}
    <section class="section section--creator">
        <h2 class="section__title">{{ $creatorSectionTitle }}</h2>

        <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="{{ $creatorSectionTitle }}">
            <ul class="creator-list">
                @foreach ($creators as $creator)
                    <x-creator-item :creator="$creator" />
                @endforeach
            </ul>
        </div>
    </section>

    {{-- 가족과 함께 볼 만한 영상 --}}
    <x-poster-row title="가족과 함께 볼 만한 영상" :items="$family" />

    {{-- 신기한 컨텐츠를 찾을 때 --}}
    <x-poster-row title="신기한 컨텐츠를 찾을 때" :items="$discover" />
@endsection
