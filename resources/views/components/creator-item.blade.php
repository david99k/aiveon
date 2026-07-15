{{-- 크리에이터 아이템 (100px 원형 아바타) --}}
@props(['creator' => []])

<li class="creator">
    <a href="{{ $creator['url'] ?? '#' }}" class="creator__link">
        <span class="creator__avatar">
            @if (!empty($creator['avatar']))
                <img src="{{ asset($creator['avatar']) }}" alt="" loading="lazy">
            @endif
        </span>

        <span class="creator__info">
            <strong class="creator__name">{{ $creator['name'] ?? '' }}</strong>
            <span class="creator__subs">구독자 {{ $creator['subscribers'] ?? '0' }}</span>
        </span>
    </a>
</li>
