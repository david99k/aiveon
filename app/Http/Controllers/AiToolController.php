<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * AI 툴 도감 (AI Tools).
 *
 * AIVEON 고유 포인트 : 업로드 시 기록한 "사용한 AI"와 연결되어,
 * 각 툴 페이지에서 "이 툴로 만든 AIVEON 영상"을 바로 볼 수 있다.
 *
 * 카테고리 체계는 업로드 폼(UploadController::aiToolGroups)과 동일하게 유지한다.
 * 아래 값은 시안용 더미 — 실서비스 연동 시 DB/API 조회로 교체하세요.
 */
class AiToolController
{
    /** AI 툴 목록 (카테고리 필터 + 카드 그리드) */
    public function index(): View
    {
        return view('ai-tools.index', [
            'categories' => $this->categories(),
            'tools' => $this->tools(),
        ]);
    }

    /** AI 툴 상세 */
    public function show(string $slug): View
    {
        $tools = $this->tools();
        $tool = collect($tools)->firstWhere('slug', $slug) ?? $tools[0];

        return view('ai-tools.show', [
            'tool' => array_merge($tool, $this->detail($tool)),
            // 이 툴을 사용해 만든 AIVEON 영상 (업로드 시 기록된 "사용한 AI" 기준)
            'videos' => $this->videos(),
            'related' => collect($tools)
                ->where('category', $tool['category'])
                ->where('slug', '!=', $tool['slug'])
                ->take(4)
                ->values()
                ->all(),
        ]);
    }

    /** 업로드 폼과 동일한 카테고리 체계 @return array<int, string> */
    private function categories(): array
    {
        return ['전체', '기획', '이미지 생성', '이미지 편집', '영상 생성', 'AI 아바타', '립싱크', '모션캡처',
            '음성 생성', '음악 생성', '효과음', '영상 편집', '색보정', '업스케일링', '노이즈 제거', '배경 제거', '3D 생성', 'AI VFX'];
    }

    /**
     * 툴 목록. name 은 업로드 폼의 툴명과 일치시켜 "사용한 AI" 집계와 연결한다.
     *
     * @return array<int, array<string, mixed>>
     */
    private function tools(): array
    {
        $t = [
            ['Runway', '런웨이', '영상 생성', '텍스트·이미지로 영상을 만드는 대표 생성 툴', 4.6, '1,284', true],
            ['Midjourney', '미드저니', '이미지 생성', '분위기 있는 키비주얼·콘셉트 아트에 강한 이미지 생성', 4.7, '2,140', true],
            ['ChatGPT Plus/Pro', '챗지피티', '기획', '시놉시스·대본·기획안을 빠르게 잡아주는 대화형 AI', 4.5, '3,020', true],
            ['Claude Pro', '클로드', '기획', '긴 대본·설정 정리에 강한 대화형 AI', 4.5, '1,760', false],
            ['Kling', '클링', '영상 생성', '인물 동작이 자연스러운 영상 생성 모델', 4.3, '842', false],
            ['Veo', '비오', '영상 생성', '구글의 고화질 영상 생성 모델', 4.4, '735', true],
            ['ElevenLabs', '일레븐랩스', '음성 생성', '자연스러운 한국어 내레이션·더빙 음성 생성', 4.8, '1,510', true],
            ['Suno', '수노', '음악 생성', '가사·장르만으로 완성곡을 만드는 음악 생성', 4.6, '980', true],
            ['Photoshop', '포토샵', '이미지 편집', '생성형 채우기로 후보정까지 처리하는 표준 편집 툴', 4.4, '1,190', false],
            ['Premiere Pro', '프리미어 프로', '영상 편집', '자동 자막·리프레임을 갖춘 표준 편집 툴', 4.3, '1,320', false],
            ['HeyGen', '헤이젠', 'AI 아바타', '실사형 AI 아바타로 진행자 영상을 만드는 툴', 4.2, '610', false],
            ['Topaz Video AI', '토파즈 비디오', '업스케일링', '저해상도 영상을 4K로 올려주는 업스케일러', 4.5, '430', false],
            ['Flux API', '플럭스', '이미지 생성', '고품질·고속 이미지 생성 API', 4.4, '520', false],
            ['Luma Dream Machine', '루마 드림머신', '영상 생성', '부드러운 카메라 무빙이 강점인 영상 생성', 4.1, '380', false],
            ['Krea AI', '크레아', '이미지 편집', '실시간 리터칭·업스케일에 특화', 4.2, '295', false],
            ['Move AI', '무브 AI', '모션캡처', '영상만으로 3D 모션을 추출하는 마커리스 캡처', 4.0, '150', false],
        ];

        return array_map(fn (array $r) => [
            'slug' => $this->slug($r[0]),
            'name' => $r[0],
            'korName' => $r[1],
            'category' => $r[2],
            'tagline' => $r[3],
            'rating' => $r[4],
            'videoCount' => $r[5],
            'official' => $r[6],
        ], $t);
    }

