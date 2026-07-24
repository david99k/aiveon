@extends('layouts.app')

@section('title', '1:1 문의 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 : 고객센터 (문의하기 탭) --}}
        <div class="mypage__content">
            <h2 class="mypage__page-title">고객센터</h2>

            <div class="cs-tabs" role="tablist">
                <a href="{{ route('faq') }}" class="cs-tab">자주하는 질문</a>
                <a href="{{ route('inquiry') }}" class="cs-tab is-active" aria-current="page">문의하기</a>
            </div>

            {{-- 문의 전 자주 찾는 질문 바로가기 --}}
            <div class="faq__chips">
                @foreach ($chips as $chip)
                    <a href="{{ route('faq') }}" class="faq__chip">{{ $chip }}</a>
                @endforeach
            </div>

            <hr class="inquiry__divider">

            <form class="inquiry__form" action="#" method="post" onsubmit="return false">
                <div class="inquiry__row">
                    <label class="inquiry__label" for="inq-name">이름</label>
                    <div class="inquiry__field">
                        <input type="text" id="inq-name" class="inquiry__input" placeholder="이름을 입력해주세요">
                    </div>
                </div>

                <div class="inquiry__row">
                    <label class="inquiry__label" for="inq-email">이메일</label>
                    <div class="inquiry__field">
                        <input type="email" id="inq-email" class="inquiry__input" placeholder="이메일을 입력해주세요">
                    </div>
                </div>

                <div class="inquiry__row">
                    <label class="inquiry__label" for="inq-phone">연락처</label>
                    <div class="inquiry__field">
                        <input type="tel" id="inq-phone" class="inquiry__input" placeholder="&ldquo;-&rdquo;를 빼고 입력해주세요">
                    </div>
                </div>

                <div class="inquiry__row">
                    <span class="inquiry__label" id="inq-type-label">문의 종류</span>
                    <div class="inquiry__field inquiry__radios" role="radiogroup" aria-labelledby="inq-type-label">
                        @foreach ($types as $i => $type)
                            <label class="inquiry__radio">
                                <input type="radio" class="radio" name="inq-type" value="{{ $type }}" @checked($i === 0)>
                                {{ $type }}
                            </label>
                        @endforeach
                    </div>
                </div>

                <div class="inquiry__row inquiry__row--top">
                    <label class="inquiry__label" for="inq-body">문의 내용</label>
                    <div class="inquiry__field">
                        <textarea id="inq-body" class="inquiry__textarea" placeholder="문의 내용을 입력해 주세요."></textarea>
                    </div>
                </div>

                <div class="inquiry__offset">
                    <label class="inquiry__agree">
                        <input type="checkbox" class="checkbox checkbox--lg">
                        개인정보 수집 및 이용동의
                    </label>
                </div>

                <div class="inquiry__offset">
                    <div class="inquiry__notice">
                        <p>개인 정보 수집 및 이용 안내</p>
                        <ul>
                            <li>개인정보 수집 및 이용 목적 : 문의 또는 환불 접수, 접수 사항의 확인 및 처리, 처리 사항의 회신</li>
                            <li>개인정보 수집 및 이용 항목 : [필수]아이디, 성명, 이메일, 연락처 / [환불 처리 시] 은행명, 계좌번호, 예금주명</li>
                            <li>개인정보 수집 및 이용 기간 : [일반 문의] 접수 후 3년 / [환불 처리 시] 접수 후 5년</li>
                        </ul>
                    </div>
                </div>

                <div class="inquiry__offset inquiry__actions">
                    <button type="submit" class="mypage__btn mypage__btn--primary">문의 접수</button>
                </div>
            </form>
        </div>
    </section>
@endsection
