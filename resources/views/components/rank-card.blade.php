{{-- TOP6 랭킹 카드 : 외곽선 숫자 + 세로형 카드 --}}
@props(['item' => [], 'rank' => 1])

<li class="rank-card">
    <span class="rank-card__num" aria-hidden="true">{{ $rank }}</span>
    <span class="blind">{{ $rank }}위</span>
    <x-poster-card :item="$item" />
</li>
