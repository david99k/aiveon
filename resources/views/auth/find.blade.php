@extends('layouts.app')

@section('title', '아이디 · 비밀번호 찾기 · AIVEON')

@section('content')
    <section class="find js-find">
        <h1 class="find__title">아이디 · 비밀번호 찾기</h1>

        {{-- 탭 --}}
        <div class="find__tabs" role="tablist">
            <button type="button" class="find__tab is-active" data-find-tab="id" role="tab" aria-selected="true">아이디 찾기</button>
            <button type="button" class="find__tab" data-find-tab="pw" role="tab" aria-selected="false">비밀번호 재설정</button>
        </div>

        {{-- 아이디 찾기 --}}
        <div class="find__panel" data-find-panel="id">
            <p class="find__lead">가입 시 등록한 정보로 본인 확인 후 아이디를 알려드립니다.</p>

            <div class="find__step js-find-step" data-step="1">
                <label class="find__label" for="fid-name">이름</label>
                <input type="text" id="fid-name" class="find__input" placeholder="이름을 입력해주세요">

                <span class="find__label">인증 방법</span>
                <div class="find__methods">
                    @foreach ($methods as $i => $m)
                        <label class="find__method">
                            <input type="radio" name="find-id-method" value="{{ $m['key'] }}" @checked($i === 0)>
                            <span>{{ $m['label'] }}</span>
                        </label>
                    @endforeach
                </div>

                <label class="find__label" for="fid-contact">휴대폰 번호</label>
                <div class="find__row">
                    <input type="tel" id="fid-contact" class="find__input js-find-contact" placeholder="&ldquo;-&rdquo; 없이 입력">
                    <button type="button" class="btn btn--ghost find__send js-find-send">인증번호 받기</button>
                </div>

                <div class="find__code js-find-code" hidden>
                    <label class="find__label" for="fid-code">인증번호</label>
                    <div class="find__row">
                        <input type="text" id="fid-code" class="find__input js-find-code-input" placeholder="6자리 숫자" maxlength="6">
                        <span class="find__timer js-find-timer">03:00</span>
                    </div>
                    <p class="find__hint">인증번호를 받지 못하셨나요? 입력한 정보를 확인한 뒤 다시 요청해 주세요.</p>
                </div>

                <button type="button" class="btn btn--primary find__submit js-find-next" disabled>아이디 찾기</button>
            </div>

            {{-- 결과 --}}
            <div class="find__step js-find-step" data-step="2" hidden>
                <div class="find__result">
                    <p class="find__result-lead">회원님의 아이디입니다.</p>
                    @foreach ($foundIds as $acc)
                        <div class="find__account">
                            <strong class="find__account-id">{{ $acc['id'] }}</strong>
                            <span class="find__account-meta">{{ $acc['type'] }} · {{ $acc['joined'] }} 가입</span>
                        </div>
                    @endforeach
                </div>
                <div class="find__actions">
                    <button type="button" class="btn btn--ghost js-find-topw">비밀번호 재설정</button>
                    <a href="{{ route('login') }}" class="btn btn--primary">로그인하기</a>
                </div>
            </div>
        </div>

        {{-- 비밀번호 재설정 --}}
        <div class="find__panel" data-find-panel="pw" hidden>
            <p class="find__lead">본인 확인 후 새 비밀번호를 설정할 수 있습니다.</p>

            <div class="find__step js-find-step" data-step="1">
                <label class="find__label" for="fpw-id">아이디(이메일)</label>
                <input type="email" id="fpw-id" class="find__input" placeholder="가입한 이메일을 입력해주세요">

                <label class="find__label" for="fpw-contact">휴대폰 번호</label>
                <div class="find__row">
                    <input type="tel" id="fpw-contact" class="find__input js-find-contact" placeholder="&ldquo;-&rdquo; 없이 입력">
                    <button type="button" class="btn btn--ghost find__send js-find-send">인증번호 받기</button>
                </div>

                <div class="find__code js-find-code" hidden>
                    <label class="find__label" for="fpw-code">인증번호</label>
                    <div class="find__row">
                        <input type="text" id="fpw-code" class="find__input js-find-code-input" placeholder="6자리 숫자" maxlength="6">
                        <span class="find__timer js-find-timer">03:00</span>
                    </div>
                </div>

                <button type="button" class="btn btn--primary find__submit js-find-next" disabled>다음</button>
            </div>

            {{-- 새 비밀번호 --}}
            <div class="find__step js-find-step" data-step="2" hidden>
                <label class="find__label" for="fpw-new">새 비밀번호</label>
                <input type="password" id="fpw-new" class="find__input js-find-pw" placeholder="8자 이상, 영문·숫자 조합">
                <label class="find__label" for="fpw-new2">새 비밀번호 확인</label>
                <input type="password" id="fpw-new2" class="find__input js-find-pw2" placeholder="비밀번호를 다시 입력해주세요">
                <p class="find__error js-find-pw-error" hidden>비밀번호가 일치하지 않습니다.</p>
                <button type="button" class="btn btn--primary find__submit js-find-reset" disabled>비밀번호 변경</button>
            </div>

            {{-- 완료 --}}
            <div class="find__step js-find-step" data-step="3" hidden>
                <div class="find__done">
                    <span class="find__done-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                    <p class="find__done-title">비밀번호가 변경되었습니다</p>
                    <p class="find__done-desc">새 비밀번호로 다시 로그인해 주세요.</p>
                </div>
                <div class="find__actions">
                    <a href="{{ route('login') }}" class="btn btn--primary">로그인하기</a>
                </div>
            </div>
        </div>

        <p class="find__foot">계정을 찾을 수 없나요? <a href="{{ route('inquiry') }}">1:1 문의</a>로 알려주세요.</p>
    </section>
@endsection
