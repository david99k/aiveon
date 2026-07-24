<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 쇼츠·일반 콘텐츠 플레이어 (Figma "Main - 재생버튼 클릭시 - 쇼츠 및 일반 컨텐츠영상", node 338:5895).
 *
 * 세로(포스터) 썸네일 클릭 시 진입하는 몰입형 재생 화면.
 * 위로 드래그(스와이프)하면 다음 쇼츠가 아래에서 올라오는 세로 피드 구조.
 * 실서비스 연동 시 {slug} 기반 조회 및 실제 영상 플레이어로 교체하세요.
 */
class PlayerController
{
    public function show(): View
    {
        return view('player.show', [
            'shorts' => $this->shorts(),
            // 로그인 여부 : 인증 연동 시 auth()->check() 로 교체. 시안은 로그인 상태 기준.
            'isLoggedIn' => true,
        ]);
    }

    /**
     * 세로 피드에 순서대로 쌓이는 쇼츠 목록.
     * 실서비스에서는 추천/큐 로직으로 교체하세요.
     *
     * @return array<int, array<string, mixed>>
     */
    private function shorts(): array
    {
        $aiTools = [
            ['icon' => 'images/player/ai_logo1.png', 'name' => 'AI 도구 1', 'light' => false],
            ['icon' => 'images/player/ai_logo2.png', 'name' => 'AI 도구 2', 'light' => false],
            ['icon' => 'images/player/ai_logo3.png', 'name' => 'AI 도구 3', 'light' => true],
        ];

        return [
            [
                'title' => '빛이 빛날 때',
                'source' => 'videos/cow_story.mp4', // 테스트 영상 - 실서비스에서 스트리밍 URL로 교체
                'poster' => 'images/player/poster_algorithm.jpg',
                'tags' => ['2026', '드라마', '멜로'],
                'ratings' => ['19+', '15+'],
                'synopsis' => '<빛이 빛날 때>는 각자의 가슴속에 깊은 상처와 어둠을 품고 살아가는 인물들이 서로의 삶에 스며들어 따뜻한 마음을 품는...',
                'likes' => '102',
                'comments' => '12',
                'progress' => 21, // 재생 진행률(%)
                'channel' => [
                    'name' => '거스구스',
                    'avatar' => 'images/player/avatar_gusgus.png',
                    'thumb' => 'images/player/rail_thumb.jpg',
                    'following' => true,
                ],
                'aiTools' => $aiTools,
                'commentList' => $this->comments(),
            ],
            [
                'title' => '여름의 기억',
                'source' => 'videos/shot01.mp4', // 테스트 영상 - 실서비스에서 스트리밍 URL로 교체
                'poster' => 'images/main/poster_02.jpg',
                'tags' => ['2026', '애니메이션', '판타지'],
                'ratings' => ['15+'],
                'synopsis' => '잊고 지낸 어느 여름날의 조각들이 천천히 되살아나며 마음 한켠을 데우는 짧은 이야기...',
                'likes' => '58',
                'comments' => '7',
                'progress' => 0,
                'channel' => [
                    'name' => '몽글스튜디오',
                    'avatar' => 'images/main/creator_profile_02.jpg',
                    'thumb' => 'images/main/poster_02.jpg',
                    'following' => false,
                ],
                'aiTools' => $aiTools,
                'commentList' => $this->summerComments(),
            ],
        ];
    }

    /** 슬라이드 0 (빛이 빛날 때) 댓글 @return array<int, array<string, string>> */
    private function comments(): array
    {
        $avatars = ['creator_profile_05', 'creator_profile_04', 'creator_profile_02', 'creator_profile_07', 'creator_profile_03'];

        $comments = array_map(fn (string $avatar) => [
            'user' => 'User3325421',
            'date' => '2026.07.08',
            'text' => '너무 슬퍼요 재미있을줄 알았는데 밤새...',
            'avatar' => "images/main/{$avatar}.jpg",
            'is_mine' => false, // 내 댓글 여부 : 인증 연동 시 작성자==현재 유저로 판정
        ], $avatars);

        // 시안 : 첫 댓글을 '내 댓글'로 표시해 더보기 메뉴(수정/삭제) 노출을 시연
        $comments[0]['is_mine'] = true;

        return $comments;
    }

    /** 슬라이드 1 (여름의 기억) 댓글 — 슬라이드 전환 시 패널이 이 목록으로 갱신된다. @return array<int, array<string, mixed>> */
    private function summerComments(): array
    {
        return [
            ['user' => 'User1555846', 'date' => '2026.07.19', 'text' => '여름 감성 가득... 그림체가 너무 예뻐요', 'avatar' => 'images/main/creator_profile_04.jpg', 'is_mine' => true],
            ['user' => 'User7782013', 'date' => '2026.07.18', 'text' => '마지막 장면에서 눈물이... 짧지만 여운이 길어요', 'avatar' => 'images/main/creator_profile_07.jpg', 'is_mine' => false],
            ['user' => 'User2094117', 'date' => '2026.07.18', 'text' => '이거 AI로 만든 거 맞아요? 퀄리티 미쳤다', 'avatar' => 'images/main/creator_profile_03.jpg', 'is_mine' => false],
        ];
    }
}
