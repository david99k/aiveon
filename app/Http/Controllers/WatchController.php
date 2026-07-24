<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 드라마/영화 재생 페이지 (재생버튼 클릭 시 진입).
 *
 * Figma: Main - 재생버튼 클릭시 - 드라마(338:5601) / 영화(484:4617)
 *  - drama : 회차형 콘텐츠. 우측 사이드바에 에피소드 패널 노출.
 *  - movie : 영화 등 1편짜리 콘텐츠. 에피소드 패널 없음.
 *
 * 실서비스 연동 시 {slug} 기반 조회로 교체하고, 콘텐츠의 회차 여부에 따라
 * 두 타입 중 하나로 라우팅하세요.
 */
class WatchController
{
    public function show(string $type = 'drama'): View
    {
        $isDrama = $type !== 'movie';

        return view('watch.show', [
            'isDrama' => $isDrama,
            'video' => [
                'title' => $isDrama ? '빛이 빛날 때' : 'THE BETA',
                'subtitle' => $isDrama ? '1화 · 빛의 시작' : '영화 · 본편',
                'badge' => $isDrama ? 'OFFICIAL' : null,
                'source' => 'videos/drama01.mp4', // 테스트 영상(16:9) - 드라마·영화 공통, 실서비스에서 교체
                'poster' => $isDrama ? 'images/main/hero_main.jpg' : 'images/main/thumb_wide_beta.jpg',
                'tags' => ['2026', '드라마', '멜로'],
                // 연령 등급은 콘텐츠당 하나만 (19+와 15+ 공존 불가)
                'ratings' => ['15+'],
                'synopsis' => ($isDrama ? '<빛이 빛날 때>' : '<THE BETA>') . "는 각자의 가슴속에 깊은 상처와 어둠을 품고 살아가는 인물들이 서로의 삶에 스며들어 따뜻한 위로와 희망이 되어주는 힐링 휴먼 로맨스 드라마입니다.\n\"당신의 하루에, 가장 따뜻한 빛이 되기를\"이라는 메인 카피처럼, 치열하고 삭막한 현실 속에서 길을 잃고 지친 사람들이 어떻게 서로를 구원하고 치유하는지를 섬세한 시선으로 그려냅니다. 사랑하는 사람의 품에 기대어 비로소 평안을 찾은 두 남녀 주인공을 중심으로, 저마다의 사연과 삶의 무게를 짊어진 다양한 주변 인물들의 이야기가 옴니버스처럼 따스하게 교차합니다.",
            ],
            'channel' => [
                'name' => '거스구스',
                'avatar' => 'images/player/avatar_gusgus.png',
                'following' => !$isDrama, // 드라마 화면은 미팔로우(팔로우 버튼) 상태 시안
            ],
            'aiTools' => [
                ['icon' => 'images/player/ai_logo1.png', 'name' => 'AI 도구 1', 'light' => false],
                ['icon' => 'images/player/ai_logo2.png', 'name' => 'AI 도구 2', 'light' => false],
                ['icon' => 'images/player/ai_logo3.png', 'name' => 'AI 도구 3', 'light' => true],
            ],
            'seasons' => ['시즌 1', '시즌 2'],
            'episodes' => $isDrama ? $this->episodes() : [],
            'recommended' => $this->recommended(),
            'comments' => $this->comments(),
            // 로그인 여부 : 인증 연동 시 auth()->check() 로 교체. 시안은 로그인 상태 기준.
            'isLoggedIn' => true,
        ]);
    }

    /** @return array<int, array<string, string>> */
    private function episodes(): array
    {
        return array_map(fn (int $n) => [
            'title' => "{$n}화",
            'desc' => '"당신의 하루에, 가장 따뜻한 빛이 되기를"이라는 메인 카피처럼, 치열하고 삭막한 현실 속에서 길을 잃고 지친 사람들이 어떻게 서로...',
            'thumb' => 'images/main/hero_main.jpg',
            'url' => route('watch', 'drama'),
            'premium' => $n >= 3, // 3화부터 프리미엄(유료) — 회차 옆 PREMIUM 배지
        ], range(1, 6));
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
