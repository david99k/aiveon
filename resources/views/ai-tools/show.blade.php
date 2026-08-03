@extends('layouts.app')

@section('title', $tool['name'] . ' · AI 툴 도감 · AIVEON')

{{-- 마이페이지 셸 재사용 : 좌측 계정 사이드바 유지 --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        <div class="mypage__content">
    <section class="aitool">
        {{-- 히어로 : 로고 + 이름 + 카테고리 (목록 복귀는 좌측 사이드바 "AI 툴 도감"으로) --}}
        <header class="aitool__head">
            <span class="aitool__logo" data-ai-logo="{{ $tool['name'] }}"></span>

            <div class="aitool__id">
                <h1 class="aitool__name">
                    {{ $tool['name'] }}
                    @if ($tool['official'])
                        <span class="aitool__verified">AIVEON 추천</span>
                    @endif
                </h1>
                <p class="aitool__kor">{{ $tool['korName'] }} · <span class="aitool__cat">{{ $tool['category'] }}</span></p>
            </div>

            <div class="aitool__actions">
                {{-- 저장 · 공유 : 라인형 아이콘 버튼 (라벨은 보조기술용) --}}
                <button type="button" class="aitool__act" aria-label="저장" title="저장">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.2l-6.5-3.7-6.5 3.7V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="aitool__act" aria-label="공유" title="공유">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.5V4m0 0L8 8m4-4 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                </button>
                <a href="#" class="btn btn--primary aitool__official" target="_blank" rel="noopener">공식 사이트</a>
            </div>
        </header>

        <p class="aitool__summary">{{ $tool['summary'] }}</p>

        {{-- 핵심 지표 --}}
        <div class="aitool__stats">
            <div class="aitool__stat">
                <span class="aitool__stat-label">AIVEON 사용 영상</span>
                <strong class="aitool__stat-value">{{ $tool['videoCount'] }}</strong>
            </div>
            <div class="aitool__stat">
                <span class="aitool__stat-label">크리에이터 평점</span>
                <strong class="aitool__stat-value">{{ $tool['rating'] }}<span class="aitool__stat-sub">/ 5</span></strong>
            </div>
            @foreach ($tool['meta'] as $m)
                <div class="aitool__stat">
                    <span class="aitool__stat-label">{{ $m['label'] }}</span>
                    <strong class="aitool__stat-value aitool__stat-value--text">{{ $m['value'] }}</strong>
                </div>
            @endforeach
        </div>

        {{-- 이 툴로 만든 AIVEON 영상 (AIVEON 고유 섹션) --}}
        <x-poster-row :title="$tool['name'] . '(으)로 만든 영상'" :items="$videos" />

        {{-- 핵심 기능 --}}
        <section class="section aitool__section">
            <h2 class="section__title">핵심 기능</h2>
            <ul class="aitool__features">
                @foreach ($tool['features'] as $f)
                    <li class="aitool__feature">
                        <strong class="aitool__feature-title">{{ $f['title'] }}</strong>
                        <p class="aitool__feature-desc">{{ $f['desc'] }}</p>
                    </li>
                @endforeach
            </ul>
        </section>

        {{-- 장단점 --}}
        <section class="section aitool__section">
            <h2 class="section__title">장단점</h2>
            <div class="aitool__pros-cons">
                <div class="aitool__pc aitool__pc--pro">
                    <strong class="aitool__pc-head">이런 점이 좋아요</strong>
                    <ul>
                        @foreach ($tool['pros'] as $p)
                            <li>{{ $p }}</li>
                        @endforeach
                    </ul>
                </div>
                <div class="aitool__pc aitool__pc--con">
                    <strong class="aitool__pc-head">이런 점은 아쉬워요</strong>
                    <ul>
                        @foreach ($tool['cons'] as $c)
                            <li>{{ $c }}</li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </section>

        {{-- 요금제 --}}
        <section class="section aitool__section">
            <h2 class="section__title">요금제</h2>
            <div class="aitool__plans">
                @foreach ($tool['plans'] as $plan)
                    <div class="aitool__plan">
                        <strong class="aitool__plan-name">{{ $plan['name'] }}</strong>
                        <span class="aitool__plan-price">{{ $plan['price'] }}</span>
                        <p class="aitool__plan-desc">{{ $plan['desc'] }}</p>
                    </div>
                @endforeach
            </div>
            <p class="aitool__tip">{{ $tool['tips'] }}</p>
        </section>

        {{-- 같은 카테고리의 다른 툴 --}}
        @if ($related)
            <section class="section aitool__section">
                <h2 class="section__title">같은 카테고리의 다른 툴</h2>
                <div class="aitool__related">
                    @foreach ($related as $r)
                        <a href="{{ route('ai-tool', $r['slug']) }}" class="aitool__related-item">
                            <span class="aitool-card__logo" data-ai-logo="{{ $r['name'] }}"></span>
                            <span>
                                <strong>{{ $r['name'] }}</strong>
                                <span class="aitool__related-kor">{{ $r['korName'] }}</span>
                            </span>
                        </a>
                    @endforeach
                </div>
            </section>
        @endif
    </section>
        </div>
    </section>
@endsection
