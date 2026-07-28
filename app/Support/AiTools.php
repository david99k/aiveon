<?php

namespace App\Support;

/**
 * AI 영상제작 툴 목록 (AI_영상제작_툴_목록_2026).
 *
 * 업로드 폼의 "사용한 AI" 팝업과 채널 편집의 "주로 사용하는 AI 툴" 팝업이
 * 같은 선택지를 써야 하므로 한 곳에서만 정의한다.
 * 실서비스 연동 시 DB/관리자 설정 조회로 교체하세요.
 */
final class AiTools
{
    /**
     * 카테고리별 툴 그룹. icon 값은 main.js 의 AI_ICONS 키와 1:1 대응한다.
     *
     * @return array<int, array{title: string, icon: string, tools: array<int, string>}>
     */
    public static function groups(): array
    {
        return [
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
        ];
    }
}
