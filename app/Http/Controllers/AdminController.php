<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

/**
 * VIBUZZ ADMIN (시너지온 관리자).
 *
 * 메뉴·화면 구조 : SYNERGYON_ADMIN_메뉴화면설명서_V1.0
 *   대시보드 + 11개 1단계 메뉴, 2단계 98개 화면(콘텐츠 관리 하위 3단계 12개 포함).
 *
 * 시안 단계에서는 화면 데이터(public/js/admin-data.js)와 렌더러(public/js/admin.js)가
 * 해시 라우팅(#/섹션/화면)으로 전 화면을 구성한다.
 * 실서비스 연동 지점 :
 *   - 관리자 인증(로그인/세션) 미들웨어
 *   - 메뉴 권한 관리(시스템 관리) 기준의 메뉴 노출·기능 권한 필터
 *   - 각 화면의 조회 API (admin-data.js 의 섹션별 데이터 구조가 응답 명세 초안)
 */
class AdminController
{
    public function index(): View
    {
        return view('admin.index');
    }
}
