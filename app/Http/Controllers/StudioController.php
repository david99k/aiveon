<?php

namespace App\Http\Controllers;

use App\Support\AiTools;
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

    /**
     * 채널 편집 (내 채널 > "채널 편집").
     * 공개 채널 페이지(/channel)에 노출되는 정보를 수정한다.
     * 저장은 백엔드 연동 지점이며, 시안에서는 현재 값만 채워 보여준다.
     */
    public function edit(): View
    {
        return view('studio.edit', [
            'channel' => [
                'name' => 'synergy 스튜디오',
                'handle' => 'synergy_on',
                'avatar' => 'images/common/avatar_user.jpg',
                'banner' => 'images/channel/banner_synergy.jpg',
                'tagline' => 'AI로 만드는 따뜻한 이야기 · 매주 목요일 업로드',
                'description' => "VIBUZZ에서 활동 중인 AI 영상 크리에이터입니다.\n로맨스·힐링 드라마를 중심으로 AI 영상 콘텐츠를 제작합니다. 협업 문의는 이메일로 부탁드립니다.",
                'email' => 'synergy@vibuzz.kr',
                'links' => [
                    ['label' => '인스타그램', 'url' => 'https://instagram.com/synergy_on'],
                    ['label' => '문의 메일', 'url' => 'mailto:synergy@vibuzz.kr'],
                ],
                'tools' => ['Midjourney', 'Runway', 'ElevenLabs', 'Premiere Pro'],
                'visibility' => 'public',
            ],
            // 채널 공개 범위
            'visibilities' => [
                'public' => '전체 공개 — 누구나 채널과 영상을 볼 수 있어요',
                'unlisted' => '검색 비노출 — 링크를 아는 사람만 볼 수 있어요',
                'private' => '비공개 — 나만 볼 수 있어요',
            ],
            // 채널에 표시할 대표 AI 툴 : 업로드 폼과 동일한 팝업(카테고리별 복수 선택)으로 고른다.
            'aiToolGroups' => AiTools::groups(),
        ]);
    }

    /**
     * 수익 관리 : 적립 수익을 "포인트"로 보여주고, 사용은 제휴 스토어(외부)에서 한다.
     * 출금/정산 계좌 개념 없음. 수익원은 광고 · 구독 분배 2가지.
     */
    public function revenue(): View
    {
        return view('studio.revenue', [
            // 포인트 사용처(외부 제휴 스토어) — 실주소 확정 시 교체
            'pointUrl' => '#',
            'stamp' => '2026-07-31',
            'cards' => [
                ['ico' => 'point', 'label' => '보유 포인트', 'value' => '12,480', 'unit' => 'P'],
                ['ico' => 'clock', 'label' => '정산 예정 포인트', 'value' => '1,720', 'unit' => 'P', 'note' => '정산 마감 후 확정', 'accent' => true],
                ['ico' => 'chart', 'label' => '총 누적 포인트', 'value' => '24,860', 'unit' => 'P', 'note' => '2026.01 ~ 현재'],
                ['ico' => 'eye', 'label' => '이번 달 유효 시청시간', 'value' => '42,000', 'unit' => '분'],
                ['ico' => 'pool', 'label' => '이번 달 SVOD 정산풀', 'value' => '68,000', 'unit' => 'P', 'note' => '전체 크리에이터 배분 재원'],
            ],
            'hero' => [
                'label' => '보유 포인트',
                'amount' => '12,480',
                'unit' => 'P',
                'desc' => 'VIBUZZ 제휴 스토어·서비스에서 사용할 수 있어요. (1P = 1원)',
                'btn' => '포인트 사용하기',
                'stats' => [
                    ['label' => '유료 순시청자', 'value' => '1,260명'],
                    ['label' => '작품 수', 'value' => '12편'],
                ],
            ],
            // 이번 달 수익 1,720 P 를 100%로 나눈 값. 합이 총액과 맞아야 한다.
            'mixTotal' => '1,720 P',
            'mix' => [
                ['label' => 'SVOD 구독 분배', 'pct' => 68, 'amount' => '1,170 P', 'color' => 'var(--brand-primary)'],
                ['label' => '광고 수익', 'pct' => 17, 'amount' => '292 P', 'color' => 'var(--accent-premium)'],
                ['label' => '외부 유통', 'pct' => 10, 'amount' => '172 P', 'color' => '#60a5fa'],
                ['label' => '기타', 'pct' => 5, 'amount' => '86 P', 'color' => 'var(--accent-gold)'],
            ],
            // 총 수익(실선) · SVOD 수익(점선). top 은 세로축 최댓값.
            'trend' => [
                'labels' => ['3월', '4월', '5월', '6월', '7월', '8월'],
                'total' => [850, 1020, 1250, 1420, 1620, 1720],
                'svod' => [560, 680, 840, 960, 1110, 1170],
                'top' => 2000,
                'ticks' => 4,
                'unit' => 'P',
            ],
            'notes' => [
                ['title' => '회차별 정산점수', 'desc' => '정산용 유효 시청시간 × 완주율 가중치'],
                ['title' => '크리에이터 점유율', 'desc' => '내 총점 ÷ 전체 크리에이터 총점'],
                ['title' => '월 SVOD 정산액', 'desc' => '월 정산풀 × 크리에이터 점유율'],
            ],
            // 68,000 P × 1.72% = 1,170 P → 수익 구성의 SVOD 금액과 맞는다.
            'metrics' => [
                ['ico' => 'play', 'label' => '정산용 유효 시청시간', 'value' => '42,000분'],
                ['ico' => 'star', 'label' => '내 총점', 'value' => '45,730점'],
                ['ico' => 'users', 'label' => '전체 크리에이터 총점', 'value' => '2,658,720점'],
                ['ico' => 'pie', 'label' => '크리에이터 점유율', 'value' => '1.72%', 'key' => true],
            ],
            // status : done(확정) | wait(보류·미달)
            'detail' => [
                ['title' => '김반장', 'episode' => '1화', 'minutes' => '10,000분', 'rate' => '80%', 'weight' => '× 1.13', 'score' => '11,300점', 'viewers' => '640명', 'status' => 'done', 'statusLabel' => '확정'],
                ['title' => '김반장', 'episode' => '2화', 'minutes' => '12,000분', 'rate' => '90%', 'weight' => '× 1.19', 'score' => '14,280점', 'viewers' => '410명', 'status' => 'done', 'statusLabel' => '확정'],
                ['title' => '실루엣', 'episode' => '1화', 'minutes' => '5,000분', 'rate' => '55%', 'weight' => '× 1.03', 'score' => '5,150점', 'viewers' => '195명', 'status' => 'done', 'statusLabel' => '확정'],
                ['title' => '수위', 'episode' => '1화', 'minutes' => '15,000분', 'rate' => '90%', 'weight' => '미적용', 'score' => '15,000점', 'viewers' => '15명', 'status' => 'wait', 'statusLabel' => '최소표본 미달'],
            ],
            'detailTotal' => ['title' => '합계', 'episode' => '4편', 'minutes' => '42,000분', 'score' => '45,730점', 'viewers' => '1,260명'],
            'guide' => [
                ['ico' => 'play', 'text' => "동일 회원 · 동일 회차\n월 최대 인정 시간 150%"],
                ['ico' => 'repeat', 'text' => "같은 구간 반복 시청\n완주율 미적용"],
                ['ico' => 'users', 'text' => "최소 표본 20명 이하 회차\n완주율 가중치 미적용"],
                ['ico' => 'chart', 'text' => "유효 시청시간과 완주율\n회차별로 별도 계산"],
                ['ico' => 'shield', 'text' => "무료 콘텐츠 · 비정상 재생\n정산 대상 제외"],
            ],
            'foot' => '정산 데이터는 마감 후 확정되며, 세부 집계는 크리에이터 스튜디오 대시보드에서 확인할 수 있습니다.',
        ]);
    }

    /**
     * 댓글 관리 : 내 콘텐츠에 달린 댓글 관리(답글·숨김·신고 처리).
     * 탭(전체/답글 대기/신고됨/내가 남긴 댓글)은 정적 필터 데모.
     */
    public function comments(): View
    {
        return view('studio.comments', [
            'summary' => [
                ['label' => '전체 댓글', 'value' => '1,204'],
                ['label' => '답글 대기', 'value' => '18'],
                ['label' => '신고 접수', 'value' => '3', 'alert' => true],
            ],
            'tabs' => [
                ['label' => '전체', 'count' => '1,204', 'active' => true],
                ['label' => '답글 대기', 'count' => '18'],
                ['label' => '신고됨', 'count' => '3'],
                ['label' => '내가 남긴 댓글'],
            ],
            // type : reported(신고됨) | waiting(답글 대기) | replied(답글 완료)
            'comments' => [
                [
                    'type' => 'reported',
                    'user' => 'unknown_user',
                    'avatar' => 'images/common/default_icon.png',
                    'time' => '2시간 전',
                    'flag' => '신고 2건 · 스팸/욕설',
                    'text' => '△△△ 사이트에서 무료로 보세요 링크 → …',
                    'on' => '마법 같은 우리의 모험',
                    'url' => route('detail'),
                ],
                [
                    'type' => 'waiting',
                    'user' => 'bright_moon',
                    'avatar' => 'images/common/avatar_user.jpg',
                    'time' => '5시간 전',
                    'text' => '3화 결말 진짜 최고였어요 ㅠㅠ 다음 편 언제 올라오나요? 매주 기다리고 있습니다!',
                    'on' => '빛이 빛날 때',
                    'url' => route('watch', 'drama'),
                ],
                [
                    'type' => 'replied',
                    'user' => 'pixel_kim',
                    'avatar' => 'images/common/avatar_user.jpg',
                    'time' => '어제',
                    'text' => '작화 퀄리티가 미쳤네요. AI로 이 정도까지 가능하군요 👏',
                    'on' => '아기 고양이의 모험',
                    'url' => route('detail'),
                    'reply' => ['user' => 'synergy_on', 'text' => '감사합니다! 다음 작품도 기대해 주세요 🙌'],
                ],
            ],
        ]);
    }
}
