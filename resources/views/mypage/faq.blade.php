@extends('layouts.app')

@section('title', '자주하는 질문 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 : 검색 + 필터 칩 + 아코디언 Q&A --}}
        <div class="mypage__content">
            <h2 class="mypage__page-title">자주하는 질문</h2>

            <div class="faq__search">
                <input type="text" class="faq__search-input" placeholder="검색어를 입력하세요" aria-label="자주하는 질문 검색">
                <button type="button" class="faq__search-btn" aria-label="검색">
                    <img src="{{ asset('images/common/ic_search.svg') }}" alt="">
                </button>
            </div>

            <div class="faq__chips">
                @foreach ($chips as $chip)
                    <button type="button" class="faq__chip">{{ $chip }}</button>
                @endforeach
            </div>

            <ul class="faq__list">
                @foreach ($faqs as $faq)
                    <li class="faq__item{{ $faq['open'] ? ' is-open' : '' }}">
                        <button type="button" class="faq__q js-faq-toggle" aria-expanded="{{ $faq['open'] ? 'true' : 'false' }}">
                            <span class="faq__q-text">{{ $faq['q'] }}</span>
                            <svg class="faq__chevron" viewBox="0 0 14 8" fill="none" aria-hidden="true"><path d="M1 1l6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <div class="faq__a">{!! $faq['a'] !!}</div>
                    </li>
                @endforeach
            </ul>
        </div>
    </section>
@endsection
