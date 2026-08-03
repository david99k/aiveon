<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 프리미엄 구독 신청.
 *
 * 진입점 : 페이월 "프리미엄 구독하러 가기" · 마이페이지 사이드바 "Premium 구독" ·
 *          대시보드 "구독 중인 플랜" 카드.
 * 플랜 선택 → 결제 수단 → 자동갱신 동의 → "프리미엄 시작하기" → 완료 모달.
 * 실제 결제(PG 연동)·구독 생성은 백엔드 연동 지점이며,
 * 시안에서는 완료 시 데모 프리미엄 상태(body.is-premium)를 켜서 사이트 전체에 반영한다.
 */
class PremiumController
{
    public function show(): View
    {
        return view('premium.show', [
            // 혜택 : 페이월(initContentGates)과 동일한 4가지로 유지
            'benefits' => [
                ['icon' => 'crown', 'title' => '프리미엄 전용 콘텐츠', 'desc' => 'PREMIUM 배지가 붙은 시리즈·영화를 제한 없이 시청'],
                ['icon' => 'bolt', 'title' => '최신 콘텐츠 먼저보기', 'desc' => '신작을 공개 즉시, 누구보다 먼저'],
                ['icon' => 'hd', 'title' => '1080P (Full HD) 화질', 'desc' => '지원 콘텐츠를 최고 화질로 감상'],
                ['icon' => 'devices', 'title' => '여러 기기에서 시청', 'desc' => 'TV·태블릿·모바일 최대 4대 동시 이용'],
            ],
            // 무료 vs 프리미엄 비교
            'compare' => [
                ['label' => '프리미엄 전용관', 'free' => '잠김', 'premium' => '전체 시청'],
                ['label' => '신작 공개', 'free' => '순차 공개', 'premium' => '먼저 보기'],
                ['label' => '최고 화질', 'free' => '720P', 'premium' => '1080P (Full HD)'],
                ['label' => '동시 시청 기기', 'free' => '1대', 'premium' => '최대 4대'],
            ],
            // 플랜 : 연간은 월간 대비 2개월 무료
            'plans' => [
                ['key' => 'monthly', 'name' => '월간', 'price' => '₩14,900', 'per' => '/월', 'note' => '언제든 해지 가능', 'badge' => null, 'default' => true],
                ['key' => 'yearly', 'name' => '연간', 'price' => '₩149,000', 'per' => '/년', 'note' => '월 환산 ₩12,417', 'badge' => '2개월 무료', 'default' => false],
            ],
            'payMethods' => ['신용·체크카드', '카카오페이', '네이버페이', '휴대폰 결제'],
            'notices' => [
                '구독은 결제일 기준 매월(연간은 매년) 자동 갱신되며, 다음 결제일 전에 언제든 해지할 수 있습니다.',
                '해지해도 남은 이용 기간 동안 프리미엄 혜택이 유지됩니다.',
                '시청 이력이 없는 경우 결제 후 7일 이내 전액 환불됩니다.',
            ],
        ]);
    }
}
