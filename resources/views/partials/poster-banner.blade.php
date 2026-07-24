{{-- 상단 배너 : 세로 포스터 캐러셀 (기존 히어로 슬라이더 대체).
     카드 클릭 시 콘텐츠 type 에 맞는 재생 페이지로 이동한다. --}}
@php $posters = $posters ?? []; @endphp
<section class="poster-banner" aria-label="추천 콘텐츠 배너">
    <div class="poster-banner__viewport scroll-x" data-scroll-x data-banner-track tabindex="0" role="region" aria-label="추천 콘텐츠">
        <ul class="poster-banner__track">
            @foreach ($posters as $poster)
                <li class="poster-banner__item">
                    <a href="{{ $poster['url'] ?? '#' }}" class="poster-banner__card">
                        @if (!empty($poster['thumb']))
                            <img src="{{ asset($poster['thumb']) }}" alt="{{ $poster['title'] ?? '' }}"
                                 @if ($loop->index > 1) loading="lazy" @endif>
                        @endif

                        @if (!empty($poster['is_premium']))
                            <span class="badge badge--premium">PREMIUM</span>
                        @endif

                        @if (!empty($poster['is_new']))
                            <span class="badge badge--new">NEW</span>
                        @endif
                    </a>
                </li>
            @endforeach
        </ul>
    </div>

    <button type="button" class="poster-banner__nav poster-banner__nav--prev" data-banner-prev aria-label="이전 콘텐츠">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button type="button" class="poster-banner__nav poster-banner__nav--next" data-banner-next aria-label="다음 콘텐츠">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
</section>
