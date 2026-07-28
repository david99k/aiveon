@extends('layouts.app')

@section('title', '내 문의 내역 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 : 고객센터 (내 문의 내역 탭) --}}
        <div class="mypage__content">
            <h2 class="mypage__page-title">고객센터</h2>

            <div class="cs-tabs" role="tablist">
                <a href="{{ route('faq') }}" class="cs-tab">자주하는 질문</a>
                <a href="{{ route('inquiry') }}" class="cs-tab">문의하기</a>
                <a href="{{ route('inquiries') }}" class="cs-tab is-active" aria-current="page">내 문의 내역</a>
            </div>

            {{-- 내 문의 내역 : 제목 클릭 시 문의 본문 + 답변 펼침 --}}
            <section class="myq" aria-label="내 문의 내역">
                <div class="myq__head">
                    <h3 class="myq__title">내 문의 내역 <span class="myq__count">{{ count($inquiries) }}</span></h3>
                    <p class="myq__note">답변은 접수 후 1~2영업일 내 등록됩니다.</p>
                </div>

                @if (count($inquiries))
                    <ul class="myq__list">
                        @foreach ($inquiries as $q)
                            <li class="myq__item">
                                <button type="button" class="myq__row js-myq-toggle" aria-expanded="false">
                                    <span class="myq__type">{{ $q['type'] }}</span>
                                    <span class="myq__subject">{{ $q['title'] }}</span>
                                    <span class="myq__date">{{ $q['date'] }}</span>
                                    <span class="myq__status myq__status--{{ $q['status'] }}">{{ $q['statusLabel'] }}</span>
                                    <svg class="myq__chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>

                                <div class="myq__panel" hidden>
                                    <div class="myq__block">
                                        <p class="myq__block-label">문의 내용 <span class="myq__no">{{ $q['no'] }}</span></p>
                                        <p class="myq__block-body">{{ $q['body'] }}</p>
                                    </div>

                                    @if ($q['answer'])
                                        <div class="myq__block myq__block--answer">
                                            <p class="myq__block-label">답변 <span class="myq__no">{{ $q['answer']['date'] }}</span></p>
                                            <p class="myq__block-body">{{ $q['answer']['body'] }}</p>
                                        </div>
                                    @else
                                        <p class="myq__waiting">담당자가 확인 중입니다. 답변이 등록되면 알림으로 안내드립니다.</p>
                                    @endif
                                </div>
                            </li>
                        @endforeach
                    </ul>
                @else
                    <p class="myq__empty">접수된 문의가 없습니다.</p>
                @endif

                <div class="myq__actions">
                    <a href="{{ route('inquiry') }}" class="mypage__btn mypage__btn--primary">새 문의 접수</a>
                </div>
            </section>
        </div>
    </section>
@endsection
