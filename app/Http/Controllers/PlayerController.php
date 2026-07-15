<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 쇼츠·일반 콘텐츠 플레이어 (Figma "Main - 재생버튼 클릭시 - 쇼츠 및 일반 컨텐츠영상", node 338:5895).
 *
 * 세로(포스터) 썸네일 클릭 시 진입하는 몰입형 재생 화면.
 * 실서비스 연동 시 {slug} 기반 조회 및 실제 영상 플레이어로 교체하세요.
 */
class PlayerController
{
    public function show(): View
    {
        return view('player.show', [
            'video' => [
                'title' => '빛이 빛날 때',
                'source' => 'videos/cow_story.mp4', // 테스트 영상 - 실서비스에서 스트리밍 URL로 교체
                'poster' => 'images/player/poster_algorithm.jpg',
                'tags' => ['2026', '드라마', '멜로'],
                'ratings' => ['19+', '15+'],
                'synopsis' => '<빛이 빛날 때>는 각자의 가슴속에 깊은 상처와 어둠을 품고 살아가는 인물들이 서로의 삶에 스며들어 따뜻한 마음을 품는...',
                'likes' => '102',
                'comments' => '12',
                'progress' => 21, // 재생 진행률(%)
            ],
            'channel' => [
                'name' => '거스구스',
                'avatar' => 'images/player/avatar_gusgus.png',
                'thumb' => 'images/player/rail_thumb.jpg',
                'following' => true,
            ],
            'aiTools' => [
                ['icon' => 'images/player/ai_logo1.png', 'name' => 'AI 도구 1', 'light' => false],
                ['icon' => 'images/player/ai_logo2.png', 'name' => 'AI 도구 2', 'light' => false],
                ['icon' => 'images/player/ai_logo3.png', 'name' => 'AI 도구 3', 'light' => true],
            ],
            'comments' => $this->comments(),
        ]);
    }

    /** @return array<int, array<string, string>> */
    private function comments(): array
    {
        $avatars = ['creator_profile_05', 'creator_profile_04', 'creator_profile_02', 'creator_profile_07', 'creator_profile_03'];

        return array_map(fn (string $avatar) => [
            'user' => 'User3325421',
            'date' => '2026.07.08',
            'text' => '너무 슬퍼요 재미있을줄 알았는데 밤새...',
            'avatar' => "images/main/{$avatar}.jpg",
        ], $avatars);
    }
}
