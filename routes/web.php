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
/* 크리에이터 스튜디오 - 채널 편집 (공개 채널 페이지 정보 수정) */
Route::get('/studio/channel/edit', [App\Http\Controllers\StudioController::class, 'edit'])->name('studio.edit');
/* 크리에이터 스튜디오 - 콘텐츠 관리 (등록 영상 목록) */
Route::get('/studio/content', [App\Http\Controllers\StudioController::class, 'content'])->name('studio.content');
/* 크리에이터 스튜디오 - 수익 관리 (적립 포인트 조회 + 제휴 스토어에서 사용) */
Route::get('/studio/revenue', [App\Http\Controllers\StudioController::class, 'revenue'])->name('studio.revenue');
/* 크리에이터 스튜디오 - 댓글 관리 (답글 / 숨김 / 신고 처리) */
Route::get('/studio/comments', [App\Http\Controllers\StudioController::class, 'comments'])->name('studio.comments');

/* 가입 직후 온보딩 - 취향(장르) 선택 */
Route::get('/onboarding/taste', [App\Http\Controllers\OnboardingController::class, 'taste'])->name('onboarding.taste');
Route::post('/onboarding/taste', [App\Http\Controllers\OnboardingController::class, 'tasteStore'])->name('onboarding.taste.store');

/* 크리에이터 신청 (일반 회원 → 크리에이터 전환) - 신청서 작성 → 접수 완료(심사중) */
Route::get('/creator/apply', [App\Http\Controllers\CreatorApplyController::class, 'show'])->name('creator.apply');
Route::post('/creator/apply', [App\Http\Controllers\CreatorApplyController::class, 'store'])->name('creator.apply.store');
Route::get('/creator/applied', [App\Http\Controllers\CreatorApplyController::class, 'applied'])->name('creator.applied');

/* 크리에이터 공개 채널 (일반 유저가 크리에이터명 클릭 시 진입, 유튜브 채널 페이지 구조) */
Route::get('/channel/{handle?}', [App\Http\Controllers\ChannelController::class, 'show'])->name('channel');

/* AI 툴 도감 (목록 / 상세) — 업로드 시 기록한 "사용한 AI"와 연결 */
Route::get('/ai-tools', [App\Http\Controllers\AiToolController::class, 'index'])->name('ai-tools');
Route::get('/ai-tools/{slug}', [App\Http\Controllers\AiToolController::class, 'show'])->name('ai-tool');

/* 마이페이지 대시보드 (프로필 메뉴·하단 독·사이드바 "마이페이지" 공통 진입) - 회원정보+허브 통합 */
Route::get('/mypage', [MypageController::class, 'show'])->name('mypage');
/* 즐겨찾기 전체보기 (대시보드 "전체보기" 진입, 스크롤 배치 로딩) */
Route::get('/mypage/favorites', [MypageController::class, 'favorites'])->name('favorites');
/* 시청 기록 전체보기 (대시보드 "전체보기" 진입, 스크롤 배치 로딩) */
Route::get('/mypage/history', [MypageController::class, 'history'])->name('history');
Route::get('/mypage/subscriptions', [MypageController::class, 'subscriptions'])->name('subscriptions');
/* 고객센터 : 자주하는 질문 / 문의하기 / 내 문의 내역 (탭 3종) */
Route::get('/mypage/faq', [MypageController::class, 'faq'])->name('faq');
Route::get('/mypage/inquiry', [MypageController::class, 'inquiry'])->name('inquiry');
Route::get('/mypage/inquiries', [MypageController::class, 'inquiryList'])->name('inquiries');
/* 공지사항 (일반 게시판) / 이벤트 (갤러리) */
Route::get('/mypage/notice', [MypageController::class, 'notice'])->name('notice');
Route::get('/mypage/notice/{id}', [MypageController::class, 'noticeShow'])->name('notice.show');
Route::get('/mypage/event', [MypageController::class, 'event'])->name('event');
Route::get('/mypage/event/{id}', [MypageController::class, 'eventShow'])->name('event.show');

/*
 * AIVEON ADMIN (관리자) — SYNERGYON_ADMIN_메뉴화면설명서_V1.0.
 * 해시 라우팅(#/섹션/화면) 데모 셸. 실서비스 연동 시 관리자 인증 미들웨어 필수.
 */
Route::get('/admin', [App\Http\Controllers\AdminController::class, 'index'])->name('admin');

/*
 * 로그인 / 회원가입 (단일 페이지 3단계 온보딩).
 * 단계 전환은 클라이언트에서 처리하고, 최종 제출만 서버에서 검증한다.
 */
Route::controller(AuthController::class)->group(function () {
    Route::get('/login', 'show')->name('login');
    Route::post('/login', 'register')->name('login.submit');
});
