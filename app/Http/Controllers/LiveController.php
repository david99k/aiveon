<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * AI 라이브채널 페이지 (GNB "AI 라이브채널" 클릭 진입).
 *
 * Figma: Main - 재생버튼 클릭시 - 라이브.
 * 시청(watch) 페이지와 동일한 레이아웃을 재사용하되,
 *  - 우측 사이드바의 "에피소드" 패널 → "Live 채널" 실시간 방송 목록
 *  - 정보 영역 : 시놉시스 대신 "현재 N명 시청중" + 설명 + 해시태그
 * 실서비스 연동 시 실제 라이브 스트림/시청자수/채널 목록으로 교체하세요.
 */
class LiveController
{
    public function show(): View
    {
        return view('live.show', [
            'video' => [
                'title' => '오늘의 주식 전망',
                'topbarTitle' => '오늘의 주식 전망',
                'topbarSub' => '실시간 라이브',
                // 테스트 영상(16:9). 실서비스에서 실제 라이브 스트림으로 교체.
                'source' => 'videos/drama01.mp4',
                'poster' => 'images/live/stream_stock.jpg',
                'tags' => ['2026', '드라마', '멜로'],
                'ratings' => ['19+', '15+'],
                'viewers' => '1,034',
                'description' => '오늘의 주식 전망에 대해서 이야기 해보아요',
                'hashtags' => ['주식시장', '주식', '대한민국주식'],
            ],
            'channel' => [
                'name' => '거스구스',
                'avatar' => 'images/player/avatar_gusgus.png',
                'following' => true,
            ],
            'aiTools' => [
                ['icon' => 'images/player/ai_logo1.png', 'name' => 'AI 도구 1', 'light' => false],
                ['icon' => 'images/player/ai_logo2.png', 'name' => 'AI 도구 2', 'light' => false],
                ['icon' => 'images/player/ai_logo3.png', 'name' => 'AI 도구 3', 'light' => true],
            ],
            'liveChannels' => $this->liveChannels(),
            'recommended' => $this->recommended(),
            'comments' => $this->comments(),
            // 로그인 여부 : 인증 연동 시 auth()->check() 로 교체. 시안은 로그인 상태 기준.
            'isLoggedIn' => true,
        ]);
    }

    /** 우측 "Live 채널" 실시간 방송 목록 @return array<int, array<string, string>> */
    private function liveChannels(): array
    {
        return [
            ['title' => 'AI가 바꾸는 미래 지금 시작됩니다.!', 'time' => '15:23', 'thumb' => 'images/live/ch_ai.jpg'],
            ['title' => '오늘의 주식 전망 : 실시간 분석 & 대응 전략', 'time' => '15:23', 'thumb' => 'images/live/ch_stock.jpg'],
            ['title' => '새로운 기술로 혁신을 이끄는 당신의 파트너', 'time' => '15:24', 'thumb' => 'images/live/ch_qa.jpg'],
            ['title' => '데이터 기반 의사결정으로 경쟁력 강화하기', 'time' => '15:24', 'thumb' => 'images/live/ch_ai.jpg'],
            ['title' => 'FPS 게임 시작', 'time' => '15:25', 'thumb' => 'images/live/ch_game.jpg'],
            ['title' => '미래를 예측하는 스마트한 비즈니스 솔루션', 'time' => '15:25', 'thumb' => 'images/live/ch_stock.jpg'],
        ];
    }

    /** @return array<int, array<string, string>> */
    private function recommended(): array
    {
        $items = [
            ['궁의 어둠, 달의 노래', 'images/main/thumb_wide_palace.jpg'],
            ['THE BETA', 'images/main/thumb_wide_beta.jpg'],
            ['궁의 어둠, 달의 노래', 'images/main/thumb_wide_palace.jpg'],
            ['알고리즘 러브', 'images/main/thumb_wide_algorithm.jpg'],
            ['궁의 어둠, 달의 노래', 'images/main/thumb_wide_palace.jpg'],
            ['알고리즘 러브', 'images/main/thumb_wide_algorithm.jpg'],
            ['THE BETA', 'images/main/thumb_wide_beta.jpg'],
        ];

        return array_map(fn (array $it) => [
            'title' => $it[0],
            'meta' => '크리에이터 · 조회수 12만',
            'thumb' => $it[1],
            'url' => route('detail'),
        ], $items);
    }

    /** @return array<int, array<string, mixed>> */
    private function comments(): array
    {
        $avatars = ['creator_profile_05', 'creator_profile_02', 'creator_profile_07', 'creator_profile_03', 'creator_profile_04', 'creator_profile_05'];

        $comments = array_map(fn (string $avatar) => [
            'user' => 'User3325421',
            'date' => '2026.07.08',
            'text' => '너무 슬퍼요 재미있을줄 알았는데 밤새...',
            'avatar' => "images/main/{$avatar}.jpg",
            'is_reply' => false,
            'is_mine' => false, // 내 댓글 여부 : 인증 연동 시 작성자==현재 유저로 판정
        ], $avatars);

        // 시안 : 첫 댓글을 '내 댓글'로 표시해 더보기 메뉴(수정/삭제) 노출을 시연
        $comments[0]['is_mine'] = true;

        // 마지막 댓글에 대댓글 1개 (시안)
        $comments[] = [
            'user' => 'User3325421',
            'date' => '2026.07.08',
            'text' => '너무 슬퍼요 재미있을줄 알았는데 밤새...',
            'avatar' => 'images/main/creator_profile_02.jpg',
            'is_reply' => true,
            'is_mine' => false,
        ];

        return $comments;
    }
}
