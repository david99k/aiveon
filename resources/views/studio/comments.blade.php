@extends('layouts.app')

@section('title', '댓글 관리 · AIVEON')

{{-- 마이페이지 셸 재사용 : 사이드바가 푸터까지 이어지도록 --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        {{-- 좌측 : 마이페이지 사이드바 (크리에이터 스튜디오 아코디언 펼침 + 댓글 관리 활성) --}}
        @include('partials.mypage-sidebar', ['studioSub' => 'comment'])

        {{-- 우측 : 내 콘텐츠 댓글 관리 (답글 / 숨김 / 신고 처리) --}}
        <div class="mypage__content mypage__content--studio">
            <h2 class="studio__title">댓글 관리</h2>
            <p class="studio__lead">내 콘텐츠에 달린 댓글에 답글을 달고, 신고·숨김을 관리하세요.</p>

            {{-- 요약 카드 --}}
            <div class="cmt-sum">
                @foreach ($summary as $card)
                    <div @class(['cmt-sum__card', 'cmt-sum__card--alert' => !empty($card['alert'])])>
                        <strong class="cmt-sum__value">{{ $card['value'] }}</strong>
                        <span class="cmt-sum__label">{{ $card['label'] }}</span>
                    </div>
                @endforeach
            </div>

            {{-- 필터 탭 (정적 데모) --}}
            <div class="cmt-tabs" role="tablist" aria-label="댓글 필터">
                @foreach ($tabs as $tab)
                    <button type="button" @class(['cmt-tab', 'is-active' => !empty($tab['active'])]) role="tab" aria-selected="{{ !empty($tab['active']) ? 'true' : 'false' }}">
                        {{ $tab['label'] }}@if (!empty($tab['count']))<span class="cmt-tab__count">{{ $tab['count'] }}</span>@endif
                    </button>
                @endforeach
            </div>

            {{-- 댓글 목록 (동작은 main.js initStudioComments — 데모용, 실제 처리는 API 연동 지점) --}}
            <div class="cmt-list js-cmt-list">
                @foreach ($comments as $c)
                    <article @class(['cmt', 'cmt--reported' => $c['type'] === 'reported']) data-type="{{ $c['type'] }}">
                        <img class="cmt__avatar" src="{{ asset($c['avatar']) }}" alt="">
                        <div class="cmt__body">
                            <div class="cmt__head">
                                <strong class="cmt__user">{{ $c['user'] }}</strong>
                                <span class="cmt__time">{{ $c['time'] }}</span>
                                @if (!empty($c['flag']))
                                    <span class="cmt__flag">{{ $c['flag'] }}</span>
                                @endif
                            </div>

                            <p class="cmt__text">{{ $c['text'] }}</p>

                            {{-- 어느 영상에 달린 댓글인지 : 해당 영상으로 이동 --}}
                            <a class="cmt__on" href="{{ $c['url'] ?? route('detail') }}">
                                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 2.5v7l6-3.5-6-3.5Z" fill="currentColor"/></svg>
                                <b>{{ $c['on'] }}</b>
                            </a>

                            @if ($c['type'] === 'reported')
                                <div class="cmt__actions">
                                    <button type="button" class="cmt-act cmt-act--danger" data-cmt-act="hide">숨기기</button>
                                    <button type="button" class="cmt-act cmt-act--danger" data-cmt-act="delete">삭제</button>
                                    <button type="button" class="cmt-act" data-cmt-act="dismiss">신고 무시</button>
                                    <button type="button" class="cmt-act" data-cmt-act="block">작성자 차단</button>
                                </div>
                            @elseif ($c['type'] === 'waiting')
                                <div class="cmt__actions">
                                    <button type="button" class="cmt-act cmt-act--primary" data-cmt-act="reply">답글 달기</button>
                                    <button type="button" class="cmt-act cmt-act--heart" data-cmt-act="heart" aria-pressed="false">
                                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
                                        하트
                                    </button>
                                    <button type="button" class="cmt-act" data-cmt-act="hide">숨기기</button>
                                </div>
                            @endif

                            @if (!empty($c['reply']))
                                <div class="cmt__reply">
                                    <div class="cmt__head">
                                        <strong class="cmt__user cmt__user--me">{{ $c['reply']['user'] }}</strong>
                                        <span class="cmt__time">· 작성자</span>
                                    </div>
                                    <p class="cmt__text">{{ $c['reply']['text'] }}</p>
                                </div>
                            @endif
                        </div>
                    </article>
                @endforeach
            </div>
        </div>
    </section>
@endsection
