<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * 로그인 / 회원가입 (로그인 전).
 *
 * Figma "Synergy-on_aiveon" 기준 3단계 온보딩을 한 페이지에서 처리한다.
 *   1) 가입 정보 (이메일/비밀번호)
 *   2) 이메일 인증번호 + 약관 동의
 *   3) 본인 인증 (이름/휴대폰, 최종 제출)
 *
 * 단계 전환은 클라이언트(JS, .auth-flow)에서 부드럽게 처리하며, 최종 제출 시
 * 아래 register()가 전체 필드를 한 번에 검증한다. 서버 검증 실패 시 첫 에러가
 * 있는 단계가 자동으로 펼쳐진다(뷰의 $errStep 로직).
 *
 * 실제 계정 생성·SMS/메일 발송·소셜 로그인 연동은 통합 시 채워 넣으세요.
 */
class AuthController
{
    /** 회원가입/로그인 화면 (단일 페이지 멀티스텝) */
    public function show(): View
    {
        return view('auth.signup');
    }

    /** 전체 단계 최종 제출 처리 → 가입 완료 후 메인으로 이동 */
    public function register(Request $request): RedirectResponse
    {
        // 휴대폰 번호는 '-' 없이 숫자만 남겨 검증한다.
        $request->merge([
            'phone' => preg_replace('/\D/', '', (string) $request->input('phone', '')),
        ]);

        $request->validate([
            // 1단계
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
            'password_confirmation' => ['required', 'same:password'],
            'agree' => ['accepted'],
            // 2단계
            'code' => ['required', 'digits:6'],
            'terms' => ['required', 'array'],
            'terms.*' => ['string'],
            // 3단계
            'name' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'regex:/^01[0-9]{8,9}$/'],
        ], [
            'email.required' => '이메일을 입력해주세요.',
            'email.email' => '올바른 이메일 형식이 아닙니다.',
            'password.required' => '비밀번호를 입력해주세요.',
            'password.min' => '비밀번호를 8자 이상 입력해주세요.',
            'password_confirmation.required' => '비밀번호 확인을 입력해주세요.',
            'password_confirmation.same' => '비밀번호가 일치하지 않습니다.',
            'agree.accepted' => '이용약관 및 개인정보 처리방침에 동의해주세요.',
            'name.required' => '이름을 입력해주세요.',
            'name.max' => '이름은 50자 이내로 입력해주세요.',
            'phone.required' => '휴대폰 번호를 입력해주세요.',
            'phone.regex' => '올바른 휴대폰 번호를 입력해주세요.',
            'code.required' => '메일 인증번호를 입력해주세요.',
            'code.digits' => '6자리 인증번호를 정확히 입력해주세요.',
            'terms.required' => '필수 약관에 모두 동의해주세요.',
            'terms.array' => '약관 동의 값이 올바르지 않습니다.',
        ]);

        // 필수 약관 동의 확인
        $required = ['term-privacy', 'term-age', 'term-service'];
        if (count(array_intersect($required, $request->input('terms', []))) < count($required)) {
            return back()
                ->withErrors(['terms' => '필수 약관에 모두 동의해주세요.'])
                ->withInput();
        }

        // TODO: 이메일 중복 확인 · 인증번호 검증 · 계정 생성 · 로그인 처리

        return redirect()->route('main')->with('status', '가입이 완료되었습니다.');
    }
}
