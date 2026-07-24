<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 콘텐츠 업로드 (크리에이터 영상 등록).
 *
 * 플로우(단일 폼) :
 *   상단 영상 업로드 → 제목·상세설명·공개상태·섬네일·카테고리·장르·시청자층·사용한 AI
 *   → "영상 등록하기" → 주의사항 확인 모달
 *
 * 실제 파일 업로드/저장은 백엔드 연동 지점입니다.
 */
class UploadController
{
    public function show(): View
    {
        return view('upload.show', [
            'visibilities' => [
                'public' => '전체 공개',
                'unlisted' => '일부 공개(링크 공유)',
                'private' => '비공개',
            ],
            // 카테고리 : 상단 GNB 콘텐츠 유형 (추천=피드·라이브=실시간·19+=시청자층으로 처리하므로 제외)
            'categories' => [
                'shorts' => '숏츠',
                'drama' => '드라마',
                'movie' => '영화',
                'animation' => '애니메이션',
                'bl' => 'BL',
            ],
            // 장르 : IA 명세 ver1.1 의 카테고리별 하위 장르. "/" 로 묶인 항목은 개별 장르로 분리하고 중복 선택 허용.
            // (전체=집계뷰라 선택지에서 제외)
            'genres' => [
                'shorts' => ['추천', '인기'],
                'drama' => ['막장', '복수', '하이틴', '로맨스', '스릴러', '공포', '무빙툰', '노블', '완결작'],
                'movie' => ['막장', '복수', '하이틴', '로맨스', '스릴러', '공포', '무빙툰', '노블', '완결작'],
                'animation' => ['이세계', '판타지', 'SF', '메카닉', '서브컬처', '학원', '레트로', '클래식', '3D', '시네마틱', '완결작'],
                'bl' => ['실사 로맨스', '2D 아니메', '캠퍼스', '청춘', '오피스', '할리킹', '판타지', '특수 세계관', '관계성(혐관/집착)', '완결작'],
            ],
            'audiences' => [
                'all' => '전체 이용가',
                '12' => '12세 이상',
                '15' => '15세 이상',
                '19' => '19세 이상',
            ],
            // 사용한 AI : 카테고리별 툴 (AI_영상제작_툴_목록_2026.docx). 팝업에서 복수 선택, 처음엔 미선택.
            'aiToolGroups' => [
                ['title' => '기획', 'icon' => 'plan', 'tools' => ['ChatGPT Plus/Pro', 'Claude Pro', 'Gemini Advanced', 'Sudowrite', 'NovelCrafter', 'Notion AI']],
                ['title' => '이미지 생성', 'icon' => 'image', 'tools' => ['Midjourney', 'Flux API', 'Ideogram Pro', 'DALL·E', 'Adobe Firefly', 'Leonardo AI', 'Recraft Pro']],
                ['title' => '이미지 편집', 'icon' => 'image-edit', 'tools' => ['Photoshop', 'Magnific AI', 'Krea AI', 'ClipDrop Pro', 'Topaz Photo AI']],
                ['title' => '영상 생성', 'icon' => 'video', 'tools' => ['Veo', 'Kling', 'Runway', 'Hailuo', 'Luma Dream Machine', 'Pika', 'PixVerse', 'Genmo', 'Haiper']],
                ['title' => 'AI 아바타', 'icon' => 'avatar', 'tools' => ['HeyGen', 'Synthesia', 'Tavus', 'D-ID', 'Captions AI']],
                ['title' => '립싱크', 'icon' => 'lipsync', 'tools' => ['HeyGen', 'SyncLabs']],
                ['title' => '모션캡처', 'icon' => 'motion', 'tools' => ['Move AI', 'Rokoko Vision', 'Wonder Studio', 'RADiCAL', 'Plask']],
                ['title' => '음성 생성', 'icon' => 'voice', 'tools' => ['ElevenLabs', 'Cartesia', 'PlayHT', 'Resemble AI', 'Azure TTS', 'Google TTS']],
                ['title' => '음악 생성', 'icon' => 'music', 'tools' => ['Suno', 'Udio', 'Stable Audio', 'Loudly', 'AIVA', 'Soundraw']],
                ['title' => '효과음', 'icon' => 'sfx', 'tools' => ['ElevenLabs SFX', 'Stable Audio']],
                ['title' => '영상 편집', 'icon' => 'edit', 'tools' => ['Premiere Pro', 'DaVinci Resolve Studio', 'Filmora', 'Descript', 'CapCut Pro']],
                ['title' => '색보정', 'icon' => 'color', 'tools' => ['Colourlab AI', 'DaVinci Studio', 'Premiere AI']],
                ['title' => '업스케일링', 'icon' => 'upscale', 'tools' => ['Topaz Video AI']],
                ['title' => '노이즈 제거', 'icon' => 'denoise', 'tools' => ['Adobe Enhance Premium', 'Topaz Audio', 'Krisp', 'Auphonic']],
                ['title' => '배경 제거', 'icon' => 'bg-remove', 'tools' => ['Remove.bg', 'ClipDrop', 'Firefly']],
                ['title' => '3D 생성', 'icon' => '3d', 'tools' => ['Tripo AI', 'Meshy', 'Rodin', 'Luma Genie']],
                ['title' => 'AI VFX', 'icon' => 'vfx', 'tools' => ['Wonder Studio', 'Runway', 'Adobe Firefly', 'Cascadeur Pro']],
            ],
        ]);
    }
}
