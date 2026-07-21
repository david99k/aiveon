@extends('layouts.app')

@section('title', ($pageTitle ?? 'AIVEON'))

{{-- 쇼츠·숏폼 : 히어로 없이 세로 포스터 카드 위주 (Sub - AI 쇼츠 / AI 숏폼 드라마) --}}
@section('content')
    <div class="cat-top-gap"></div>

    <x-poster-row title="추천영상" :items="$recommended" />

    {{-- AIVEON TOP6 (랭킹) --}}
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

    <x-poster-row title="새로운 영상" :items="$newNew" />
    <x-poster-row title="새로운 영상" :items="$newPremium" />

    {{-- AIVEON TOP6 (크리에이터) --}}
    <section class="section section--creator">
        <h2 class="section__title">AIVEON TOP6</h2>
        <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="AIVEON TOP6">
            <ul class="creator-list">
                @foreach ($creators as $creator)
                    <x-creator-item :creator="$creator" />
                @endforeach
            </ul>
        </div>
    </section>

    <x-poster-row title="가족과 함께 보면 좋은 영상" :items="$family" />
    <x-poster-row title="신기한 컨텐츠를 찾을 때" :items="$discover" />
@endsection
