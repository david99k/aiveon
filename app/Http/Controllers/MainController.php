<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 메인(로그인 전) 페이지.
 *
 * [기획 개편] 전 페이지 썸네일을 세로형(포스터)으로 통일.
 * - 상단 히어로 슬라이더 → 세로 포스터 캐러셀(상단 배너)로 교체
 * - 모든 행이 세로 포스터 카드(poster-card)
 * - 콘텐츠 type 에 따라 재생 플로우 분기:
 *     shorts → 세로 몰입 플레이어(route('player'))
 *     drama  → 일반(가로) 재생 페이지(route('watch','drama'))
 *     movie  → 일반(가로) 재생 페이지(route('watch','movie'))
 *
 * 아래 데이터는 Figma 시안(Main - 추천)의 더미 콘텐츠입니다.
 * 실서비스 연동 시 DB/API 조회 결과로 교체하세요.
 */
class MainController
{
    public function index(): View
    {
        return view('main.index', [
            'gnbMenus' => $this->gnbMenus(),
            // 첫 화면은 큰 히어로 슬라이더로 시작 (2026-07-23 복원)
            'heroes' => $this->heroes(),
            'watching' => $this->watching(),
            'topList' => $this->topList(),
            'newPosters' => $this->newPosters(),
            'creatorSectionTitle' => 'AIVEON TOP6',
            'creators' => $this->creators(),
            'family' => $this->family(),
            'discover' => $this->discover(),
        ]);
    }

    /**
     * 카테고리 페이지 (GNB 메뉴 클릭). 메인 레이아웃(main.index) 재사용.
     * animation/bl = 단일 카테고리 히어로 + 세로 포스터 행들,
     * shortform/adult = 히어로 없음, adult = 모든 타이틀 19 배지.
     */
    public function category(string $slug): View
    {
        // IA 명세 ver1.1 : 추천 / 숏츠 / 드라마 / 영화 / 애니메이션 / BL / AI 라이브채널 / 성인 19+
        // (shortform 은 GNB 미노출 레거시 — 직접 URL 접근만 지원)
        $config = [
            'shorts' => ['active' => '숏츠', 'age19' => false],
            'drama' => ['active' => '드라마', 'age19' => false],
            'movie' => ['active' => '영화', 'age19' => false],
            'animation' => ['active' => '애니메이션', 'age19' => false],
            'bl' => ['active' => 'BL', 'age19' => false],
            'shortform' => ['active' => '숏폼 드라마', 'age19' => false],
            'adult' => ['active' => '성인 19+', 'age19' => true],
        ][$slug];

        // 숏츠·숏폼 : 세로 이미지 전용 콘텐츠 → 모든 카드가 세로 몰입 플레이어(player)로 이동
        // TOP 랭킹·신규 행도 shorts 로 강제해 이 페이지에서는 가로 watch 로 새는 카드가 없도록 한다.
        if (in_array($slug, ['shorts', 'shortform'], true)) {
            return view('main.vertical', [
                'pageTitle' => $config['active'] . ' · AIVEON',
                'gnbMenus' => $this->gnbMenus($config['active']),
                'heroPosters' => $this->typed($this->heroPosters(), 'shorts'),
                'recommended' => $this->posterRow('shorts'),
                'topList' => $this->typed($this->topList(), 'shorts'),
                'newNew' => $this->posterRow('shorts', new: true),
                'newPremium' => $this->typed($this->newPosters(), 'shorts'),
                'creators' => $this->creators(),
                'family' => $this->posterRow('shorts'),
                'discover' => $this->posterRow('shorts'),
            ]);
        }

        $age19 = $config['age19'];

        // 드라마·영화 카테고리는 모든 카드가 해당 시청 페이지(watch/drama·movie)로 가도록 type 강제.
        $force = in_array($slug, ['drama', 'movie'], true) ? $slug : null;
        $rows = fn (array $items): array => $this->mark($force ? $this->typed($items, $force) : $items, $age19);

        // 드라마·영화·애니메이션·BL은 큰 히어로로 시작, 성인19+는 세로 포스터 배너 유지 (2026-07-23)
        $categoryHeroes = [
            'drama' => [[
                'badge' => 'OFFICIAL',
                'title' => '빛이 빛날 때',
                'tags' => ['2026', '드라마', '멜로'],
                'description' => "AI가 그려낸 새로운 빛의 이야기\n공식 오리지널 시리즈 단독 공개",
                'image' => 'images/main/hero_main.jpg',
                'play_url' => route('watch', 'drama'),
                'detail_url' => route('detail'),
            ]],
            'movie' => [[
                'badge' => 'NEW',
                'title' => 'AI 코드 : 인간의 경계',
                'tags' => ['2026', 'SF', '스릴러'],
                'description' => "인간과 AI, 그 경계가 무너지는 순간\n화제의 신작 시리즈",
                'image' => 'images/main/hero_main03.jpg',
                'play_url' => route('watch', 'movie'),
                'detail_url' => route('detail'),
            ]],
            'animation' => [[
                'badge' => 'PREMIUM',
                'title' => '당신이 잠들어 있을 때',
                'tags' => ['2026', '애니메이션', '가족'],
                'description' => "포근한 밤을 지켜주는 잠들기 전 이야기\nAI 오리지널 힐링 애니메이션",
                'image' => 'images/main/hero_animation.jpg',
                'play_url' => route('watch', 'movie'),
                'detail_url' => route('detail'),
            ]],
            'bl' => [[
                'badge' => 'PREMIUM',
                'title' => '서로의 계절',
                'tags' => ['2026', 'BL', '로맨스'],
                'description' => "우리가 사랑했던 그 여름날의 이야기\nAI 오리지널 BL 로맨스",
                'image' => 'images/main/hero_bl.jpg',
                'play_url' => route('watch', 'drama'),
                'detail_url' => route('detail'),
            ]],
        ][$slug] ?? null;

        return view('main.index', [
            'pageTitle' => $config['active'] . ' · AIVEON',
            'gnbMenus' => $this->gnbMenus($config['active']),
            'heroes' => $categoryHeroes,
            'heroPosters' => $categoryHeroes
                ? null
                : ($force ? $this->typed($this->heroPosters(), $force) : $this->heroPosters()),
            'watching' => $rows($this->watching()),
            'topList' => $rows($this->topList()),
            'newPosters' => $rows($this->newPosters()),
            'creatorSectionTitle' => 'AIVEON TOP6',
            'creators' => $this->creators(),
            'family' => $rows($this->family()),
            'discover' => $rows($this->discover()),
        ]);
    }

