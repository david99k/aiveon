{{-- 가로형 카드 (285 x 181 썸네일) --}}
@props(['item' => []])

<li class="video-card">
    <a href="{{ $item['url'] ?? '#' }}" class="video-card__link">
        <figure class="video-card__thumb">
            @if (!empty($item['thumb']))
                <img src="{{ asset($item['thumb']) }}" alt="" loading="lazy">
            @endif

            @if (!empty($item['is_premium']))
                <span class="badge badge--premium">PREMIUM</span>
            @endif

            @if (!empty($item['is_new']))
                <span class="badge badge--new">NEW</span>
            @endif
        </figure>

        <div class="video-card__info">
            <strong class="video-card__title">{{ $item['title'] ?? '' }}</strong>
            <span class="video-card__meta">{{ $item['creator'] ?? '크리에이터' }} · 조회수 {{ $item['views'] ?? '0' }}</span>
        </div>
    </a>
</li>
