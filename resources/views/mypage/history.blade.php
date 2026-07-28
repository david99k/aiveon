@extends('layouts.app')

@section('title', '시청 기록 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 : 시청 기록 전체 (포스터 썸네일 그리드 + 스크롤 배치 로딩) --}}
        <div class="mypage__content mypage__content--dash">
            <h2 class="mypage__page-title">시청 기록 <span class="hub__count">{{ count($history) }}</span></h2>
            <p class="history-note">최근에 본 콘텐츠부터 표시됩니다. 스크롤을 내리면 {{ $batch }}개씩 이어서 불러옵니다.</p>

            <div class="fav-grid history-grid js-more" data-more-batch="{{ $batch }}">
                @foreach ($history as $i => $item)
                    <div class="poster-card hub-history js-more-item" @if ($i >= $batch) hidden @endif>
                        <a href="{{ $item['url'] }}" class="poster-card__link">
                            <figure class="poster-card__thumb">
                                <img src="{{ asset($item['thumb']) }}" alt="" loading="lazy">
                                <span class="hub-history__progress">지난 시청 {{ $item['progress'] }}</span>
                            </figure>
                            <div class="poster-card__info">
                                <strong class="poster-card__title">{{ $item['title'] }}</strong>
                                <span class="poster-card__meta">
                                    <img class="poster-card__avatar" src="{{ asset($item['creator_avatar']) }}" alt="" loading="lazy">
                                    {{ $item['creator'] }} · {{ $item['watched'] }} 시청
                                </span>
                            </div>
                        </a>
                    </div>
                @endforeach
            </div>

            {{-- 자동 로딩 : 센티널이 뷰포트에 가까워지면 다음 묶음 공개 (남은 항목 없으면 숨김) --}}
            <div class="history-more js-more-sentinel" aria-hidden="true">
                <span class="history-spinner"></span>
            </div>
        </div>
    </section>
@endsection
