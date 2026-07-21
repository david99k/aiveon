@extends('layouts.app')

@section('title', '마이페이지 · AIVEON')

{{-- 마이페이지: 사이드바가 푸터까지 이어지도록 푸터 상단 여백 제거 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 회원정보 폼 --}}
        <div class="mypage__content">
            <div class="mypage__header">
                <div class="mypage__avatar-wrap">
                    <img class="mypage__avatar" src="{{ asset($account['avatar']) }}" alt="프로필 이미지">
                    <button type="button" class="mypage__avatar-gear" aria-label="프로필 이미지 변경">
                        <img src="{{ asset('images/mypage/ic_setting.svg') }}" alt="">
                    </button>
                </div>
                <div class="mypage__identity">
                    <strong class="mypage__username">{{ $account['username'] }}</strong>
                    <div class="mypage__stats">
                        <span>게시물 {{ $account['posts'] }}</span>
                        <span>구독자 {{ $account['subscribers'] }}</span>
                    </div>
                </div>
            </div>

            <div class="mypage__form">
                @foreach ($fields as $field)
                    <div class="mypage__field">
                        <span class="mypage__field-label">{{ $field['label'] }}</span>
                        <div class="mypage__field-box">
                            <span class="mypage__field-value{{ !empty($field['strong']) ? ' mypage__field-value--strong' : '' }}">{{ $field['value'] }}</span>
                            @if (!empty($field['change']))
                                <button type="button" class="mypage__field-change">변경</button>
                            @endif
                        </div>
                    </div>
                @endforeach

                <div class="mypage__field mypage__field--plain">
                    <span class="mypage__field-label">구독 내용</span>
                    <span class="mypage__field-plan">{{ $subscription }}</span>
                </div>
            </div>

            <div class="mypage__actions">
                <button type="button" class="mypage__btn mypage__btn--primary">완료</button>
                <button type="button" class="mypage__btn mypage__btn--cancel">취소</button>
            </div>
        </div>
    </section>
@endsection