    /**
     * 홈(추천) 상단 빅 히어로 슬라이더 (3 슬라이드, Swiper).
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

    /**
     * 세로 포스터 캐러셀 배너 (BL·성인19+ 카테고리 상단).
     * 카드 클릭 시 콘텐츠 type 에 맞는 재생 페이지로 이동.
     *
     * @return array<int, array<string, mixed>>
     */
    private function heroPosters(): array
    {
        return [
            $this->poster('그 계절, 우리가 사랑한 시간', 'poster_01', 'drama'),
            $this->poster('우리, 그때', 'poster_02', 'drama'),
            $this->poster('한 소녀의 피클볼 도전기', 'poster_06', 'movie'),
            $this->poster('빛이 빛날 때', 'poster_03', 'drama'),
            $this->poster('에코', 'poster_04', 'drama'),
            $this->poster('나의 알고리즘', 'poster_05', 'drama'),
        ];
    }

    /** 시청중인 영상 (세로 포스터) @return array<int, array<string, mixed>> */
    private function watching(): array
    {
        return [
            $this->poster('그 계절, 우리가 사랑한 시간', 'poster_01', 'drama', premium: true),
            $this->poster('나의 알고리즘', 'poster_05', 'drama'),
            $this->poster('밤이 우리를 부를 때', 'poster_02', 'drama', premium: true),
            $this->poster('스튜디오 세션', 'poster_04', 'shorts'),
            $this->poster('영상 타이틀', 'poster_03', 'shorts', premium: true),
            $this->poster('영상 타이틀', 'poster_06', 'drama', premium: true),
            $this->poster('영상 타이틀', 'poster_01', 'drama', premium: true),
        ];
    }

    /** AIVEON TOP 10 (세로 포스터 + 큰 순위) : type 별 재생 @return array<int, array<string, mixed>> */
    private function topList(): array
    {
        return [
            $this->poster('밤이 우리를 부를 때', 'poster_03', 'drama'),
            $this->poster('그 계정, 우리가 사랑한 시간', 'poster_01', 'drama', new: true),
            $this->poster('스튜디오 세션', 'poster_04', 'shorts'),
            $this->poster('영상 타이틀', 'poster_06', 'movie'),
            $this->poster('영상 타이틀', 'poster_02', 'drama'),
            $this->poster('영상 타이틀', 'poster_05', 'shorts'),
        ];
    }

    /** 새로운 영상 (세로 포스터) @return array<int, array<string, mixed>> */
    private function newPosters(): array
    {
        return [
            $this->poster('영상 타이틀', 'poster_01', 'shorts'),
            $this->poster('영상 타이틀', 'poster_02', 'drama'),
            $this->poster('영상 타이틀', 'poster_03', 'drama', premium: true),
            $this->poster('영상 타이틀', 'poster_04', 'shorts', premium: true),
            $this->poster('아기 고양이의 모험', 'poster_05', 'shorts', new: true),
            $this->poster('영상 타이틀', 'poster_04', 'drama', premium: true),
            $this->poster('한 소녀의 피클볼 도전기', 'poster_06', 'movie', new: true),
        ];
    }

