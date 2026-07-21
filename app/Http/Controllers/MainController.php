<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 메인(로그인 전) 페이지.
 *
 * 아래 데이터는 Figma 시안(Main - 로그인 전)의 더미 콘텐츠입니다.
 * 실서비스 연동 시 DB/API 조회 결과로 교체하세요.
 *
 * 딜리버러블 단독 유효성을 위해 기본 Controller 상속 없이 작성했습니다.
 * 프로젝트 관례에 따라 `extends Controller`를 추가해도 무방합니다.
 */
class MainController
{
    public function index(): View
    {
        return view('main.index', [
            'gnbMenus' => $this->gnbMenus(),
            'heroes' => $this->heroes(),
            'recommended' => $this->recommended(),
            'watching' => $this->watching(),
            'topList' => $this->topList(),
            'newPosters' => $this->newPosters(),
            // 시안 원본 타이틀이 "AIVEON TOP6"로 중복 표기되어 있어 그대로 반영 (기획 확인 필요)
            'creatorSectionTitle' => 'AIVEON TOP6',
            'creators' => $this->creators(),
            'family' => $this->family(),
            'discover' => $this->discover(),
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function gnbMenus(): array
    {
        return [
            ['label' => '추천', 'url' => '#', 'active' => true],
            ['label' => 'AI 쇼츠', 'url' => '#'],
            ['label' => 'AI 애니메이션', 'url' => '#'],
            ['label' => 'AI BL', 'url' => '#'],
            ['label' => 'AI 숏폼 드라마', 'url' => '#'],
            ['label' => 'AI 라이브 & 채널', 'url' => route('live')],
            ['label' => '성인 19+', 'url' => '#'],
        ];
    }

    /**
     * 히어로 슬라이더 콘텐츠 (Swiper).
     * 이미지는 웹 최적화 JPEG(hero_main*.jpg) 사용 — 원본 PNG는 같은 폴더에 보관.
     *
     * @return array<int, array<string, mixed>>
     */
    private function heroes(): array
    {
        return [
            [
                'badge' => 'OFFICIAL',
                'title' => '빛이 빛날 때',
                'tags' => ['2026', '드라마', '멜로'],
                'description' => "AI가 그려낸 새로운 빛의 이야기\n공식 오리지널 시리즈 단독 공개",
                'image' => 'images/main/hero_main.jpg',
                'play_url' => route('watch', 'drama'),
                'detail_url' => route('detail'),
            ],
            [
                'badge' => 'PREMIUM',
                'title' => '궁의 어둠, 달의 노래',
                'tags' => ['2026', '사극', '판타지'],
                'description' => "어둠에 잠긴 궁, 달빛으로 깨어나는 노래\nAI 오리지널 대서사시",
                'image' => 'images/main/hero_main02.jpg',
                'play_url' => route('watch', 'drama'),
                'detail_url' => route('detail'),
            ],
            [
                'badge' => 'NEW',
                'title' => 'AI 코드 : 인간의 경계',
                'tags' => ['2026', 'SF', '스릴러'],
                'description' => "인간과 AI, 그 경계가 무너지는 순간\n화제의 신작 시리즈",
                'image' => 'images/main/hero_main03.jpg',
                'play_url' => route('watch', 'movie'), // 1편짜리(영화)형 콘텐츠
                'detail_url' => route('detail'),
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function recommended(): array
    {
        return [
            $this->video('빛이 빛날때', 'images/main/thumb_wide_algorithm.jpg', isPremium: true, isNew: true),
            $this->video('AI 코드 : 인간의 경계', 'images/main/thumb_wide_aicode.jpg'),
            $this->video('THE BETA', 'images/main/thumb_wide_beta.jpg'),
            $this->video('어둠 너무 빛이 빛날 때', 'images/main/thumb_wide_dark.jpg'),
            $this->video('궁의 어둠, 달의 노래', 'images/main/thumb_wide_palace.jpg'),
            $this->video('마법같은 우리의 모험', 'images/main/thumb_wide_adventure.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_family.jpg'),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function watching(): array
    {
        return [
            $this->video('AI의 침공', 'images/main/thumb_wide_invasion.jpg', isPremium: true),
            $this->video('아기 고양이의 모험', 'images/main/garo_img01.jpg'),
            $this->video('네모의 꿈', 'images/main/thumb_wide_nemo.jpg'),
            $this->video('AI 코드 : 인간의 경계', 'images/main/thumb_wide_aicode.jpg'),
            $this->video('알고리즘 러브', 'images/main/thumb_wide_algorithm.jpg'),
            $this->video('THE BETA', 'images/main/thumb_wide_beta.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_palace.jpg'),
        ];
    }

    /** 세로 포스터(TOP6) : 클릭 시 플레이어 진입 @return array<int, array<string, mixed>> */
    private function topList(): array
    {
        $player = route('player');

        return [
            $this->video('영상 타이틀', 'images/main/poster_03.jpg', url: $player),
            $this->video('그 계정, 우리가 사랑한 시간', 'images/main/poster_01.jpg', isNew: true, url: $player),
            $this->video('아기 고양이의 모험', 'images/main/poster_05.jpg', url: $player),
            $this->video('한 소녀의 피클볼 도전기', 'images/main/poster_06.jpg', url: $player),
            $this->video('영상 타이틀', 'images/main/poster_01.jpg', url: $player),
            $this->video('영상 타이틀', 'images/main/poster_03.jpg', url: $player),
        ];
    }

    /** 세로 포스터(새로운 영상) : 클릭 시 플레이어 진입 @return array<int, array<string, mixed>> */
    private function newPosters(): array
    {
        $player = route('player');

        return [
            $this->video('영상 타이틀', 'images/main/poster_01.jpg', url: $player),
            $this->video('영상 타이틀', 'images/main/poster_02.jpg', url: $player),
            $this->video('영상 타이틀', 'images/main/poster_03.jpg', isPremium: true, url: $player),
            $this->video('영상 타이틀', 'images/main/poster_04.jpg', isPremium: true, url: $player),
            $this->video('아기 고양이의 모험', 'images/main/poster_05.jpg', isNew: true, url: $player),
            $this->video('영상 타이틀', 'images/main/poster_04.jpg', isPremium: true, url: $player),
            $this->video('한 소녀의 피클볼 도전기', 'images/main/poster_06.jpg', isNew: true, url: $player),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function creators(): array
    {
        return [
            $this->creator('라온', 'images/main/creator_profile_01.jpg'),
            $this->creator('이클립스', 'images/main/creator_profile_02.jpg'),
            $this->creator('피크니콘', 'images/main/creator_profile_03.jpg'),
            $this->creator('라온', 'images/main/creator_profile_04.jpg'),
            $this->creator('라온', 'images/main/creator_profile_05.jpg'),
            $this->creator('라온', 'images/main/creator_profile_06.jpg'),
            $this->creator('라온', 'images/main/creator_profile_07.jpg'),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function family(): array
    {
        return [
            $this->video('마법 같은 우리의 모험', 'images/main/thumb_wide_adventure.jpg', isPremium: true),
            $this->video('당신이 잠들어 있을 때', 'images/main/thumb_wide_sleep.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_cooking.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_family.jpg'),
            $this->video('한 소녀의 피클볼 도전기', 'images/main/garo_img02.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_invasion.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_algorithm.jpg'),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function discover(): array
    {
        return [
            $this->video('AI가 만든 미니어처 요리 만들기', 'images/main/thumb_wide_cooking.jpg', isPremium: true),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_adventure.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_aicode.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_nemo.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_beta.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_dark.jpg'),
            $this->video('빛이 빛날때', 'images/main/thumb_wide_cooking.jpg'),
        ];
    }

    /**
     * 카드 더미 데이터. 기본은 상세 페이지로, 세로(포스터) 썸네일은 $url 로
     * 플레이어(route('player'))를 넘겨 쇼츠/일반 콘텐츠 재생 플로우를 따른다.
     *
     * @return array<string, mixed>
     */
    private function video(string $title, ?string $thumb, bool $isPremium = false, bool $isNew = false, ?string $url = null): array
    {
        return [
            'title' => $title,
            'creator' => '크리에이터',
            'views' => '12만',
            'thumb' => $thumb,
            'is_premium' => $isPremium,
            'is_new' => $isNew,
            'url' => $url ?? route('detail'),
        ];
    }

    /** @return array<string, mixed> */
    private function creator(string $name, string $avatar): array
    {
        return [
            'name' => $name,
            'subscribers' => '99.2만',
            'avatar' => $avatar,
            'url' => '#',
        ];
    }
}
