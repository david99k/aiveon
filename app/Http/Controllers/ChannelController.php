<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 크리에이터 공개 채널 페이지 (일반 유저가 보는 화면).
 *
 * 유튜브 채널 페이지 구조를 AIVEON 다크 테마로 옮겼다 :
 *   배너 → 채널 헤더(아바타·채널명·핸들·구독자·소개·구독 버튼) → 탭(홈/동영상/재생목록/정보) → 콘텐츠 행
 *
 * 크리에이터 본인의 관리 화면은 /studio (내 채널)이며, 이 페이지는 그 "채널 보기" 대상이다.
 * 아래 값은 시안용 더미 — 실서비스 연동 시 {handle} 기반 DB/API 조회로 교체하세요.
 */
class ChannelController
{
    public function show(?string $handle = null): View
    {
        return view('channel.show', [
            'channel' => [
                'name' => 'synergy 스튜디오',
                'handle' => '@' . ($handle ?? 'synergy_on'),
                'avatar' => 'images/common/avatar_user.jpg',
                'banner' => 'images/channel/banner_synergy.jpg',
                'subscribers' => '3.2만',
                'videos' => '24',
                'views' => '128만',
                'since' => '2026.01 가입',
                'tagline' => 'AI로 만드는 따뜻한 이야기 · 매주 목요일 업로드',
                'description' => "AIVEON에서 활동 중인 AI 영상 크리에이터입니다.\n로맨스·힐링 드라마를 중심으로 AI 영상 콘텐츠를 제작합니다. 협업 문의는 이메일로 부탁드립니다.",
                'links' => [
                    ['label' => '인스타그램', 'url' => '#'],
                    ['label' => '문의 메일', 'url' => '#'],
                ],
                'tools' => ['Midjourney', 'Runway', 'ElevenLabs', 'Premiere Pro'],
            ],
            'tabs' => [
                ['label' => '홈', 'active' => true],
                ['label' => '동영상'],
                ['label' => '재생목록'],
                ['label' => '정보'],
            ],
            // 대표 영상 (채널 홈 최상단)
            'featured' => [
                'title' => '그 계절, 우리가 사랑한 시간',
                'thumb' => 'images/main/poster_01.jpg',
                'meta' => '조회수 42만 · 3일 전',
                'desc' => '가장 빛나던 계절, 서로를 지켜준 두 사람의 이야기. AI로 그려낸 감성 로맨스.',
                'url' => route('watch', 'drama'),
            ],
            'popular' => $this->row([1, 2, 3, 5, 6, 4]),
            'latest' => $this->row([6, 5, 3, 2, 1, 4]),
            'playlists' => $this->playlists(),
        ]);
    }

    /**
     * 채널 영상 행 (세로 포스터 — 사이트 공통 규칙).
     *
     * @param  array<int, int>  $order  poster_0N 번호 순서
     * @return array<int, array<string, mixed>>
     */
    private function row(array $order): array
    {
        $titles = [
            1 => '그 계절, 우리가 사랑한 시간',
            2 => '나의 알고리즘',
            3 => '밤이 우리를 부를 때',
            4 => '마법 같은 우리의 모험',
            5 => '아기 고양이의 모험',
            6 => '한 소녀의 피클볼 도전기',
        ];

        return array_map(fn (int $n) => [
            'title' => $titles[$n],
            'creator' => 'synergy 스튜디오',
            'views' => '12만',
            'thumb' => 'images/main/poster_0' . $n . '.jpg',
            'is_premium' => in_array($n, [1, 3], true),
            'url' => route('detail'),
        ], $order);
    }

    /** @return array<int, array<string, mixed>> */
    private function playlists(): array
    {
        return [
            ['title' => '힐링 로맨스 모음', 'count' => '8개 영상', 'thumb' => 'images/main/poster_01.jpg'],
            ['title' => '단편 시리즈', 'count' => '5개 영상', 'thumb' => 'images/main/poster_03.jpg'],
            ['title' => '메이킹 · 비하인드', 'count' => '4개 영상', 'thumb' => 'images/main/poster_05.jpg'],
        ];
    }
}
