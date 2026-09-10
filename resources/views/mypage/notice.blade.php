@extends('layouts.app')

@section('title', '공지사항 · VIBUZZ')

{{-- 마이페이지 셸 재사용 : 좌측 계정 사이드바 유지 --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 공지사항 : 일반 게시판 형태 (고정 공지 + 목록 + 검색 + 페이지네이션) --}}
        <div class="mypage__content">
            <h2 class="mypage__page-title">공지사항</h2>

            <div class="board__top">
                <div class="board__filters" role="tablist" aria-label="분류">
                    @foreach ($categories as $i => $cat)
                        <button type="button" @class(['board__filter', 'is-active' => $i === 0]) role="tab" aria-selected="{{ $i === 0 ? 'true' : 'false' }}">{{ $cat }}</button>
                    @endforeach
                </div>

                <div class="board__search">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/><path d="m20 20-3.4-3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                    <input type="search" class="board__search-input" placeholder="제목으로 검색" aria-label="공지사항 검색">
                </div>
            </div>

            <div class="board">
                <div class="board__head">
                    <span>번호</span>
                    <span>분류</span>
                    <span class="board__col-title">제목</span>
                    <span>등록일</span>
                    <span>조회</span>
                </div>

                @foreach ($notices as $n)
                    <a href="{{ route('notice.show', $n['id']) }}" @class(['board__row', 'board__row--pinned' => $n['pinned']])>
                        <span class="board__num">
                            @if ($n['pinned'])
                                <span class="board__pin">공지</span>
                            @else
                                {{ $n['id'] }}
                            @endif
                        </span>
                        <span class="board__cat">{{ $n['category'] }}</span>
                        <span class="board__title">{{ $n['title'] }}</span>
                        <span class="board__date">{{ $n['date'] }}</span>
                        <span class="board__views">{{ $n['views'] }}</span>
                    </a>
                @endforeach
            </div>

            {{-- 페이지네이션 (정적 데모) --}}
            <nav class="board__pager" aria-label="페이지">
                <button type="button" class="board__page board__page--nav" aria-label="이전 페이지" disabled>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="board__page is-active" aria-current="page">1</button>
                <button type="button" class="board__page">2</button>
                <button type="button" class="board__page">3</button>
                <button type="button" class="board__page board__page--nav" aria-label="다음 페이지">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            </nav>
        </div>
    </section>
@endsection
