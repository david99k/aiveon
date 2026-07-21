@extends('layouts.app')

@section('title', 'AIVEON')

@section('content')
    {{-- 히어로 슬라이더 (카테고리 페이지 중 숏폼·19+ 는 히어로 없이 상단 여백) --}}
    @if (!empty($heroes))
        @include('partials.hero', ['heroes' => $heroes])
    @else
        <div class="cat-top-gap"></div>
    @endif

    {{-- 추천 영상 --}}
    <x-video-row title="추천 영상" :items="$recommended" />

    {{-- 시청중인 영상 --}}
    <x-video-row title="시청중인 영상" :items="$watching" />

    {{-- AIVEON TOP6 --}}
    <section class="section section--top">
        <h2 class="section__title">AIVEON TOP6</h2>

        <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="AIVEON TOP6">
            <ol class="rank-list">
                @foreach ($topList as $item)
                    <x-rank-card :item="$item" :rank="$loop->iteration" />
                @endforeach
            </ol>
        </div>
    </section>

    {{-- 새로운 영상 --}}
    <section class="section section--poster">
        <h2 class="section__title">새로운 영상</h2>

        <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="새로운 영상">
            <ul class="poster-list">
                @foreach ($newPosters as $item)
                    <li><x-poster-card :item="$item" /></li>
                @endforeach
            </ul>
        </div>
    </section>

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
    <x-video-row title="가족과 함께 볼 만한 영상" :items="$family" />

    {{-- 신기한 컨텐츠를 찾을 때 --}}
    <x-video-row title="신기한 컨텐츠를 찾을 때" :items="$discover" />
@endsection
