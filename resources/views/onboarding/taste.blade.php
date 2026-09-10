@extends('layouts.app')

@section('title', '취향 선택 · VIBUZZ')

{{-- 온보딩 : 몰입형 화면이라 푸터 제외 --}}
@section('hide-footer', '1')
@section('body-class', 'page-onboarding')

@section('content')
    <section class="taste">
        <header class="taste__head">
            <span class="taste__step">가입 완료 · 마지막 단계</span>
            <h1 class="taste__title">어떤 영상을 좋아하세요?</h1>
            <p class="taste__desc">관심 장르를 <b>{{ $minPick }}개 이상</b> 선택하면 <br class="taste__br">취향에 맞는 AI 영상을 먼저 보여드려요.</p>
        </header>

        <form id="taste-form" class="taste__form js-taste-form" action="{{ route('onboarding.taste.store') }}" method="post">
            @csrf

            @error('genres')
                <p class="taste__error" role="alert">{{ $message }}</p>
            @enderror

            @foreach ($groups as $group)
                <section class="taste__group">
                    <h2 class="taste__group-title">{{ $group['title'] }}</h2>
                    <ul class="taste__grid">
                        @foreach ($group['items'] as $item)
                            <li>
                                <label class="taste-card">
                                    <input type="checkbox" name="genres[]" value="{{ $item['name'] }}" class="taste-card__input js-taste-check">
                                    <span class="taste-card__thumb">
                                        <img src="{{ asset($item['thumb']) }}" alt="" loading="lazy">
                                        <span class="taste-card__check" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                        </span>
                                    </span>
                                    <span class="taste-card__name">{{ $item['name'] }}</span>
                                </label>
                            </li>
                        @endforeach
                    </ul>
                </section>
            @endforeach
        </form>

        {{-- 하단 고정 바 : 선택 개수 + 액션 --}}
        <div class="taste__bar">
            <div class="taste__bar-inner">
                <p class="taste__count">
                    <b class="js-taste-count">0</b>개 선택
                    <span class="taste__count-hint js-taste-hint">· {{ $minPick }}개 이상 선택해주세요</span>
                </p>
                <div class="taste__actions">
                    <a href="{{ route('main') }}" class="btn btn--ghost taste__skip">나중에 하기</a>
                    <button type="submit" form="taste-form" class="btn btn--primary taste__submit js-taste-submit" disabled>시작하기</button>
                </div>
            </div>
        </div>
    </section>
@endsection
