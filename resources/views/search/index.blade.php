@extends('layouts.app')

@section('title', '검색 · AIVEON')

{{-- 검색 오버레이 : 푸터 제외 --}}
@section('hide-footer', '1')

@section('content')
    <section class="search-page">
        <div class="search-page__inner">
            <form class="search-box" action="{{ route('search.results') }}" method="get" role="search">
                <input type="text" name="q" class="search-box__input" placeholder="검색어를 입력하세요" aria-label="검색어 입력" autocomplete="off">
                <button type="submit" class="search-box__btn" aria-label="검색"><img src="{{ asset('images/common/ic_search.svg') }}" alt=""></button>
            </form>

            <div class="search-block">
                <div class="search-block__head">
                    <h2 class="search-block__title">최근 검색어</h2>
                    <button type="button" class="search-block__clear">검색어 초기화</button>
                </div>
                <div class="search-chips">
                    @foreach ($recent as $term)
                        <a href="{{ route('search.results', ['q' => $term]) }}" class="search-chip">{{ $term }}</a>
                    @endforeach
                </div>
            </div>

            <div class="search-block">
                <h2 class="search-block__title">인기 검색어</h2>
                <ol class="search-rank-list">
                    @foreach ($popular as $i => $term)
                        <li>
                            <a href="{{ route('search.results', ['q' => $term]) }}" class="search-rank">
                                <span class="search-rank__num">{{ $i + 1 }}</span>
                                <span class="search-rank__text">{{ $term }}</span>
                            </a>
                        </li>
                    @endforeach
                </ol>
            </div>
        </div>
    </section>
@endsection
