<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
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
    /**
     * 마이페이지 대시보드 (회원정보 + 허브 통합 · 단일 진입점).
     * 프로필 헤더 + 요약 카드(플랜·시청기록·즐겨찾기·내 문의) + 시청 기록 + 즐겨찾기 + 회원정보 카드.
     * 우측 상단 프로필 메뉴·하단 독·사이드바 "마이페이지"가 모두 이 화면으로 온다.
     */
    public function show(): View
    {
        $posters = ['poster_01', 'poster_02', 'poster_03', 'poster_04', 'poster_05', 'poster_06'];
        $items = [];
        for ($i = 0; $i < 12; $i++) {
            $n = $i % count($posters);
            $items[] = [
                'title' => $this->posterTitles()[$n],
                'creator' => $n % 2 === 0 ? '거스구스' : '몽글스튜디오',
                'creator_avatar' => 'images/main/creator_profile_0' . ($n + 1) . '.jpg',
                'views' => '12만',
                'thumb' => 'images/main/' . $posters[$n] . '.jpg',
                'is_premium' => true,
                'url' => route('detail'),
            ];
        }

        $inquiries = $this->inquiries();

        return view('mypage.dashboard', [
            'account' => [
                'avatar' => 'images/common/avatar_user.jpg',
                'username' => 'User1555846',
                'posts' => '10',
                'subscribers' => '36만',
            ],
            // 모든 항목에 '변경' 링크 노출 (시안 업데이트로 아이디 필드 제거됨)
            'fields' => [
                ['label' => '닉네임', 'value' => 'synergy_on'],
                ['label' => '비번', 'value' => '*************'],
                ['label' => '이메일', 'value' => 'abc****@gmail.com'],
                ['label' => '전화번호', 'value' => '010-****-88777'],
            ],
            'subscription' => 'Free',
            'history' => $this->watchHistory(),
            'favorites' => $items,
            'inquirySummary' => [
                'total' => count($inquiries),
                'progress' => count(array_filter($inquiries, fn ($q) => $q['status'] === 'progress')),
                'answered' => count(array_filter($inquiries, fn ($q) => $q['status'] === 'answered')),
            ],
        ]);
    }

    /**
     * 즐겨찾기 전체보기 (대시보드 "즐겨찾기 > 전체보기").
     * 시청 기록 전체보기와 동일한 포스터 그리드 + 스크롤 배치 로딩(initLoadMore).
     */
    public function favorites(): View
    {
        $posters = ['poster_01', 'poster_02', 'poster_03', 'poster_04', 'poster_05', 'poster_06'];
        $items = [];
        for ($i = 0; $i < 12; $i++) {
            $n = $i % count($posters);
            $items[] = [
                'title' => $this->posterTitles()[$n],
                'creator' => $n % 2 === 0 ? '거스구스' : '몽글스튜디오',
                'creator_avatar' => 'images/main/creator_profile_0' . ($n + 1) . '.jpg',
                'views' => '12만',
                'thumb' => 'images/main/' . $posters[$n] . '.jpg',
                'url' => route('detail'),
            ];
        }

        return view('mypage.favorites', [
            'favorites' => $items,
            'batch' => 8,
        ]);
    }

    /**
     * 시청 기록 전체보기 (대시보드 "시청 기록 > 전체보기").
     * 포스터 썸네일 그리드 + 스크롤 배치 로딩(8개 단위, initLoadMore).
     * 실서비스 : 페이지네이션 API 로 교체하는 지점 (시안은 전체 렌더 후 배치 공개).
     */
    public function history(): View
    {
        $base = $this->watchHistory();
        $dates = ['오늘', '어제', '2일 전', '3일 전', '5일 전', '1주 전', '2주 전', '3주 전'];
        $items = [];
        for ($i = 0; $i < 24; $i++) {
            $item = $base[$i % count($base)];
            $item['progress'] = str_replace('지난 시청 ', '', $item['progress']);
            $item['watched'] = $dates[intdiv($i, 3) % count($dates)];
            $items[] = $item;
        }

        return view('mypage.history', [
            'history' => $items,
            'batch' => 8,
        ]);
    }

    /**
     * 구독 (사이드바 "구독").
     * 상단에 구독중인 크리에이터, 그 아래에 구독 채널들이 올린 영상을
     * 크리에이터 구분 없이 최신순으로 모아 보여준다.
     */
    public function subscriptions(): View
    {
        return view('mypage.subscriptions', [
            'creators' => $this->subscribedCreators(),
            'feed' => $this->subscriptionFeed(),
        ]);
    }

    /**
     * 구독 채널 최신 영상 피드 (크리에이터 무관 · 최신순).
     *
     * @return array<int, array<string, mixed>>
     */
    private function subscriptionFeed(): array
    {
        // [포스터 번호, 타이틀, 크리에이터, 아바타 번호, 업로드 시점, 신규 여부, 프리미엄 여부]
        $items = [
            [1, '그 계절, 우리가 사랑한 시간', '거스구스', '01', '2시간 전', true, true],
            [5, '아기 고양이의 모험', '몽글스튜디오', '02', '5시간 전', true, false],
            [3, '밤이 우리를 부를 때', '라온', '03', '9시간 전', true, true],
            [2, '나의 알고리즘', '거스구스', '01', '어제', false, false],
            [6, '한 소녀의 피클볼 도전기', '이클립스', '04', '어제', false, true],
            [4, '마법 같은 우리의 모험', '피크니콘', '05', '2일 전', false, false],
            [3, '밤이 우리를 부를 때', '몽글스튜디오', '02', '3일 전', false, false],
            [1, '그 계절, 우리가 사랑한 시간', '시너지 스튜디오', '06', '4일 전', false, true],
            [5, '아기 고양이의 모험', '달빛서재', '07', '5일 전', false, false],
            [2, '나의 알고리즘', '라온', '03', '1주 전', false, false],
            [6, '한 소녀의 피클볼 도전기', '거스구스', '01', '1주 전', false, true],
            [4, '마법 같은 우리의 모험', '이클립스', '04', '2주 전', false, false],
        ];

        return array_map(fn (array $it) => [
            'title' => $it[1],
            'creator' => $it[2],
            'creator_avatar' => 'images/main/creator_profile_' . $it[3] . '.jpg',
            'creator_url' => route('channel'),
            'uploaded' => $it[4],
            'is_new' => $it[5],
            'is_premium' => $it[6],
            'thumb' => 'images/main/poster_0' . $it[0] . '.jpg',
            'url' => route('detail'),
        ], $items);
    }

    /** 포스터 아트에 새겨진 실제 타이틀 @return array<int, string> */
    private function posterTitles(): array
    {
        return [
            '그 계절, 우리가 사랑한 시간',
            '나의 알고리즘',
            '밤이 우리를 부를 때',
            '마법 같은 우리의 모험',
            '아기 고양이의 모험',
            '한 소녀의 피클볼 도전기',
        ];
    }

    /** 구독중인 크리에이터 @return array<int, array<string, mixed>> */
    private function subscribedCreators(): array
    {
        $list = [
            ['거스구스', 'creator_profile_01', '3.2만'],
            ['몽글스튜디오', 'creator_profile_02', '99.2만'],
            ['라온', 'creator_profile_03', '12.4만'],
            ['이클립스', 'creator_profile_04', '8.7만'],
            ['피크니콘', 'creator_profile_05', '5.1만'],
            ['시너지 스튜디오', 'creator_profile_06', '3.2만'],
            ['달빛서재', 'creator_profile_07', '2.8만'],
        ];

        return array_map(fn (array $c) => [
            'name' => $c[0],
            'avatar' => 'images/main/' . $c[1] . '.jpg',
            'subscribers' => $c[2],
            'url' => route('channel'),
        ], $list);
    }

    /** 시청 기록 (세로 포스터) @return array<int, array<string, mixed>> */
    private function watchHistory(): array
    {
        $items = [
            [1, '그 계절, 우리가 사랑한 시간', '거스구스', '지난 시청 82%'],
            [3, '밤이 우리를 부를 때', '몽글스튜디오', '지난 시청 45%'],
            [2, '나의 알고리즘', '거스구스', '지난 시청 100%'],
            [5, '아기 고양이의 모험', '몽글스튜디오', '지난 시청 30%'],
            [6, '한 소녀의 피클볼 도전기', '거스구스', '지난 시청 12%'],
            [4, '마법 같은 우리의 모험', '몽글스튜디오', '지난 시청 68%'],
        ];

        return array_map(fn (array $it) => [
            'title' => $it[1],
            'creator' => $it[2],
            'creator_avatar' => 'images/main/creator_profile_0' . $it[0] . '.jpg',
            'views' => '12만',
            'progress' => $it[3],
            'thumb' => 'images/main/poster_0' . $it[0] . '.jpg',
            'url' => route('detail'),
        ], $items);
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

    /** 1:1 문의 - 문의하기 (자주 찾는 질문 칩 + 문의 폼. 내역은 "내 문의 내역" 탭으로 분리) */
    public function inquiry(): View
    {
        return view('mypage.inquiry', [
            'chips' => [
                '로그인이 안돼요',
                '프리미엄 구독은 어떻게 하나요?',
                '크리에이터로 전환하는방법',
                '결제수단 변경은 어떻게 하나요?',
            ],
            'types' => ['사이트 이용', '회원/로그인', '환불/해지 신청', '장애신고', '기타'],
        ]);
    }

    /**
     * 회원 탈퇴 (회원정보 하단 "회원 탈퇴" 진입).
     * 탈퇴 시 사라지는 것 안내 → 사유 선택 → 유의사항 동의 → 비밀번호 확인 → 탈퇴.
     * 실제 처리는 백엔드 연동 지점이며, 시안에서는 완료 화면만 보여준다.
     */
    public function withdraw(): View
    {
        return view('mypage.withdraw', [
            'account' => [
                'username' => 'User1555846',
                'handle' => 'synergy_on',
                'joinedAt' => '2026-06-02',
                'plan' => 'Free',
            ],
            // 탈퇴 시 삭제되는 데이터 (되돌릴 수 없음을 명확히 보여준다)
            'losing' => [
                ['icon' => 'history', 'label' => '시청 기록', 'value' => '24편'],
                ['icon' => 'bookmark', 'label' => '즐겨찾기', 'value' => '12편'],
                ['icon' => 'subscribe', 'label' => '구독 중인 크리에이터', 'value' => '7명'],
                ['icon' => 'comment', 'label' => '작성한 댓글', 'value' => '87건'],
            ],
            'reasons' => [
                '보고 싶은 콘텐츠가 부족해요',
                '이용 빈도가 낮아요',
                '구독료가 부담돼요',
                '앱·재생 오류가 잦아요',
                '개인정보가 걱정돼요',
                '다른 서비스를 이용해요',
                '기타',
            ],
            // 탈퇴 전 반드시 확인해야 하는 사항 (모두 동의해야 진행)
            'notices' => [
                ['key' => 'erase', 'text' => '시청 기록·즐겨찾기·구독·댓글 등 모든 활동 정보가 삭제되며 복구할 수 없습니다.'],
                ['key' => 'point', 'text' => '보유 중인 포인트와 진행 중인 이벤트 혜택이 모두 소멸됩니다.'],
                ['key' => 'rejoin', 'text' => '동일한 이메일로 30일간 재가입할 수 없습니다.'],
                ['key' => 'keep', 'text' => '전자상거래법에 따라 결제 기록은 5년간 분리 보관 후 파기됩니다.'],
            ],
        ]);
    }

    /** 내 문의 내역 (고객센터 3번째 탭 · 접수한 문의와 답변 확인) */
    public function inquiryList(): View
    {
        return view('mypage.inquiries', [
            'inquiries' => $this->inquiries(),
        ]);
    }

    /**
     * 내 문의 내역 (최신순).
     * status : answered(답변 완료) / progress(처리중) / received(접수)
     * 실서비스에서는 로그인 사용자의 문의 목록을 조회한다.
     *
     * @return array<int, array<string, mixed>>
     */
    private function inquiries(): array
    {
        return [
            [
                'no' => 'Q-20260726-0142',
                'type' => '환불/해지 신청',
                'title' => '프리미엄 구독 해지 후 환불 문의',
                'body' => "7월 24일에 프리미엄 월간을 결제했는데 당일에 해지했습니다.\n환불이 가능한지 확인 부탁드립니다.",
                'date' => '2026-07-26',
                'status' => 'answered',
                'statusLabel' => '답변 완료',
                'answer' => [
                    'date' => '2026-07-27',
                    'body' => "안녕하세요, VIBUZZ 고객센터입니다.\n결제 후 7일 이내이고 시청 이력이 없어 전액 환불 대상입니다. 결제하신 수단으로 3~5영업일 내 환불 처리되며, 처리 완료 시 이메일로 안내드리겠습니다.\n이용에 불편을 드려 죄송합니다.",
                ],
            ],
            [
                'no' => 'Q-20260722-0098',
                'type' => '장애신고',
                'title' => '모바일에서 영상이 자꾸 끊깁니다',
                'body' => "안드로이드 앱에서 드라마 재생 시 2~3분마다 버퍼링이 발생합니다.\nWi-Fi 환경이고 다른 앱은 정상입니다.",
                'date' => '2026-07-22',
                'status' => 'answered',
                'statusLabel' => '답변 완료',
                'answer' => [
                    'date' => '2026-07-23',
                    'body' => "안녕하세요, VIBUZZ 고객센터입니다.\n해당 시간대 특정 지역 전송망 지연이 확인되어 조치를 완료했습니다. 앱을 최신 버전으로 업데이트하신 뒤에도 동일한 증상이 있으면 접속 시간과 콘텐츠명을 남겨주세요.\n감사합니다.",
                ],
            ],
            [
                'no' => 'Q-20260728-0007',
                'type' => '회원/로그인',
                'title' => '크리에이터 신청 후 심사 기간 문의',
                'body' => "어제 크리에이터 신청을 접수했는데 결과가 언제 나오는지 궁금합니다.",
                'date' => '2026-07-28',
                'status' => 'progress',
                'statusLabel' => '처리중',
                'answer' => null,
            ],
            [
                'no' => 'Q-20260718-0361',
                'type' => '사이트 이용',
                'title' => '찜한 콘텐츠가 목록에서 사라졌어요',
                'body' => "즐겨찾기에 담아둔 작품 일부가 보이지 않습니다.",
                'date' => '2026-07-18',
                'status' => 'answered',
                'statusLabel' => '답변 완료',
                'answer' => [
                    'date' => '2026-07-19',
                    'body' => "안녕하세요, VIBUZZ 고객센터입니다.\n권리사 사정으로 서비스가 종료된 작품은 즐겨찾기 목록에서도 자동으로 제외됩니다. 확인 결과 2편이 이에 해당하며, 나머지 목록은 정상입니다.\n감사합니다.",
                ],
            ],
        ];
    }

    /** 공지사항 목록 (일반 게시판 형태 : 고정 공지 + 목록 + 검색 + 페이지네이션) */
    public function notice(): View
    {
        return view('mypage.notice', [
            'categories' => ['전체', '서비스', '점검', '정책', '업데이트'],
            'notices' => $this->notices(),
        ]);
    }

    /** 공지사항 상세 */
    public function noticeShow(int $id = 1): View
    {
        $all = $this->notices();
        $idx = array_search($id, array_column($all, 'id'), true);
        $idx = $idx === false ? 0 : $idx;

        return view('mypage.notice-show', [
            'notice' => $all[$idx] + [
                'body' => "안녕하세요, VIBUZZ입니다.\n\n"
                    . "보다 안정적인 서비스 제공을 위해 아래와 같이 서버 점검을 진행합니다.\n"
                    . "점검 시간 동안에는 영상 시청 및 업로드를 포함한 전체 서비스 이용이 제한됩니다.\n\n"
                    . "■ 점검 일시 : 2026년 7월 30일(목) 02:00 ~ 06:00 (4시간)\n"
                    . "■ 점검 내용 : 서버 증설 및 데이터베이스 최적화\n"
                    . "■ 영향 범위 : 영상 시청 · 업로드 · 결제 · 로그인 전체\n\n"
                    . "점검 시간은 작업 상황에 따라 조기 종료되거나 연장될 수 있습니다.\n"
                    . "이용에 불편을 드려 죄송하며, 더 나은 서비스로 보답하겠습니다.\n\n"
                    . "감사합니다.",
            ],
            // 이전 글 / 다음 글
            'prev' => $all[$idx - 1] ?? null,
            'next' => $all[$idx + 1] ?? null,
        ]);
    }

    /** 이벤트 목록 (갤러리 형태 : 썸네일 카드 그리드 + 진행중/종료 필터) */
    public function event(): View
    {
        return view('mypage.event', [
            'filters' => ['전체', '진행중', '종료'],
            'events' => $this->events(),
        ]);
    }

    /** 이벤트 상세 */
    public function eventShow(int $id = 1): View
    {
        $all = $this->events();
        $idx = array_search($id, array_column($all, 'id'), true);
        $idx = $idx === false ? 0 : $idx;

        return view('mypage.event-show', [
            'event' => $all[$idx] + [
                'body' => "VIBUZZ에서 준비한 특별한 이벤트에 참여하고 푸짐한 혜택을 받아가세요!\n\n"
                    . "AI로 만든 나만의 영상을 업로드하고, 해시태그와 함께 공유하면 자동으로 응모됩니다.\n"
                    . '수상작은 VIBUZZ 메인 배너와 공식 SNS를 통해 소개될 예정입니다.',
                'how' => [
                    'VIBUZZ에 회원가입 후 로그인합니다.',
                    '이벤트 기간 내 AI로 제작한 영상을 업로드합니다.',
                    '업로드 시 "사용한 AI"를 정확히 선택해 주세요.',
                    '응모가 자동 완료되며, 결과는 마이페이지 알림으로 안내됩니다.',
                ],
                'prizes' => [
                    ['rank' => '대상 (1명)', 'reward' => '300만 포인트 + 메인 배너 노출'],
                    ['rank' => '최우수상 (3명)', 'reward' => '100만 포인트'],
                    ['rank' => '우수상 (10명)', 'reward' => '30만 포인트'],
                    ['rank' => '참가상 (전원)', 'reward' => '1만 포인트'],
                ],
                'notes' => [
                    '타인의 저작물을 무단 사용한 영상은 응모가 취소됩니다.',
                    '1인당 응모 횟수 제한은 없으나, 중복 수상은 불가합니다.',
                    '당첨자 발표 후 7일 내 미응답 시 자격이 소멸됩니다.',
                ],
            ],
        ]);
    }

    /**
     * 공지사항 더미. pinned = 목록 상단 고정
     *
     * @return array<int, array<string, mixed>>
     */
    private function notices(): array
    {
        return [
            ['id' => 5, 'category' => '점검', 'title' => '[점검] 7월 30일(목) 서버 정기 점검 안내', 'date' => '2026.07.25', 'views' => '1,284', 'pinned' => true],
            ['id' => 4, 'category' => '정책', 'title' => '[중요] 이용약관 및 개인정보처리방침 개정 안내 (8월 1일 시행)', 'date' => '2026.07.22', 'views' => '2,051', 'pinned' => true],
            ['id' => 3, 'category' => '업데이트', 'title' => 'AI 툴 도감 오픈 — 내가 쓴 AI로 만든 영상 모아보기', 'date' => '2026.07.18', 'views' => '3,472', 'pinned' => false],
            ['id' => 2, 'category' => '서비스', 'title' => '크리에이터 스튜디오 수익 관리 기능 오픈 안내', 'date' => '2026.07.11', 'views' => '1,905', 'pinned' => false],
            ['id' => 1, 'category' => '서비스', 'title' => 'VIBUZZ 정식 오픈 안내드립니다', 'date' => '2026.07.01', 'views' => '5,830', 'pinned' => false],
        ];
    }

    /**
     * 이벤트 더미. status : ongoing(진행중) | ended(종료)
     *
     * @return array<int, array<string, mixed>>
     */
    private function events(): array
    {
        return [
            ['id' => 1, 'title' => '2026 AI 영상 공모전', 'summary' => 'AI로 만든 나만의 영상으로 최대 300만 포인트에 도전하세요', 'thumb' => 'images/main/hero_main.jpg', 'period' => '2026.07.01 ~ 2026.08.31', 'status' => 'ongoing', 'statusLabel' => '진행중', 'dday' => 'D-35'],
            ['id' => 2, 'title' => '첫 업로드 웰컴 포인트', 'summary' => '첫 영상을 업로드한 크리에이터에게 5만 포인트를 드립니다', 'thumb' => 'images/main/garo_img01.jpg', 'period' => '2026.07.01 ~ 상시', 'status' => 'ongoing', 'statusLabel' => '진행중', 'dday' => '상시'],
            ['id' => 3, 'title' => 'Premium 구독 첫 달 50% 할인', 'summary' => '지금 구독하면 첫 달 반값, 광고 없이 전 작품 무제한', 'thumb' => 'images/main/hero_main02.jpg', 'period' => '2026.07.15 ~ 2026.08.15', 'status' => 'ongoing', 'statusLabel' => '진행중', 'dday' => 'D-19'],
            ['id' => 4, 'title' => '친구 초대 이벤트', 'summary' => '친구가 가입하면 둘 다 3만 포인트씩 적립', 'thumb' => 'images/main/garo_img02.jpg', 'period' => '2026.06.01 ~ 2026.07.31', 'status' => 'ongoing', 'statusLabel' => '진행중', 'dday' => 'D-4'],
            ['id' => 5, 'title' => 'AI 숏폼 챌린지', 'summary' => '60초 숏폼으로 겨루는 여름 챌린지 — 수상작 발표 완료', 'thumb' => 'images/main/hero_main03.jpg', 'period' => '2026.05.01 ~ 2026.06.15', 'status' => 'ended', 'statusLabel' => '종료', 'dday' => '종료'],
            ['id' => 6, 'title' => '봄맞이 감상 이벤트', 'summary' => '드라마 3편 감상하고 응모하면 추첨을 통해 기프티콘 증정', 'thumb' => 'images/main/thumb_wide_palace.jpg', 'period' => '2026.03.01 ~ 2026.04.30', 'status' => 'ended', 'statusLabel' => '종료', 'dday' => '종료'],
        ];
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
            ['q' => '닉네임 변경은 어떻게 진행이 되나요?', 'open' => false, 'a' => $nickname],
            ['q' => '비밀번호 변경을 하고 싶어요', 'open' => false, 'a' => '<p>[마이페이지] &gt; [내 정보 수정] &gt; [비밀번호] 에서 변경하실 수 있습니다. 보안을 위해 영문·숫자·특수문자를 조합해 주세요.</p>'],
            ['q' => '닉네임 변경은 어떻게 진행이 되나요?', 'open' => false, 'a' => $nickname],
        ];
    }
}
