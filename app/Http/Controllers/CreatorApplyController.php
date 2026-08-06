<?php

namespace App\Http\Controllers;

use App\Support\AiTools;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * 크리에이터 신청 (일반 회원 → 크리에이터 전환).
 *
 * 플로우 :
 *   신청서 작성(원페이지 · 4개 그룹) → 제출 → 접수 완료(심사중)
 *   → [운영자 심사 : ADMIN 03 크리에이터 관리] → 승인 → 데뷔 영상 3편 업로드(크리에이터 스튜디오)
 *   → 최종 검토 → 채널 공개
 *
 * 저장·심사 연동은 백엔드 연동 지점이며, 시안에서는 현재 값만 채워 보여준다.
 */
class CreatorApplyController
{
    /** 심사 소요 안내 (영업일) */
    private const REVIEW_DAYS = 3;

    /** 주력 카테고리 최대 선택 수 */
    private const MAX_CATEGORY = 2;

    public function show(): View
    {
        return view('creator.apply', [
            'maxCategory' => self::MAX_CATEGORY,
            'reviewDays' => self::REVIEW_DAYS,
            // 로그인 회원에게서 가져오는 값 (본인인증 결과 포함)
            'account' => [
                'name' => '김서연',
                'email' => 'seoyeon.kim@example.com',
                'verified' => true,
                'verifiedAt' => '2026-07-28',
                'verifiedBy' => '휴대폰 본인인증',
            ],
            // 신청서 초기값 (임시저장 복원 지점)
            'form' => [
                'channelName' => '',
                'handle' => '',
                'description' => '',
                'categories' => [],
                'tools' => [],
                'plan' => '',
            ],
            // 주력 카테고리 : 서비스 GNB 콘텐츠 유형과 동일 체계
            'categories' => [
                'shorts' => '숏츠',
                'drama' => '드라마',
                'movie' => '영화',
                'animation' => '애니메이션',
                'bl' => 'BL',
            ],
            // 업로드 계획 : 심사 시 활동 지속성 판단 근거
            'plans' => [
                'w2' => '주 2회 이상',
                'w1' => '주 1회',
                'm2' => '2주에 1회',
                'm1' => '월 1회',
                'etc' => '아직 정하지 못했어요',
            ],
            // 사용하는 AI 툴 : 업로드 폼 "사용한 AI" 와 같은 선택지·같은 팝업
            'aiToolGroups' => AiTools::groups(),
            // 약관 : required 는 모두 동의해야 제출 가능
            'terms' => [
                ['key' => 'service', 'label' => '크리에이터 이용약관 및 수익 배분 정책에 동의합니다', 'required' => true],
                ['key' => 'copyright', 'label' => '저작권·초상권을 침해하지 않은 창작물임을 확인합니다', 'required' => true],
                ['key' => 'ai', 'label' => 'AI 생성물 표기 정책을 준수합니다', 'required' => true],
                ['key' => 'marketing', 'label' => '프로모션·이벤트 참여 안내 수신', 'required' => false],
            ],
        ]);
    }

    /**
     * 신청서 제출.
     * 실서비스 : 신청 레코드 생성 → 심사 대기열 등록 → 접수 알림(이메일·푸시) 발송.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'channel_name' => ['required', 'string', 'max:30'],
            'handle' => ['required', 'string', 'max:20', 'regex:/^[A-Za-z0-9_]+$/'],
            'description' => ['required', 'string', 'max:500'],
            'categories' => ['required', 'array', 'min:1', 'max:' . self::MAX_CATEGORY],
            'tools' => ['required', 'array', 'min:1'],
            'plan' => ['required', 'string'],
            'agree_service' => ['accepted'],
            'agree_copyright' => ['accepted'],
            'agree_ai' => ['accepted'],
        ], [
            'categories.max' => '주력 카테고리는 최대 ' . self::MAX_CATEGORY . '개까지 선택할 수 있습니다.',
            'handle.regex' => '핸들은 영문·숫자·밑줄(_)만 사용할 수 있습니다.',
        ]);

        // TODO: CreatorApplication::create([...]) + 심사 대기열 등록 + 접수 알림

        return redirect()->route('creator.applied');
    }

    /** 접수 완료(심사중) 안내. 실서비스 : 신청 레코드에서 번호·일시·상태 조회 */
    public function applied(): View
    {
        return view('creator.applied', [
            'reviewDays' => self::REVIEW_DAYS,
            'application' => [
                'no' => 'CR-2026-0728-041',
                'appliedAt' => '2026-07-28 14:20',
                'status' => '심사중',
            ],
            // state : done(완료) / now(진행중) / 그 외(대기)
            'steps' => [
                ['state' => 'done', 'name' => '신청 접수', 'when' => '2026-07-28 14:20'],
                ['state' => 'now', 'name' => '서류 · 계정 심사', 'when' => '진행중 · ' . self::REVIEW_DAYS . '영업일 이내'],
                ['state' => 'wait', 'name' => '승인 결과 안내', 'when' => '이메일 · 알림함'],
            ],
        ]);
    }
}
