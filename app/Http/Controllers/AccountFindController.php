<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 아이디 찾기 / 비밀번호 재설정 (로그인 화면 하단 진입).
 *
 * 한 페이지 안에서 탭으로 전환한다.
 *   아이디 찾기   : 이름 + 휴대폰 인증 → 마스킹된 아이디 표시
 *   비밀번호 재설정 : 아이디 + 인증(이메일·휴대폰) → 새 비밀번호 설정
 * 인증번호 발송·검증은 백엔드 연동 지점이며, 시안에서는 단계 전환만 재현한다.
 */
class AccountFindController
{
    public function show(): View
    {
        return view('auth.find', [
            'methods' => [
                ['key' => 'phone', 'label' => '휴대폰 인증'],
                ['key' => 'email', 'label' => '이메일 인증'],
            ],
            // 아이디 찾기 결과 (인증 통과 시 노출)
            'foundIds' => [
                ['id' => 'syn****@gmail.com', 'joined' => '2026-06-02', 'type' => '이메일 가입'],
            ],
        ]);
    }
}
