<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 마이페이지 영역 - 로그인 후 프로필 메뉴 / 좌측 사이드바 진입.
 *
 * Figma: Synergy-on_aiveon (657:7279 회원정보 / 699:7870 즐겨찾기 / 699:8180 자주하는 질문).
 * 좌측 계정 사이드바(partials.mypage-sidebar 공유) + 우측 본문.
 * 값은 시안 더미 — 실서비스 연동 시 auth()->user() 등으로 교체하세요.
 */
class MypageController
{
    /** 회원정보 */
    public function show(): View
    {
        return view('mypage.show', [
            'account' => [
                'avatar' => 'images/common/avatar_user.jpg',
                'username' => 'User1555846',
                'posts' => '10',
                'subscribers' => '36만',
            ],
            // 모든 항목에 '변경' 링크 노출 (시안 업데이트로 아이디 필드 제거됨)
            'fields' => [
                ['label' => '닉네임', 'value' => 'synergy_on', 'change' => true],
                ['label' => '비번', 'value' => '*************', 'change' => true],
                ['label' => '이메일', 'value' => 'abc****@gmail.com', 'change' => true],
                ['label' => '전화번호', 'value' => '010-****-88777', 'change' => true],
            ],
            'subscription' => 'Free',
        ]);
    }

    /** 즐겨찾기 리스트 (세로 포스터 카드 그리드) */
    public function favorites(): View
    {
        $posters = ['poster_01', 'poster_02', 'poster_03', 'poster_04', 'poster_05', 'poster_06'];
        $items = [];
        for ($i = 0; $i < 12; $i++) {
            $items[] = [
                'title' => '영상 타이틀',
                'creator' => '크리에이터',
                'views' => '12만',
                'thumb' => 'images/main/' . $posters[$i % count($posters)] . '.jpg',
                'is_premium' => true,
                'url' => route('detail'),
            ];
        }

        return view('mypage.favorites', ['favorites' => $items]);
    }

    /** 자주하는 질문 (검색 + 칩 + 아코디언) */
    public function faq(): View
    {
        return view('mypage.faq', [
            'chips' => [
                '로그인이 안돼요',
                '프리미엄 구독은 어떻게 하나요?',
                '크리에이터로 전환하는방법',
                '결제수단 변경은 어떻게 하나요?',
            ],
            'faqs' => $this->faqs(),
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function faqs(): array
    {
        $nickname = '<p>회원님의 닉네임은 언제든지 자유롭게 변경하실 수 있습니다. 단, 변경 이후 7일 동안은 새로운 닉네임으로 다시 변경하실 수 없으니 유의해 주시기 바랍니다.</p>'
            . '<p class="faq__a-head">■ 닉네임 변경 방법</p>'
            . '<ul><li>경로: [마이페이지] &gt; [내 정보 수정] &gt; [닉네임 설정]</li>'
            . '<li>원하시는 닉네임을 입력하신 후 [저장] 버튼을 누르시면 즉시 반영됩니다.</li></ul>'
            . '<p class="faq__a-head">■ 닉네임 변경 시 유의사항</p>'
            . '<ul><li>7일 재변경 제한: 닉네임을 변경한 시점으로부터 7일(168시간) 동안은 다른 닉네임으로 다시 변경할 수 없습니다.</li>'
            . '<li>7일이 경과한 이후에는 횟수 제한 없이 다시 자유롭게 변경이 가능합니다.</li>'
            . '<li>해당 7일 재변경 제한 기간 외에 닉네임 변경과 관련된 별도의 추가 제약이나 조건은 없습니다.</li></ul>';

        return [
            ['q' => '아이디 변경은 어떻게 하나요?', 'open' => false, 'a' => '<p>아이디는 회원 식별을 위한 고유 정보로 변경이 불가능합니다. 다른 아이디 사용을 원하시면 새로 가입해 주세요.</p>'],
            ['q' => '닉네임 변경은 어떻게 진행이 되나요?', 'open' => true, 'a' => $nickname],
            ['q' => '비밀번호 변경을 하고 싶어요', 'open' => false, 'a' => '<p>[마이페이지] &gt; [내 정보 수정] &gt; [비밀번호] 에서 변경하실 수 있습니다. 보안을 위해 영문·숫자·특수문자를 조합해 주세요.</p>'],
            ['q' => '닉네임 변경은 어떻게 진행이 되나요?', 'open' => false, 'a' => $nickname],
        ];
    }
}
