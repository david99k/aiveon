@extends('layouts.app')

@section('title', '즐겨찾기 · VIBUZZ')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 : 즐겨찾기 전체 (포스터 썸네일 그리드 + 스크롤 배치 로딩) --}}
        <div class="mypage__content mypage__content--dash">
            <h2 class="mypage__page-title">즐겨찾기 <span class="hub__count">{{ count($favorites) }}</span></h2>
            <p class="history-note">찜한 콘텐츠를 모아 보여드립니다. 스크롤을 내리면 {{ $batch }}개씩 이어서 불러옵니다.</p>

            <div class="fav-grid history-grid js-more" data-more-batch="{{ $batch }}">
                @foreach ($favorites as $i => $item)
                    <div class="poster-card js-more-item" @if ($i >= $batch) hidden @endif>
                        <a href="{{ $item['url'] }}" class="poster-card__link">
                            <figure class="poster-card__thumb">
                                <img src="{{ asset($item['thumb']) }}" alt="" loading="lazy">
                                <span class="badge badge--premium">PREMIUM</span>
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
                @endforeach
            </div>

            {{-- 자동 로딩 : 센티널이 뷰포트에 가까워지면 다음 묶음 공개 (남은 항목 없으면 숨김) --}}
            <div class="history-more js-more-sentinel" aria-hidden="true">
                <span class="history-spinner"></span>
            </div>
        </div>
    </section>
@endsection
