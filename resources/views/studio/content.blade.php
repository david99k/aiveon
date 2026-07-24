@extends('layouts.app')

@section('title', '콘텐츠 관리 · AIVEON')

{{-- 마이페이지 셸 재사용 : 사이드바가 푸터까지 이어지도록 --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        {{-- 좌측 : 마이페이지 사이드바 (크리에이터 스튜디오 아코디언 펼침 + 콘텐츠 관리 활성) --}}
        @include('partials.mypage-sidebar', ['studioSub' => 'content'])

        {{-- 우측 : 콘텐츠 목록 (Figma 762:11324) --}}
        <div class="mypage__content mypage__content--studio">
            <h2 class="studio__title">콘텐츠</h2>

            <div class="content-table">
                <div class="content-table__inner">
                    <div class="content-table__head">
                        <span>내용</span>
                        <span>공개 상태</span>
                        <span>등록일</span>
                        <span>조회수</span>
                        <span>댓글</span>
                        <span>관리</span>
                    </div>

                    @forelse ($contents as $item)
                        <div class="content-row">
                            <div class="content-row__main">
                                <div class="content-row__thumb"><img src="{{ asset($item['thumb']) }}" alt=""></div>
                                <div class="content-row__meta">
                                    <p class="content-row__title">{{ $item['title'] }}</p>
                                    <p class="content-row__desc">{{ $item['desc'] }}</p>
                                    <p class="content-row__dur">{{ $item['duration'] }}</p>
                                </div>
                            </div>
                            <div class="content-row__cell">{{ $item['visibility'] }}</div>
                            <div class="content-row__cell">{{ $item['date'] }}</div>
                            <div class="content-row__cell">{{ $item['views'] }}</div>
                            <div class="content-row__cell">{{ $item['comments'] }}</div>
                            <button type="button" class="content-edit-btn">수정</button>
                        </div>
                    @empty
                        <div class="content-empty">
                            <svg class="content-empty__icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                                <path d="M20 5 37 35H3L20 5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                                <path d="M20 16v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="20" cy="29.5" r="1.4" fill="currentColor"/>
                            </svg>
                            <p class="content-empty__text">등록된 콘텐츠가 없습니다.<br>콘텐츠를 등록하여 나의 AI영상을 뽐내보세요</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </section>
@endsection
