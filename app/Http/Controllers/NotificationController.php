<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 알림함 (GNB 종 아이콘 진입).
 *
 * 탭 : 전체 / 활동(구독·댓글·좋아요) / 서비스(공지·심사·정산).
 * 읽음 여부는 목록에 표시하며, 항목을 누르면 관련 화면으로 이동한다.
 * 실서비스에서는 알림 테이블 조회 + 읽음 처리 API 로 교체한다.
 */
class NotificationController
{
    public function index(): View
    {
        $items = $this->notifications();

        return view('notifications.index', [
            'tabs' => [
                ['key' => 'all', 'label' => '전체', 'count' => count($items)],
                ['key' => 'activity', 'label' => '활동', 'count' => count(array_filter($items, fn ($n) => $n['group'] === 'activity'))],
                ['key' => 'service', 'label' => '서비스', 'count' => count(array_filter($items, fn ($n) => $n['group'] === 'service'))],
            ],
            'notifications' => $items,
            'unread' => count(array_filter($items, fn ($n) => !$n['read'])),
        ]);
    }

    /**
     * 알림 목록 (최신순).
     * group : activity(구독·댓글·좋아요) / service(공지·심사·정산)
     * icon  : upload | comment | heart | notice | check | point
     *
     * @return array<int, array<string, mixed>>
     */
    private function notifications(): array
    {
        return [
            ['group' => 'activity', 'icon' => 'upload', 'title' => '거스구스님이 새 영상을 올렸어요', 'desc' => '그 계절, 우리가 사랑한 시간 · 12화', 'time' => '방금 전', 'read' => false, 'url' => 'detail'],
            ['group' => 'service', 'icon' => 'check', 'title' => '크리에이터 신청이 승인되었습니다', 'desc' => '데뷔 영상 3편을 올리면 최종 검토가 시작됩니다.', 'time' => '2시간 전', 'read' => false, 'url' => 'studio'],
            ['group' => 'activity', 'icon' => 'comment', 'title' => '내 댓글에 답글이 달렸어요', 'desc' => '"저도 이 장면이 제일 좋았어요" — 몽글스튜디오', 'time' => '5시간 전', 'read' => false, 'url' => 'detail'],
            ['group' => 'service', 'icon' => 'point', 'title' => '7월 수익이 확정되었습니다', 'desc' => '1,284,000 P · 수익 관리에서 확인하세요.', 'time' => '어제', 'read' => true, 'url' => 'studio.revenue'],
            ['group' => 'activity', 'icon' => 'heart', 'title' => '내 영상이 100개의 좋아요를 받았어요', 'desc' => '나의 알고리즘', 'time' => '어제', 'read' => true, 'url' => 'studio.content'],
            ['group' => 'service', 'icon' => 'notice', 'title' => '[공지] 7월 서비스 점검 안내', 'desc' => '7월 31일 02:00~04:00 서비스 일시 중단', 'time' => '2일 전', 'read' => true, 'url' => 'notice'],
            ['group' => 'activity', 'icon' => 'upload', 'title' => '몽글스튜디오님이 새 영상을 올렸어요', 'desc' => '아기 고양이의 모험 · 3화', 'time' => '3일 전', 'read' => true, 'url' => 'detail'],
            ['group' => 'service', 'icon' => 'check', 'title' => '콘텐츠 심사가 완료되었습니다', 'desc' => '밤이 우리를 부를 때 · 공개로 전환되었습니다.', 'time' => '5일 전', 'read' => true, 'url' => 'studio.content'],
        ];
    }
}
