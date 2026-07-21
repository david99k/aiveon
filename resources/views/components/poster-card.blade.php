{{-- 세로형 카드 (253 x 337 포스터) --}}
@props(['item' => []])

<div class="poster-card">
    <a href="{{ $item['url'] ?? '#' }}" class="poster-card__link">
        <figure class="poster-card__thumb">
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

        <div class="poster-card__info">
            <strong class="poster-card__title">{{ $item['title'] ?? '' }}@if (!empty($item['age19']))<span class="badge-age19">19</span>@endif</strong>
            <span class="poster-card__meta">{{ $item['creator'] ?? '크리에이터' }} · 조회수 {{ $item['views'] ?? '0' }}</span>
        </div>
    </a>
</div>
