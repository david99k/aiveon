{{-- 세로 포스터 카드 가로 스크롤 섹션 (쇼츠·숏폼 등 세로형 콘텐츠) --}}
@props(['title' => '', 'items' => []])

<section class="section section--poster">
    <h2 class="section__title">{{ $title }}</h2>

    <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="{{ $title }}">
        <ul class="poster-list">
            @foreach ($items as $item)
                <li><x-poster-card :item="$item" /></li>
            @endforeach
        </ul>
    </div>
</section>
