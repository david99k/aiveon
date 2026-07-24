<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 크리에이터 스튜디오 - 내 채널관리 (대시보드 포함).
 *
 * 서브메뉴 구성 : 내 채널관리 / 콘텐츠 관리 / 수익 관리 / 댓글 관리 / 라이브 관리 / 채널 설정.
 * 콘텐츠 상태는 심사 플로우(대기 → 심사중 → 공개 / 반려)를 따른다.
 *
 * 아래 데이터는 시안용 더미입니다. 실서비스 연동 시 DB/API 조회 결과로 교체하세요.
 */
class StudioController
{
    public function show(): View
    {
        return view('studio.show', [
            // 데뷔 영상 제출 진행 상태 (신청 완료 → 3개 제출 시 심사 시작). null 이면 안내 카드 미노출.
            'apply' => ['done' => 1, 'total' => 3],
            'channel' => [
                'name' => 'synergy 스튜디오',
                'handle' => '@synergy_on',
                'subscribers' => '3.2만',
                'videos' => 24,
                'avatar' => 'images/common/avatar_user.jpg',
            ],
            'stats' => [
                ['label' => '구독자', 'value' => '32,410', 'diff' => '▲ 512 (최근 7일)', 'dir' => 'up'],
                ['label' => '총 조회수', 'value' => '128만', 'diff' => '▲ 4.1%', 'dir' => 'up'],
                ['label' => '시청 시간', 'value' => '8,904시간', 'diff' => '▼ 1.2%', 'dir' => 'down'],
            ],
            'revenue' => ['label' => '이번 달 수익', 'value' => '₩1,284,000'],
            // status : live(공개) | review(심사중) | wait(대기) | reject(반려)
            'recent' => [
                ['title' => '마법 같은 우리의 모험', 'thumb' => 'images/main/poster_04.jpg', 'views' => '조회 4.2만', 'status' => 'live', 'statusLabel' => '공개'],
                ['title' => '아기 고양이의 모험', 'thumb' => 'images/main/poster_05.jpg', 'views' => '조회 1.8만', 'status' => 'review', 'statusLabel' => '심사중'],
                ['title' => '한 소녀의 피클볼 도전기', 'thumb' => 'images/main/poster_06.jpg', 'views' => '조회 -', 'status' => 'reject', 'statusLabel' => '반려'],
            ],
            'todos' => [
                ['type' => 'reject', 'text' => '반려 1건 — 사유 확인 후 재제출해 주세요', 'sub' => '한 소녀의 피클볼 도전기 · 저작권 확인 필요'],
                ['type' => 'review', 'text' => '심사중 1건 — 영업일 2~3일 소요됩니다', 'sub' => '아기 고양이의 모험'],
                ['type' => 'account', 'text' => '정산 계좌를 등록해 주세요', 'sub' => '수익 관리 > 정산 정보'],
            ],
        ]);
    }

    /**
     * 콘텐츠 관리 (Figma 762:11324 / 영상없을 시 762:11418).
     * 등록한 영상 목록을 표로 보여준다. $contents 가 비면 빈 상태 안내를 노출한다.
     */
    public function content(): View
    {
        return view('studio.content', [
            'contents' => [
                [
                    'title' => 'THE BETA',
                    'desc' => 'AI로 인해 위험에 빠진 미래사회의 모습을 그리는...',
                    'duration' => '15:23',
                    'thumb' => 'images/main/garo_img01.jpg',
                    'visibility' => '공개',
                    'date' => '2026.07.23',
                    'views' => '23',
                    'comments' => '10',
                ],
                [
                    'title' => '혼례 금지된 사랑',
                    'desc' => '세자와 무술의 이뤄질 수 없는 사랑이야기',
                    'duration' => '15:23',
                    'thumb' => 'images/main/garo_img02.jpg',
                    'visibility' => '공개',
                    'date' => '2026.07.23',
                    'views' => '23',
                    'comments' => '10',
                ],
            ],
        ]);
    }
}
