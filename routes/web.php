<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DetailController;
use App\Http\Controllers\LiveController;
use App\Http\Controllers\MainController;
use App\Http\Controllers\MypageController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MainController::class, 'index'])->name('main');

/* 콘텐츠 상세 (히어로 상세보기 / 가로형 썸네일 클릭 진입) */
Route::get('/detail/{slug?}', [DetailController::class, 'show'])->name('detail');

/* 쇼츠·일반 콘텐츠 플레이어 (세로 포스터 썸네일 클릭 진입) */
Route::get('/player/{slug?}', [PlayerController::class, 'show'])->name('player');

/* 드라마/영화 재생 (재생버튼 클릭 진입) - drama: 회차형, movie: 1편짜리 */
Route::get('/watch/{type?}', [App\Http\Controllers\WatchController::class, 'show'])
    ->whereIn('type', ['drama', 'movie'])
    ->name('watch');

/* AI 라이브채널 (GNB "AI 라이브채널" 클릭 진입) - 실시간 방송 시청 */
Route::get('/live', [LiveController::class, 'show'])->name('live');

/* 검색 (GNB 검색 아이콘 클릭 진입) - 검색 페이지 + 결과/결과없음 */
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/search/results', [SearchController::class, 'results'])->name('search.results');

/* 카테고리 (GNB 메뉴 클릭 진입) - 메인 레이아웃 재사용. IA ver1.1: 숏츠/드라마/영화/애니메이션/BL/성인19+ (shortform 은 레거시) */
Route::get('/category/{slug}', [MainController::class, 'category'])
    ->whereIn('slug', ['shorts', 'drama', 'movie', 'animation', 'bl', 'shortform', 'adult'])
    ->name('category');

/* 콘텐츠 업로드 (GNB "업로드 +" 클릭 진입) - 종류 선택 → 파일 업로드 → 상세 입력 → 주의사항 확인 */
Route::get('/upload', [App\Http\Controllers\UploadController::class, 'show'])->name('upload');

/* 크리에이터 스튜디오 - 내 채널관리 (유저 메뉴 "크리에이터 전환" / 마이페이지 "크리에이터" 진입) */
Route::get('/studio', [App\Http\Controllers\StudioController::class, 'show'])->name('studio');

/* 마이페이지 (로그인 후 프로필 메뉴 "마이페이지" 클릭 진입) - 회원정보 */
Route::get('/mypage', [MypageController::class, 'show'])->name('mypage');
/* 마이페이지 사이드바 진입 - 즐겨찾기 / 자주하는 질문 */
Route::get('/mypage/favorites', [MypageController::class, 'favorites'])->name('favorites');
Route::get('/mypage/faq', [MypageController::class, 'faq'])->name('faq');

/*
 * 로그인 / 회원가입 (단일 페이지 3단계 온보딩).
 * 단계 전환은 클라이언트에서 처리하고, 최종 제출만 서버에서 검증한다.
 */
Route::controller(AuthController::class)->group(function () {
    Route::get('/login', 'show')->name('login');
    Route::post('/login', 'register')->name('login.submit');
});