    /** 툴명 → URL 슬러그 */
    private function slug(string $name): string
    {
        $s = strtolower($name);
        $s = str_replace(['·', '/', ' ', '.'], '-', $s);

        return trim(preg_replace('/-+/', '-', $s), '-');
    }

    /**
     * 상세 본문 (소개 / 핵심 기능 / 장단점 / 요금제).
     * 시안에서는 대표 툴 기준 텍스트를 공통 사용하고, 툴명만 치환한다.
     *
     * @param  array<string, mixed>  $tool
     * @return array<string, mixed>
     */
    private function detail(array $tool): array
    {
        return [
            'summary' => "{$tool['name']}({$tool['korName']})은(는) {$tool['category']} 분야에서 가장 널리 쓰이는 AI 툴 중 하나입니다. "
                . 'AIVEON 크리에이터들이 실제 작업에 사용하고 있으며, 아래에서 이 툴로 만든 영상을 확인할 수 있습니다.',
            'meta' => [
                ['label' => '카테고리', 'value' => $tool['category']],
                ['label' => '요금', 'value' => '무료 체험 + 유료 플랜'],
                ['label' => '난이도', 'value' => '입문 ~ 중급'],
                ['label' => '한국어 지원', 'value' => '지원'],
            ],
            'features' => [
                ['title' => '빠른 시안 제작', 'desc' => '아이디어를 몇 분 만에 결과물로 확인할 수 있어 기획 단계에서 시간을 크게 줄여줍니다.'],
                ['title' => '스타일 일관성', 'desc' => '레퍼런스를 지정해 여러 컷을 같은 톤으로 유지할 수 있습니다.'],
                ['title' => '상업적 이용', 'desc' => '유료 플랜에서 상업적 이용이 허용됩니다. 세부 조건은 공식 약관을 확인하세요.'],
            ],
            'pros' => ['한국어 프롬프트도 잘 알아듣는 편', '결과물 퀄리티가 안정적', '레퍼런스를 활용한 스타일 고정이 쉬움'],
            'cons' => ['무료 플랜은 생성 횟수 제한이 있음', '세밀한 디테일은 후보정이 필요할 수 있음'],
            'plans' => [
                ['name' => 'Free', 'price' => '무료', 'desc' => '체험용 크레딧 제공 · 워터마크 있음'],
                ['name' => 'Standard', 'price' => '월 $12~', 'desc' => '상업적 이용 가능 · 워터마크 없음'],
                ['name' => 'Pro', 'price' => '월 $30~', 'desc' => '고해상도 · 우선 처리 · 팀 협업'],
            ],
            'tips' => 'AIVEON에 업로드할 때 "사용한 AI"에 이 툴을 선택하면, 이 페이지의 "이 툴로 만든 영상"에 자동으로 노출됩니다.',
        ];
    }

    /** 이 툴로 만든 AIVEON 영상 (세로 포스터) @return array<int, array<string, mixed>> */
    private function videos(): array
    {
        $items = [
            [1, '그 계절, 우리가 사랑한 시간', '거스구스'],
            [3, '밤이 우리를 부를 때', '몽글스튜디오'],
            [2, '나의 알고리즘', '거스구스'],
            [5, '아기 고양이의 모험', '몽글스튜디오'],
            [6, '한 소녀의 피클볼 도전기', '거스구스'],
            [4, '마법 같은 우리의 모험', '몽글스튜디오'],
        ];

        return array_map(fn (array $r) => [
            'title' => $r[1],
            'creator' => $r[2],
            'views' => '12만',
            'thumb' => 'images/main/poster_0' . $r[0] . '.jpg',
            'is_premium' => $r[0] % 2 === 1,
            'url' => route('detail'),
        ], $items);
    }
}
