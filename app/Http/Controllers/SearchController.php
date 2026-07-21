<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 검색 (GNB 검색 아이콘 클릭 진입).
 *
 * Figma: 498:2967(검색) / 643:4897(검색결과) / 649:6726(검색결과 없음).
 * 정적 프로토타입 — 실서비스 연동 시 실제 검색 API 결과로 교체하세요.
 * 데모: 알려진 검색어는 결과, 그 외는 "결과 없음"을 보여준다.
 */
class SearchController
{
    /** 검색 페이지 (최근/인기 검색어) */
    public function index(): View
    {
        return view('search.index', [
            'recent' => ['쉬는 시간', 'snow', '너의 AI로부터', '너의 AI로부터', '너의 AI로부터'],
            'popular' => [
                '쉬는 시간',
                '내 달콤한 약혼녀는 암살자다',
                '마미적반공 : 엄마의 반격',
                '도도와 두두의 달빛도토리섬 대모험',
                '단편 달에 뜨는 시간',
                '내 달콤한 약혼녀는 암살자다',
                '마미적반공 : 엄마의 반격',
                '도도와 두두의 달빛도토리섬 대모험',
            ],
        ]);
    }

    /** 검색 결과 / 결과 없음 (?q=) */
    public function results(): View
    {
        $q = trim((string) request('q', '쉬는 시간'));
        $known = [
            '쉬는 시간', 'snow', '너의 AI로부터', '내 달콤한 약혼녀는 암살자다',
            '마미적반공 : 엄마의 반격', '도도와 두두의 달빛도토리섬 대모험', '단편 달에 뜨는 시간',
        ];

        if ($q !== '' && in_array($q, $known, true)) {
            return view('search.results', [
                'q' => $q,
                'noResults' => false,
                'sections' => [
                    ['title' => $q . ' 검색결과', 'count' => 12, 'type' => 'video', 'items' => $this->videos()],
                    ['title' => $q . ' 크리에이터 검색결과', 'count' => 7, 'type' => 'creator', 'items' => $this->creators()],
                    ['title' => $q . ' AI 쇼츠 검색결과', 'count' => 24, 'type' => 'poster', 'items' => $this->posters()],
                    ['title' => $q . ' AI 애니메이션 검색결과', 'count' => 12, 'type' => 'video', 'items' => $this->videos()],
                    ['title' => $q . ' AI 숏폼 드라마 검색결과', 'count' => 24, 'type' => 'poster', 'items' => $this->posters()],
                ],
            ]);
        }

        return view('search.results', [
            'q' => $q === '' ? '검색어' : $q,
            'noResults' => true,
            'sections' => [
                ['title' => 'AI 쇼츠 추천영상', 'count' => null, 'type' => 'poster', 'items' => $this->posters()],
                ['title' => 'AI 애니메이션 추천영상', 'count' => null, 'type' => 'video', 'items' => $this->videos()],
                ['title' => 'AI 숏폼 드라마 추천영상', 'count' => null, 'type' => 'poster', 'items' => $this->posters()],
            ],
        ]);
    }

    /** 가로형 영상 카드 @return array<int, array<string, mixed>> */
    private function videos(): array
    {
        $data = [
            ['빛이 빛날때', 'thumb_wide_algorithm'],
            ['AI 코드 : 인간의 경계', 'thumb_wide_aicode'],
            ['THE BETA', 'thumb_wide_beta'],
            ['어둠 너무 빛이 빛날 때', 'thumb_wide_dark'],
            ['궁의 어둠, 달의 노래', 'thumb_wide_palace'],
            ['마법같은 우리의 모험', 'thumb_wide_adventure'],
            ['네모의 꿈', 'thumb_wide_nemo'],
        ];

        return array_map(fn ($v) => [
            'title' => $v[0],
            'creator' => '크리에이터',
            'views' => '12만',
            'thumb' => 'images/main/' . $v[1] . '.jpg',
            'url' => route('detail'),
        ], $data);
    }

    /** 세로 포스터 카드 @return array<int, array<string, mixed>> */
    private function posters(): array
    {
        $imgs = ['poster_01', 'poster_02', 'poster_03', 'poster_04', 'poster_05', 'poster_06', 'poster_01'];

        return array_map(fn ($img) => [
            'title' => '영상 타이틀',
            'creator' => '크리에이터',
            'views' => '12만',
            'thumb' => 'images/main/' . $img . '.jpg',
            'is_premium' => true,
            'url' => route('player'),
        ], $imgs);
    }

    /** 크리에이터 카드 @return array<int, array<string, mixed>> */
    private function creators(): array
    {
        $data = [
            ['쉬는 시간01', 'creator_profile_01'],
            ['쉬는 시간이야', 'creator_profile_02'],
            ['쉬는 시간일까?', 'creator_profile_03'],
            ['쉬는 요일', 'creator_profile_04'],
            ['쉬는 필요일', 'creator_profile_05'],
            ['쉬는 토요일', 'creator_profile_06'],
            ['점심 시간', 'creator_profile_07'],
        ];

        return array_map(fn ($c) => [
            'name' => $c[0],
            'subscribers' => '99.2만',
            'avatar' => 'images/main/' . $c[1] . '.jpg',
            'url' => '#',
        ], $data);
    }
}
