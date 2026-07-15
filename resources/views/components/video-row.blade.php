{{-- 가로형 리스트 섹션 (타이틀 + 가로 스크롤 카드 리스트). hideTitle: 타이틀을 스크린리더 전용으로 숨김 --}}
@props(['title' => '', 'items' => [], 'hideTitle' => false])

<section class="section">
    <h2 class="section__title{{ $hideTitle ? ' blind' : '' }}">{{ $title }}</h2>

    <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="{{ $title }}">
        <ul class="video-list">
            @foreach ($items as $item)
                <x-video-card :item="$item" />
            @endforeach
        </ul>
    </div>
</section>
