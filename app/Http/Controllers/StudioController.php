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
                'description' => "AIVEON에서 활동 중인 AI 영상 크리에이터입니다.\n로맨스·힐링 드라마를 중심으로 AI 영상 콘텐츠를 제작합니다. 협업 문의는 이메일로 부탁드립니다.",
                'email' => 'synergy@aiveon.kr',
                'links' => [
                    ['label' => '인스타그램', 'url' => 'https://instagram.com/synergy_on'],
                    ['label' => '문의 메일', 'url' => 'mailto:synergy@aiveon.kr'],
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
            // 채널에 표시할 대표 AI 툴 후보 (업로드 시 기록된 "사용한 AI" 상위)
            'toolOptions' => ['Midjourney', 'Runway', 'ElevenLabs', 'Premiere Pro', 'Kling', 'Suno', 'Photoshop', 'ChatGPT Plus/Pro'],
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
            'summary' => [
                ['label' => '사용 가능 포인트', 'value' => '3,920,000', 'unit' => 'P', 'note' => '제휴 스토어에서 사용 가능', 'accent' => true],
                ['label' => '이번 달 적립 수익', 'value' => '₩1,102,000', 'note' => '▲ 4.1% (지난달 대비)', 'dir' => 'up'],
                ['label' => '총 누적 수익', 'value' => '₩10,650,000', 'note' => '2026.01 ~ 현재'],
                ['label' => '이번 달 재생 수', 'value' => '128만', 'note' => '▲ 12.3%', 'dir' => 'up'],
            ],
            // 월별 추이 (단위 만원). height 는 최대값 대비 비율(%)
            'trend' => [
                ['month' => '2월', 'value' => 58, 'height' => 43],
                ['month' => '3월', 'value' => 67, 'height' => 50],
                ['month' => '4월', 'value' => 77, 'height' => 57],
                ['month' => '5월', 'value' => 84, 'height' => 62],
                ['month' => '6월', 'value' => 99, 'height' => 73],
                ['month' => '7월', 'value' => 110, 'height' => 82, 'current' => true],
            ],
            'composition' => [
                ['label' => '광고 수익', 'pct' => 67, 'color' => '#a78bfa'],
                ['label' => '구독 분배', 'pct' => 33, 'color' => '#67e8c3'],
            ],
            'top' => [
                'title' => '그 계절, 우리가 사랑한 시간',
                'thumb' => 'images/main/poster_01.jpg',
                'meta' => '₩360,000 · 재생 42만',
            ],
            // status : done(적립 완료) | wait(적립 예정)
            'history' => [
                ['month' => '2026.07', 'ad' => '742,000', 'sub' => '360,000', 'point' => '1,102,000 P', 'status' => 'wait', 'statusLabel' => '적립 예정'],
                ['month' => '2026.06', 'ad' => '668,000', 'sub' => '324,000', 'point' => '992,000 P', 'status' => 'done', 'statusLabel' => '적립 완료'],
                ['month' => '2026.05', 'ad' => '552,000', 'sub' => '286,000', 'point' => '838,000 P', 'status' => 'done', 'statusLabel' => '적립 완료'],
                ['month' => '2026.04', 'ad' => '505,000', 'sub' => '264,000', 'point' => '769,000 P', 'status' => 'done', 'statusLabel' => '적립 완료'],
            ],
            'point' => ['balance' => '3,920,000', 'desc' => 'AIVEON 제휴 스토어·서비스에서 바로 사용할 수 있어요. (1P = 1원)'],
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
