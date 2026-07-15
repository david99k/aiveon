@extends('layouts.app')

@section('title', $title['name'] . ' · AIVEON')

@section('content')
    {{-- 상세 히어로 (Figma 338:4681) --}}
    <section class="hero hero--detail">
        <div class="hero__bg">
            <img src="{{ asset($title['image']) }}" alt="">
        </div>

        <div class="hero__content">
            @if (!empty($title['badge']))
                <span class="hero__badge">{{ $title['badge'] }}</span>
            @endif

            <h2 class="hero__title">{{ $title['name'] }}</h2>

            @if (!empty($title['tags']))
                <ul class="hero__tags">
                    @foreach ($title['tags'] as $tag)
                        <li>{{ $tag }}</li>
                    @endforeach
                </ul>
            @endif

            @if (!empty($title['subscribe']))
                <span class="hero__subscribe">{{ $title['subscribe'] }}</span>
            @endif

            <p class="hero__synopsis">{!! nl2br(e($title['synopsis'])) !!} <a href="#" class="hero__more">더보기</a></p>

            <div class="hero__actions">
                <a href="{{ $title['play_url'] ?? '#' }}" class="btn btn--primary">바로재생</a>
                <a href="#" class="btn btn--ghost btn--icon">공유하기 <img src="{{ asset('images/common/ic_share.svg') }}" alt=""></a>
                <a href="#" class="btn btn--ghost btn--icon">저장하기 <img src="{{ asset('images/common/ic_bookmark.svg') }}" alt=""></a>
            </div>
        </div>
    </section>

    {{-- 에피소드 목록 (행 단위) --}}
    @foreach ($episodes as $i => $row)
        <x-video-row :title="'에피소드 ' . ($i * 6 + 1) . '~' . ($i * 6 + count($row)) . '화'" :items="$row" :hide-title="true" />
    @endforeach

    {{-- 함께 많이 찾는 영상 --}}
    <x-video-row :title="$title['name'] . '를 보시는 분들이 많이 찾는 영상'" :items="$related" />

    {{-- 추천 컨텐츠 --}}
    <section class="section section--poster">
        <h2 class="section__title">추천 컨텐츠</h2>

        <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="추천 컨텐츠">
            <ul class="poster-list">
                @foreach ($recommended as $item)
                    <li><x-poster-card :item="$item" /></li>
                @endforeach
            </ul>
        </div>
    </section>
@endsection
