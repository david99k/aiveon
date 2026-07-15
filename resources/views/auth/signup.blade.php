@extends('layouts.auth')

@section('title', '회원가입 · AIVEON')

@php
    /* 서버 유효성 실패 시, 첫(가장 이른) 에러 단계를 자동으로 펼친다.
       나중 대입이 최종값이므로, 이른 단계일수록 아래쪽에 두어 우선순위 step1 > step2 > step3 를 만든다. */
    $errStep = 1;
    if ($errors->hasAny(['name', 'phone'])) {
        $errStep = 3;
    }
    if ($errors->hasAny(['code', 'terms'])) {
        $errStep = 2;
    }
    if ($errors->hasAny(['email', 'password', 'password_confirmation', 'agree'])) {
        $errStep = 1;
    }

    $terms = [
        ['id' => 'term-privacy',   'req' => true,  'text' => '개인정보 수집 및 이용 안내 동의', 'view' => true],
        ['id' => 'term-age',       'req' => true,  'text' => '만 14세 이상입니다.',            'view' => false],
        ['id' => 'term-service',   'req' => true,  'text' => '서비스 이용약관 동의',            'view' => true],
        ['id' => 'term-marketing', 'req' => false, 'text' => 'AI 최신 소식 · 혜택 · 정보 수신',  'view' => true],
    ];
    /* 첫 진입 시 기본값(개인정보 동의 체크), 검증 실패 재렌더 시엔 실제 제출값을 반영 */
    $oldTerms = (array) old('terms', $errors->any() ? [] : ['term-privacy']);
@endphp