    /** 가족과 함께 볼 만한 영상 (세로 포스터) @return array<int, array<string, mixed>> */
    private function family(): array
    {
        return [
            $this->poster('마법 같은 우리의 모험', 'poster_04', 'movie', premium: true),
            $this->poster('당신이 잠들어 있을 때', 'poster_05', 'drama'),
            $this->poster('아기 고양이의 모험', 'poster_06', 'shorts'),
            $this->poster('빛이 빛날 때', 'poster_03', 'drama'),
            $this->poster('한 소녀의 피클볼 도전기', 'poster_01', 'movie'),
            $this->poster('영상 타이틀', 'poster_02', 'drama'),
            $this->poster('영상 타이틀', 'poster_03', 'shorts'),
        ];
    }

    /** 신기한 컨텐츠를 찾을 때 (세로 포스터, 쇼츠 위주) @return array<int, array<string, mixed>> */
    private function discover(): array
    {
        return [
            $this->poster('AI가 만든 미니어처 요리', 'poster_04', 'shorts', premium: true),
            $this->poster('60초 세계여행', 'poster_05', 'shorts'),
            $this->poster('스튜디오 세션', 'poster_06', 'shorts'),
            $this->poster('영상 타이틀', 'poster_01', 'shorts'),
            $this->poster('영상 타이틀', 'poster_02', 'shorts'),
            $this->poster('영상 타이틀', 'poster_03', 'drama'),
            $this->poster('영상 타이틀', 'poster_04', 'shorts'),
        ];
    }

    /**
     * 쇼츠·숏폼 카테고리용 세로 포스터 행 (모두 세로 재생 = player).
     *
     * @return array<int, array<string, mixed>>
     */
    private function posterRow(string $type = 'shorts', bool $new = false): array
    {
        $imgs = ['poster_03', 'poster_01', 'poster_04', 'poster_05', 'poster_06', 'poster_02', 'poster_03'];

        return array_map(fn (string $img) => $this->poster('영상 타이틀', $img, $type, premium: ! $new, new: $new), $imgs);
    }

    /** 카테고리 전용 페이지 : 재사용 행의 모든 카드를 특정 type(재생 플로우)으로 강제 */
    private function typed(array $items, string $type): array
    {
        return array_map(function (array $it) use ($type) {
            $it['type'] = $type;
            $it['url'] = $this->contentUrl($type);
            return $it;
        }, $items);
    }

    /** 19+ 페이지 : 모든 카드에 age19 플래그 부여 (컴포넌트가 19 배지 렌더) */
    private function mark(array $items, bool $age19): array
    {
        if (! $age19) {
            return $items;
        }

        return array_map(function (array $it) {
            $it['age19'] = true;
            return $it;
        }, $items);
    }

    /** @return array<int, array<string, mixed>> */
    private function gnbMenus(string $active = '추천'): array
    {
        // IA 명세 ver1.1 카테고리 구성
        $menus = [
            ['label' => '추천', 'url' => route('main')],
            ['label' => '숏츠', 'url' => route('category', 'shorts')],
            ['label' => '드라마', 'url' => route('category', 'drama')],
            ['label' => '영화', 'url' => route('category', 'movie')],
            ['label' => '애니메이션', 'url' => route('category', 'animation')],
            ['label' => 'BL', 'url' => route('category', 'bl')],
            ['label' => 'AI 라이브채널', 'url' => route('live')],
            ['label' => '성인 19+', 'url' => route('category', 'adult')],
        ];

        return array_map(fn (array $m) => $m + ['active' => $m['label'] === $active], $menus);
    }

    /**
     * 세로 포스터 카드 더미 데이터.
     * type 에 따라 클릭 시 이동할 재생 페이지 URL을 결정한다.
     *
     * @return array<string, mixed>
     */
    private function poster(string $title, string $img, string $type = 'drama', bool $premium = false, bool $new = false): array
    {
        return [
            'title' => $title,
            'creator' => '크리에이터',
            'views' => '12만',
            'thumb' => 'images/main/' . $img . '.jpg',
            'is_premium' => $premium,
            'is_new' => $new,
            'type' => $type,
            'url' => $this->contentUrl($type),
        ];
    }

    /**
     * 콘텐츠 type → 재생 페이지 URL.
     *   shorts : 세로 몰입 플레이어 (쇼츠로 올린 세로 영상)
     *   movie  : 일반(가로) 재생 - 단편(영화)
     *   drama  : 일반(가로) 재생 - 회차형(드라마)
     */
    private function contentUrl(string $type): string
    {
        return match ($type) {
            'shorts' => route('player'),
            'movie' => route('watch', 'movie'),
            default => route('watch', 'drama'),
        };
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
