<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DetailController;
use App\Http\Controllers\MainController;
use App\Http\Controllers\PlayerController;
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

/*
 * 로그인 / 회원가입 (단일 페이지 3단계 온보딩).
 * 단계 전환은 클라이언트에서 처리하고, 최종 제출만 서버에서 검증한다.
 */
Route::controller(AuthController::class)->group(function () {
    Route::get('/login', 'show')->name('login');
    Route::post('/login', 'register')->name('login.submit');
});