@section('content')
    {{-- 단일 페이지 3단계 온보딩 (가입정보 → 본인인증 → 이메일인증/약관) --}}
    <form class="auth__box auth-flow" data-step="{{ $errStep }}"
          action="{{ route('login.submit') }}" method="post" novalidate>
        @csrf

        <div class="auth-flow__nav">
            <button type="button" class="auth-flow__back js-flow-back" aria-label="이전 단계">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="auth-flow__progress" role="progressbar" aria-label="가입 진행 단계" aria-valuemin="1" aria-valuemax="3" aria-valuenow="{{ $errStep }}"><span class="auth-flow__bar"></span></div>
            <span class="auth-flow__count"><b class="js-flow-count">{{ $errStep }}</b><span class="dim"> / 3</span></span>
        </div>

        <p class="blind auth-flow__status" role="status" aria-live="polite"></p>

        <div class="auth-flow__viewport">
            <div class="auth-flow__track">

                {{-- STEP 1 : 가입 정보 --}}
                <section class="auth-step" data-step="1" aria-label="가입 정보 입력" @if($errStep !== 1) inert aria-hidden="true" @endif>
                    <div class="auth__head">
                        <h2 class="auth__title">AIVEON에 오신 걸 환영해요</h2>
                        <p class="auth__subtitle">몇 초면 끝나요. 바로 시청을 시작하세요</p>
                    </div>

                    <div class="field @error('email') is-error @enderror" data-field="email">
                        <label class="field__label" for="email">이메일</label>
                        <div class="field__control">
                            <input type="email" id="email" name="email" value="{{ old('email') }}"
                                   placeholder="you@example.com" autocomplete="email"
                                   aria-describedby="email-error" @error('email') aria-invalid="true" @enderror>
                            <span class="field__alert" aria-hidden="true">@include('auth.partials.alert-icon')</span>
                        </div>
                        <p class="field__error" id="email-error" role="alert">@include('auth.partials.error-icon')<span class="field__error-msg">{{ $errors->first('email') ?: '이미 사용중인 이메일입니다.' }}</span></p>
                    </div>

                    <div class="field @error('password') is-error @enderror" data-field="password">
                        <label class="field__label" for="password">비밀번호</label>
                        <div class="field__control">
                            <input type="password" id="password" name="password"
                                   placeholder="비밀번호를 입력해주세요" autocomplete="new-password"
                                   aria-describedby="password-error" @error('password') aria-invalid="true" @enderror>
                            <span class="field__alert" aria-hidden="true">@include('auth.partials.alert-icon')</span>
                            @include('auth.partials.pw-toggle')
                        </div>
                        <p class="field__error" id="password-error" role="alert">@include('auth.partials.error-icon')<span class="field__error-msg">{{ $errors->first('password') ?: '비밀번호를 8자 이상 입력해주세요.' }}</span></p>
                    </div>

                    <div class="field @error('password_confirmation') is-error @enderror" data-field="password_confirm">
                        <label class="field__label" for="password_confirm">비밀번호 확인</label>
                        <div class="field__control">
                            <input type="password" id="password_confirm" name="password_confirmation"
                                   placeholder="비밀번호를 다시 입력해주세요" autocomplete="new-password"
                                   aria-describedby="password-confirm-error" @error('password_confirmation') aria-invalid="true" @enderror>
                            <span class="field__alert" aria-hidden="true">@include('auth.partials.alert-icon')</span>
                            @include('auth.partials.pw-toggle')
                        </div>
                        <p class="field__error" id="password-confirm-error" role="alert">@include('auth.partials.error-icon')<span class="field__error-msg">{{ $errors->first('password_confirmation') ?: '비밀번호가 일치하지 않습니다.' }}</span></p>
                    </div>

                    <div class="auth__terms-row @error('agree') is-error @enderror">
                        <input type="checkbox" class="checkbox js-agree" id="agree" name="agree" value="1"
                               aria-describedby="agree-error" {{ old('agree', $errors->any() ? null : true) ? 'checked' : '' }}>
                        <label for="agree">이용약관 및 개인정보 처리방침에 동의합니다</label>
                    </div>
                    <p class="auth__terms-error @error('agree') is-visible @enderror" id="agree-error" role="alert">@include('auth.partials.error-icon')<span>{{ $errors->first('agree') ?: '이용약관 및 개인정보 처리방침에 동의해주세요.' }}</span></p>

                    <button type="button" class="auth__submit js-flow-next">회원가입</button>

                    <div class="auth__divider"><span>또는 SNS 계정으로 가입</span></div>

                    <div class="auth__social">
                        <a href="#" class="social--google" aria-label="Google로 가입"><img src="{{ asset('images/common/google.png') }}" alt=""></a>
                        <a href="#" class="social--kakao" aria-label="카카오로 가입"><img src="{{ asset('images/common/kakao.png') }}" alt=""></a>
                        <a href="#" class="social--naver" aria-label="네이버로 가입"><img src="{{ asset('images/common/naver.png') }}" alt=""></a>
                    </div>

                    <p class="auth__prompt">
                        <span class="auth__prompt-q">이미 AIVEON 회원이신가요?</span>
                        <a href="{{ route('login') }}">로그인</a>
                    </p>
                </section>

                {{-- STEP 2 : 이메일 인증 + 약관 동의 --}}
                <section class="auth-step" data-step="2" aria-label="이메일 인증 및 약관 동의" @if($errStep !== 2) inert aria-hidden="true" @endif>
                    <div class="auth__head">
                        <h2 class="auth__title">이메일 인증</h2>
                        <p class="auth__subtitle">닉네임과 이메일 인증, 약관 동의만 마치면 가입이 완료 됩니다.</p>
                    </div>

                    <div class="field @error('code') is-error @enderror" data-field="code">
                        <label class="field__label" for="code">메일 인증번호</label>
                        <div class="field__control">
                            <input type="text" id="code" name="code" placeholder="메일로 받은 6자리 코드"
                                   inputmode="numeric" maxlength="6" value="{{ old('code') }}"
                                   aria-describedby="code-error" @error('code') aria-invalid="true" @enderror>
                            <span class="field__timer js-code-timer">00:00</span>
                            <button type="button" class="field__inline-btn js-send-code">인증하기</button>
                        </div>
                        <div class="field__help">
                            <span class="field__help-q">코드를 못 받으셨나요?</span>
                            <a href="#" class="js-resend-code">인증번호 재전송</a>
                        </div>
                        <p class="field__error" id="code-error" role="alert">@include('auth.partials.error-icon')<span class="field__error-msg">{{ $errors->first('code') ?: '6자리 인증번호를 정확히 입력해주세요.' }}</span></p>
                    </div>

                    <div class="auth__hr"></div>

                    <label class="terms-all">
                        <input type="checkbox" class="checkbox checkbox--lg js-terms-all">
                        <span>약관에 모두 동의합니다</span>
                    </label>

                    <div class="terms-list">
                        @foreach ($terms as $term)
                            <div class="terms-item">
                                <div class="terms-item__main">
                                    <input type="checkbox" class="checkbox checkbox--lg js-terms-item"
                                           id="{{ $term['id'] }}" name="terms[]" value="{{ $term['id'] }}"
                                           {{ in_array($term['id'], $oldTerms, true) ? 'checked' : '' }}>
                                    <label for="{{ $term['id'] }}">
                                        <span class="terms-item__tag {{ $term['req'] ? 'terms-item__tag--req' : 'terms-item__tag--opt' }}">{{ $term['req'] ? '[필수]' : '[선택]' }}</span>
                                        <span class="terms-item__txt">{{ $term['text'] }}</span>
                                    </label>
                                </div>
                                @if ($term['view'])
                                    <a href="#" class="terms-item__view" aria-label="{{ $term['text'] }} 보기">보기</a>
                                @endif
                            </div>
                        @endforeach
                    </div>
                    <p class="js-terms-error @error('terms') is-visible @enderror" id="terms-error" role="alert">@include('auth.partials.error-icon')<span>{{ $errors->first('terms') ?: '필수 약관에 모두 동의해주세요.' }}</span></p>

                    <button type="button" class="auth__submit js-flow-next">다음</button>
                </section>

                {{-- STEP 3 : 본인 인증 (최종) --}}
                <section class="auth-step" data-step="3" aria-label="본인 인증" @if($errStep !== 3) inert aria-hidden="true" @endif>
                    <div class="auth__head">
                        <h2 class="auth__title">본인 인증</h2>
                        <p class="auth__subtitle">안전한 이용을 위해 본인 인증을 진행해주세요</p>
                    </div>

                    <div class="field @error('name') is-error @enderror" data-field="name">
                        <label class="field__label blind" for="name">이름</label>
                        <div class="field__control">
                            <input type="text" id="name" name="name" value="{{ old('name') }}"
                                   placeholder="이름을 입력해주세요" autocomplete="name"
                                   aria-describedby="name-error" @error('name') aria-invalid="true" @enderror>
                            <span class="field__alert" aria-hidden="true">@include('auth.partials.alert-icon')</span>
                        </div>
                        <p class="field__error" id="name-error" role="alert">@include('auth.partials.error-icon')<span class="field__error-msg">{{ $errors->first('name') ?: '이름을 입력해주세요.' }}</span></p>
                    </div>

                    <div class="field @error('phone') is-error @enderror" data-field="phone">
                        <label class="field__label blind" for="phone">휴대폰 번호</label>
                        <div class="field__control">
                            <input type="tel" id="phone" name="phone" value="{{ old('phone') }}"
                                   placeholder="휴대폰 번호를 입력해주세요" inputmode="numeric" autocomplete="tel"
                                   maxlength="13" aria-describedby="phone-error" @error('phone') aria-invalid="true" @enderror>
                            <span class="field__alert" aria-hidden="true">@include('auth.partials.alert-icon')</span>
                        </div>
                        <p class="field__error" id="phone-error" role="alert">@include('auth.partials.error-icon')<span class="field__error-msg">{{ $errors->first('phone') ?: '올바른 휴대폰 번호를 입력해주세요.' }}</span></p>
                    </div>

                    <button type="submit" class="auth__submit">동의하고 본인확인 하기</button>
                </section>

            </div>
        </div>
    </form>
@endsection
