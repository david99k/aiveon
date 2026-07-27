<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * 가입 직후 온보딩 - 취향(장르) 선택.
 *
 * 회원가입 완료 → 이 화면에서 관심 장르를 3개 이상 고르면
 * 홈 추천 피드가 해당 취향 기준으로 구성된다(추천 로직은 백엔드 연동 지점).
 * "나중에 하기"로 건너뛸 수 있으며, 마이페이지에서 다시 설정할 수 있다.
 */
class OnboardingController
{
    /** 최소 선택 개수 */
    private const MIN_PICK = 3;

    public function taste(): View
    {
        return view('onboarding.taste', [
            'minPick' => self::MIN_PICK,
            'groups' => $this->groups(),
        ]);
    }

    /** 선택 저장 (실서비스 : 사용자 취향 테이블에 저장 후 추천 피드 반영) */
    public function tasteStore(Request $request): RedirectResponse
    {
        $picked = $request->input('genres', []);

        if (count($picked) < self::MIN_PICK) {
            return back()->withErrors(['genres' => '관심 장르를 ' . self::MIN_PICK . '개 이상 선택해주세요.']);
        }

        // TODO: auth()->user()->preferences()->sync($picked);

        return redirect()->route('main')->with('status', '취향이 저장되었습니다. 맞춤 추천을 확인해보세요!');
    }

    /**
     * 취향 선택지. 콘텐츠 유형(카테고리)별로 묶어 한눈에 고르게 한다.
     * 값은 업로드 폼의 장르 체계(IA 명세 ver1.1)와 동일하게 유지한다.
     *
     * @return array<int, array<string, mixed>>
     */
    private function groups(): array
    {
        return [
            [
                'title' => '드라마 · 영화',
                'items' => [
                    ['name' => '로맨스', 'thumb' => 'images/taste/romance.svg'],
                    ['name' => '스릴러', 'thumb' => 'images/taste/thriller.svg'],
                    ['name' => '복수', 'thumb' => 'images/taste/revenge.svg'],
                    ['name' => '막장', 'thumb' => 'images/taste/makjang.svg'],
                    ['name' => '하이틴', 'thumb' => 'images/taste/highteen.svg'],
                    ['name' => '공포', 'thumb' => 'images/taste/horror.svg'],
                    ['name' => '무빙툰', 'thumb' => 'images/taste/movingtoon.svg'],
                    ['name' => '노블', 'thumb' => 'images/taste/novel.svg'],
                ],
            ],
            [
                'title' => '애니메이션',
                'items' => [
                    ['name' => '이세계', 'thumb' => 'images/taste/isekai.svg'],
                    ['name' => '판타지', 'thumb' => 'images/taste/fantasy.svg'],
                    ['name' => 'SF', 'thumb' => 'images/taste/scifi.svg'],
                    ['name' => '메카닉', 'thumb' => 'images/taste/mecha.svg'],
                    ['name' => '학원', 'thumb' => 'images/taste/school.svg'],
                    ['name' => '서브컬처', 'thumb' => 'images/taste/subculture.svg'],
                    ['name' => '3D · 시네마틱', 'thumb' => 'images/taste/cinematic3d.svg'],
                ],
            ],
            [
                'title' => 'BL',
                'items' => [
                    ['name' => '실사 로맨스', 'thumb' => 'images/taste/blromance.svg'],
                    ['name' => '2D 아니메', 'thumb' => 'images/taste/anime2d.svg'],
                    ['name' => '캠퍼스 · 청춘', 'thumb' => 'images/taste/campus.svg'],
                    ['name' => '오피스', 'thumb' => 'images/taste/office.svg'],
                    ['name' => '특수 세계관', 'thumb' => 'images/taste/worldview.svg'],
                ],
            ],
            [
                'title' => '숏폼 · 기타',
                'items' => [
                    ['name' => '숏츠', 'thumb' => 'images/taste/shorts.svg'],
                    ['name' => 'AI 라이브', 'thumb' => 'images/taste/ailive.svg'],
                    ['name' => '완결작', 'thumb' => 'images/taste/complete.svg'],
                ],
            ],
        ];
    }
}
