@extends('layouts.app')

@section('title', '회원 탈퇴 · VIBUZZ')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 : 회원 탈퇴 (안내 → 사유 → 동의 → 비밀번호 확인) --}}
        <div class="mypage__content mypage__content--dash">
            <h2 class="mypage__page-title">회원 탈퇴</h2>
            <p class="wd-lead">탈퇴하시면 아래 정보가 모두 삭제되며 복구할 수 없습니다. 신중하게 결정해 주세요.</p>

            {{-- 현재 계정 --}}
            <div class="wd-account">
                <div class="wd-account__id">
                    <strong class="wd-account__name">{{ $account['username'] }}</strong>
                    <span class="wd-account__meta">@{{ $account['handle'] }} · {{ $account['joinedAt'] }} 가입 · {{ $account['plan'] }} 플랜</span>
                </div>
            </div>

            {{-- 삭제되는 데이터 --}}
            <h3 class="wd-sec-title">탈퇴 시 삭제되는 정보</h3>
            <div class="wd-losing">
                @foreach ($losing as $item)
                    <div class="wd-lose">
                        <span class="wd-lose__icon" data-wd-icon="{{ $item['icon'] }}" aria-hidden="true"></span>
                        <span class="wd-lose__label">{{ $item['label'] }}</span>
                        <strong class="wd-lose__value">{{ $item['value'] }}</strong>
                    </div>
                @endforeach
            </div>

            <form class="wd-form js-withdraw" method="post" action="#" onsubmit="return false">
                {{-- 탈퇴 사유 --}}
                <h3 class="wd-sec-title">탈퇴 사유<span class="req">*</span></h3>
                <div class="wd-reasons js-wd-reasons" role="radiogroup" aria-label="탈퇴 사유">
                    @foreach ($reasons as $i => $reason)
                        <label class="wd-reason">
                            <input type="radio" name="reason" value="{{ $reason }}">
                            <span>{{ $reason }}</span>
                        </label>
                    @endforeach
                </div>
                <textarea class="wd-detail js-wd-detail" maxlength="500" placeholder="불편했던 점을 남겨주시면 서비스 개선에 반영하겠습니다. (선택)"></textarea>

                {{-- 유의사항 동의 --}}
                <h3 class="wd-sec-title">유의사항 확인<span class="req">*</span></h3>
                <ul class="wd-notices js-wd-notices">
                    @foreach ($notices as $notice)
                        <li>
                            <label class="wd-check">
                                <input type="checkbox" name="agree_{{ $notice['key'] }}" class="js-wd-agree">
                                <span class="wd-check__box" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </span>
                                <span class="wd-check__text">{{ $notice['text'] }}</span>
                            </label>
                        </li>
                    @endforeach
                </ul>
                <label class="wd-all">
                    <input type="checkbox" class="js-wd-all">
                    <span class="wd-check__box" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                    <span class="wd-check__text">위 내용을 모두 확인했으며 이에 동의합니다</span>
                </label>

                {{-- 비밀번호 확인 --}}
                <h3 class="wd-sec-title">비밀번호 확인<span class="req">*</span></h3>
                <p class="wd-hint">본인 확인을 위해 현재 비밀번호를 입력해 주세요.</p>
                <input type="password" class="wd-password js-wd-password" placeholder="현재 비밀번호" autocomplete="current-password">

                {{-- 액션 --}}
                <div class="wd-actions">
                    <a href="{{ route('mypage') }}" class="mypage__btn mypage__btn--cancel">취소</a>
                    <button type="button" class="mypage__btn wd-submit js-wd-submit" disabled>탈퇴하기</button>
                </div>
                <p class="wd-foot">탈퇴 대신 <a href="{{ route('inquiry') }}">1:1 문의</a>로 알려주시면 문제 해결을 도와드릴 수 있어요.</p>
            </form>
        </div>
    </section>

    {{-- 최종 확인 모달 --}}
    <div class="modal js-wd-modal" id="modal-withdraw" role="dialog" aria-modal="true" aria-labelledby="modal-wd-title">
        <div class="modal__box">
            <div class="wd-confirm">
                <span class="wd-confirm__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 4 21.5 20h-19L12 4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 10.5v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="17" r="0.9" fill="currentColor"/></svg>
                </span>
                <h2 class="wd-confirm__title" id="modal-wd-title">정말 탈퇴하시겠습니까?</h2>
                <p class="wd-confirm__desc">탈퇴하면 모든 활동 정보가 삭제되며<br><strong>복구할 수 없습니다.</strong></p>
                <div class="wd-confirm__actions">
                    <button type="button" class="mypage__btn mypage__btn--cancel js-wd-cancel">돌아가기</button>
                    <button type="button" class="mypage__btn wd-submit js-wd-confirm">탈퇴하기</button>
                </div>
            </div>
        </div>
    </div>

    {{-- 탈퇴 완료 모달 --}}
    <div class="modal js-wd-done" id="modal-withdraw-done" role="dialog" aria-modal="true" aria-labelledby="modal-wd-done-title">
        <div class="modal__box">
            <div class="wd-confirm">
                <span class="wd-confirm__icon wd-confirm__icon--done" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <h2 class="wd-confirm__title" id="modal-wd-done-title">탈퇴가 완료되었습니다</h2>
                <p class="wd-confirm__desc">그동안 VIBUZZ을 이용해 주셔서 감사합니다.<br>더 나은 서비스로 다시 만나뵙기를 바랍니다.</p>
                <div class="wd-confirm__actions">
                    <a href="{{ route('main') }}" class="mypage__btn mypage__btn--primary">홈으로</a>
                </div>
            </div>
        </div>
    </div>
@endsection
