<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 콘텐츠 상세 페이지 (Figma "Main - 썸네일 클릭시", node 338:4681).
 *
 * 메인 히어로의 '상세보기'와 콘텐츠 카드 클릭 시 진입한다.
 * 아래 더미 데이터는 실서비스 연동 시 {slug} 파라미터 기반 DB/API 조회로 교체하세요.
 */
class DetailController
{
    public function show(): View
    {
        return view('detail.show', [
            'title' => [
                'badge' => 'OFFICIAL',
                'name' => '빛이 빛날 때',
                'tags' => ['2026', '드라마', '멜로'],
                'subscribe' => 'Premium 구독',
                'synopsis' => "<빛이 빛날 때>는 각자의 가슴속에 깊은 상처와 어둠을 품고 살아가는 인물들이 서로의 삶에 스며들어 따뜻한 위로와 희망이 되어주는 힐링 휴먼 로맨스 드라마입니다.\n\"당신의 하루에, 가장 따뜻한 빛이 되기를\"이라는 메인 카피처럼, 치열하고 삭막한 현실 속에서 길을 잃고 지친 사람들이 어떻게 서로를 구원하고 치유하는지를 섬세한 시선으로 그려냅니다. 사랑하는 사람의 품에 기대어 비로소 평안을 찾은 두 남녀 주인공을 중심으로, 저마다의 사연과 삶의 무게를 짊어진 다양한 주변 인물들의 이야기가 옴니버스처럼 따스하게 교차합니다.",
                'image' => 'images/main/hero_main.jpg',
                'play_url' => route('watch', 'drama'),
            ],
            'episodes' => [
                $this->episodes(1, 6),
                $this->episodes(7, 12),
            ],
            'related' => $this->related(),
            'recommended' => $this->recommended(),
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function episodes(int $from, int $to): array
    {
        return array_map(fn (int $n) => [
            'title' => "빛이 빛날때 {$n}화",
            'creator' => '크리에이터',
            'views' => '12만',
            'thumb' => 'images/main/hero_main.jpg',
            'is_premium' => false,
            'is_new' => false,
            'url' => route('watch', 'drama'),
        ], range($from, $to));
    }

    /** @return array<int, array<string, mixed>> */
    private function related(): array
    {
        return array_map(fn (int $i) => [
            'title' => '빛이 빛날때',
            'creator' => '크리에이터',
            'views' => '12만',
            'thumb' => 'images/main/thumb_wide_cooking.jpg',
            'is_premium' => $i === 1,
            'is_new' => false,
            'url' => route('detail'),
        ], range(1, 7));
    }

    /** 세로 포스터(추천 컨텐츠) : 클릭 시 플레이어 진입 @return array<int, array<string, mixed>> */
    private function recommended(): array
    {
        return array_map(fn (int $i) => [
            'title' => '영상 타이틀',
            'creator' => '크리에이터',
            'views' => '12만',
            'thumb' => 'images/main/poster_02.jpg',
            'is_premium' => $i >= 3,
            'is_new' => false,
            'url' => route('player'),
        ], range(1, 7));
    }
}
