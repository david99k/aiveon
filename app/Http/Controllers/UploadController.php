<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * 콘텐츠 업로드 (크리에이터 영상 등록).
 *
 * 플로우(클라이언트 모달 + 폼) :
 *   1) 동영상 종류 선택 (쇼츠 / 드라마·영화)
 *   2) 파일 업로드 (드래그&드롭)
 *   3) 상세 입력 (제목·상세설명·공개상태·섬네일·시청자층·사용한 AI)
 *   4) "영상 등록하기" → 주의사항 확인 모달
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
            'audiences' => [
                'all' => '전체 이용가',
                '12' => '12세 이상',
                '15' => '15세 이상',
                '19' => '19세 이상',
            ],
            'aiTools' => ['NANO BANANA2', 'SEE DANCE'],
        ]);
    }
}
