@extends('layouts.app')

@section('title', 'AI 툴 도감 · AIVEON')

{{-- 마이페이지 셸 재사용 : 좌측 계정 사이드바 유지 --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        <div class="mypage__content">
    <section class="aitools">
        {{-- 헤더 --}}
        <header class="aitools__head">
            <h1 class="aitools__title">AI 툴 도감</h1>
            <p class="aitools__lead">AIVEON 크리에이터들이 실제로 사용하는 AI 툴을 카테고리별로 확인하세요.<br>각 툴 페이지에서 <strong>그 툴로 만든 영상</strong>을 바로 볼 수 있습니다.</p>

            <div class="aitools__search">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/><path d="m20 20-3.4-3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                <input type="search" class="aitools__search-input" placeholder="툴 이름으로 검색 (예: Runway, 미드저니)" aria-label="AI 툴 검색">
            </div>
        </header>

        {{-- 카테고리 필터 (업로드 폼과 동일한 17개 체계) --}}
        <div class="aitools__chips" role="tablist" aria-label="카테고리">
            @foreach ($categories as $i => $cat)
                <button type="button" @class(['aitools__chip', 'is-active' => $i === 0]) role="tab" aria-selected="{{ $i === 0 ? 'true' : 'false' }}">{{ $cat }}</button>
            @endforeach
        </div>

        {{-- 툴 카드 그리드 --}}
        <div class="aitools__grid">
            @foreach ($tools as $tool)
                <a href="{{ route('ai-tool', $tool['slug']) }}" class="aitool-card">
                    <span class="aitool-card__logo" data-ai-logo="{{ $tool['name'] }}"></span>

                    <span class="aitool-card__body">
                        <strong class="aitool-card__name">
                            {{ $tool['name'] }}
                            @if ($tool['official'])
                                <span class="aitool-card__verified" title="AIVEON 추천 툴">
                                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5 9.7 5l3.8.5-2.7 2.7.6 3.8L8 10.2 4.6 12l.6-3.8L2.5 5.5 6.3 5 8 1.5Z" fill="currentColor"/></svg>
                                </span>
                            @endif
                        </strong>
                        <span class="aitool-card__kor">{{ $tool['korName'] }}</span>
                        <span class="aitool-card__tagline">{{ $tool['tagline'] }}</span>

                        <span class="aitool-card__meta">
                            <span class="aitool-card__cat">{{ $tool['category'] }}</span>
                            <span class="aitool-card__count">영상 {{ $tool['videoCount'] }}</span>
                        </span>
                    </span>
                </a>
            @endforeach
        </div>
    </section>
        </div>
    </section>
@endsection
