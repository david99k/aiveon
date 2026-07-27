@extends('layouts.app')

@section('title', $notice['title'] . ' · 공지사항 · AIVEON')

@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 공지사항 상세 : 제목·메타 → 본문 → 이전/다음 글 → 목록 --}}
        <div class="mypage__content">
            <a href="{{ route('notice') }}" class="board__back">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                공지사항
            </a>

            <article class="post">
                <header class="post__head">
                    <span class="post__cat">{{ $notice['category'] }}</span>
                    <h2 class="post__title">{{ $notice['title'] }}</h2>
                    <div class="post__meta">
                        <span>등록일 {{ $notice['date'] }}</span>
                        <span>조회 {{ $notice['views'] }}</span>
                    </div>
                </header>

                <div class="post__body">{!! nl2br(e($notice['body'])) !!}</div>
            </article>

            {{-- 이전 / 다음 글 --}}
            <nav class="post__nav" aria-label="이전 다음 글">
                @if ($prev)
                    <a href="{{ route('notice.show', $prev['id']) }}" class="post__nav-item">
                        <span class="post__nav-label">이전 글</span>
                        <span class="post__nav-title">{{ $prev['title'] }}</span>
                    </a>
                @else
                    <span class="post__nav-item is-empty"><span class="post__nav-label">이전 글</span><span class="post__nav-title">이전 글이 없습니다</span></span>
                @endif

                @if ($next)
                    <a href="{{ route('notice.show', $next['id']) }}" class="post__nav-item">
                        <span class="post__nav-label">다음 글</span>
                        <span class="post__nav-title">{{ $next['title'] }}</span>
                    </a>
                @else
                    <span class="post__nav-item is-empty"><span class="post__nav-label">다음 글</span><span class="post__nav-title">다음 글이 없습니다</span></span>
                @endif
            </nav>

            <div class="post__actions">
                <a href="{{ route('notice') }}" class="btn btn--ghost">목록으로</a>
            </div>
        </div>
    </section>
@endsection
