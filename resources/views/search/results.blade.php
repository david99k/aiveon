@extends('layouts.app')

@section('title', ($noResults ? '검색결과 없음' : '검색결과') . ' · AIVEON')

@section('content')
    <section class="search-results">
        <form class="search-box search-box--top" action="{{ route('search.results') }}" method="get" role="search">
            <input type="text" name="q" class="search-box__input" value="{{ $q }}" aria-label="검색어 입력" autocomplete="off">
            <button type="submit" class="search-box__btn" aria-label="검색"><img src="{{ asset('images/common/ic_search.svg') }}" alt=""></button>
        </form>

        @if ($noResults)
            <div class="search-none">
                <p class="search-none__title"><strong>{{ $q }}</strong>과 관련 된 검색 결과가 없습니다.</p>
                <p class="search-none__sub">검색어를 다시 확인해주세요!</p>
            </div>
        @endif

        @foreach ($sections as $sec)
            <section class="section">
                <h2 class="section__title search-row-title">
                    {{ $sec['title'] }}
                    @if (!empty($sec['count']))<span class="search-row-count">{{ $sec['count'] }}</span>@endif
                </h2>

                <div class="scroll-x" data-scroll-x tabindex="0" role="region" aria-label="{{ $sec['title'] }}">
                    @if ($sec['type'] === 'creator')
                        <ul class="creator-list">
                            @foreach ($sec['items'] as $creator)
                                <x-creator-item :creator="$creator" />
                            @endforeach
                        </ul>
                    @elseif ($sec['type'] === 'poster')
                        <ul class="poster-list">
                            @foreach ($sec['items'] as $item)
                                <li><x-poster-card :item="$item" /></li>
                            @endforeach
                        </ul>
                    @else
                        <ul class="video-list">
                            @foreach ($sec['items'] as $item)
                                <x-video-card :item="$item" />
                            @endforeach
                        </ul>
                    @endif
                </div>
            </section>
        @endforeach
    </section>
@endsection
