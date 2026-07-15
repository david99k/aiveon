{{-- Hero : 메인 상단 비주얼 슬라이더 ($heroes 배열, Swiper) --}}
@php
    /* 컨트롤러가 $heroes를 넘기지 않는 페이지 폴백. 단일 항목이면 슬라이더 없이 정적 노출된다. */
    $heroes = $heroes ?? [[
        'badge' => 'OFFICIAL',
        'title' => '빛이 빛날 때',
        'tags' => ['2026', '드라마', '멜로'],
        'description' => "AI가 그려낸 새로운 빛의 이야기\n공식 오리지널 시리즈 단독 공개",
        'image' => 'images/main/hero_main.jpg',
        'play_url' => '#',
        'detail_url' => '#',
    ]];
@endphp
<section class="hero swiper js-hero-swiper" aria-label="추천 콘텐츠 슬라이드">
    <div class="swiper-wrapper">
        @foreach ($heroes as $hero)
            <article class="swiper-slide">
                <div class="hero__bg">
                    <img src="{{ asset($hero['image'] ?? 'images/main/hero_main.jpg') }}" alt=""
                         @if (!$loop->first) loading="lazy" @endif>
                </div>

                <div class="hero__content">
                    @if (!empty($hero['badge']))
                        @php
                            /* 배지 종류별 배경색 : PREMIUM(민트) / NEW(레드) / 그 외(다크 기본) */
                            $badgeModifier = match (strtoupper($hero['badge'])) {
                                'PREMIUM' => ' hero__badge--premium',
                                'NEW' => ' hero__badge--new',
                                default => '',
                            };
                        @endphp
                        <span class="hero__badge{{ $badgeModifier }}">{{ $hero['badge'] }}</span>
                    @endif

                    <h2 class="hero__title">{{ $hero['title'] ?? '' }}</h2>

                    @if (!empty($hero['tags']))
                        <ul class="hero__tags">
                            @foreach ($hero['tags'] as $tag)
                                <li>{{ $tag }}</li>
                            @endforeach
                        </ul>
                    @endif

                    @if (!empty($hero['description']))
                        <p class="hero__desc">{!! nl2br(e($hero['description'])) !!}</p>
                    @endif

                    <div class="hero__actions">
                        <a href="{{ $hero['play_url'] ?? '#' }}" class="btn btn--primary">바로재생</a>
                        <a href="{{ $hero['detail_url'] ?? '#' }}" class="btn btn--ghost">상세보기</a>
                    </div>
                </div>
            </article>
        @endforeach
    </div>

    <div class="hero__pagination swiper-pagination"></div>
    <button type="button" class="hero__nav hero__nav--prev" aria-label="이전 콘텐츠">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button type="button" class="hero__nav hero__nav--next" aria-label="다음 콘텐츠">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
</section>
