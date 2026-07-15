# AIVEON 메인 페이지 (라라벨 블레이드 퍼블리싱)

Figma 시안 [Synergy-on_aiveon / Main - 로그인 전](https://www.figma.com/design/8NTaMQ9Pizo0dGA6tCFrNM/Synergy-on_aiveon?node-id=160-3061)을
라라벨 블레이드 템플릿으로 구현한 퍼블리싱 딜리버러블입니다. (데스크톱 1920 기준)

## 폴더 구조

```
├─ app/Http/Controllers/
│   └─ MainController.php          # 메인 페이지 + 시안 더미 데이터 (실서비스에서 DB/API로 교체)
├─ routes/
│   └─ web.php                     # GET / → MainController@index
├─ resources/views/
│   ├─ layouts/app.blade.php       # 공통 레이아웃 (폰트 CDN, css/js 로드)
│   ├─ partials/
│   │   ├─ gnb.blade.php           # GNB (로고/메뉴/언어/검색/구독/프로필)
│   │   └─ hero.blade.php          # 히어로 배너
│   ├─ components/                 # 익명 블레이드 컴포넌트
│   │   ├─ video-row.blade.php     # 가로형 리스트 섹션 (타이틀 + 스크롤 리스트)
│   │   ├─ video-card.blade.php    # 가로형 카드 (285×181)
│   │   ├─ poster-card.blade.php   # 세로형 카드 (253×337)
│   │   ├─ rank-card.blade.php     # TOP6 랭킹 카드 (외곽선 숫자 + 세로형 카드)
│   │   └─ creator-item.blade.php  # 크리에이터 (100px 원형 아바타)
│   └─ main/index.blade.php        # 메인 페이지
└─ public/
    ├─ css/main.css                # 디자인 토큰(CSS 변수) + 전체 스타일
    ├─ js/main.js                  # 가로 리스트 마우스 드래그 스크롤
    ├─ images/main/, images/common/
    └─ preview.html                # [QA 전용] 블레이드 출력 재현 정적 프리뷰
```

## 기존 라라벨 프로젝트에 적용

1. `resources/views/` 내용을 프로젝트의 `resources/views/`로 복사
2. `public/css`, `public/js`, `public/images`를 프로젝트의 `public/`으로 복사
3. `app/Http/Controllers/MainController.php` 복사 후 `routes/web.php`에 라우트 등록
4. `MainController`의 더미 데이터 메서드들을 실제 데이터 조회로 교체

컴포넌트 데이터 계약:

```php
// 영상 카드 (video-card / poster-card / rank-card 공용)
['title' => string, 'creator' => string, 'views' => string,
 'thumb' => ?string, 'is_premium' => bool, 'is_new' => bool, 'url' => string]

// 크리에이터 (creator-item)
['name' => string, 'subscribers' => string, 'avatar' => string, 'url' => string]
```

`thumb`이 `null`이면 시안과 동일하게 `--bg-surface` 색 placeholder로 표시됩니다.

## 로컬 미리보기 (라라벨 없이)

```bash
cd public
php -S localhost:8123 router.php
# → http://localhost:8123/preview.html
```

`router.php`는 동영상 HTTP Range 요청을 처리하기 위한 QA 전용 라우터입니다.
PHP 내장 서버는 Range를 지원하지 않아 이 라우터 없이는 `<video>` 구간 이동(시킹)이
동작하지 않습니다. 실서버(Apache/nginx)는 Range를 기본 지원하므로 필요 없습니다.

### 주요 프리뷰 페이지
- `preview.html` — 메인
- `preview-detail.html` — 콘텐츠 상세
- `preview-watch-drama.html` / `preview-watch-movie.html` — 드라마/영화 재생
- `preview-player.html` — 쇼츠(세로) 재생 · 위로 드래그(스와이프/휠)하면 다음 쇼츠가 아래에서 올라오는 세로 피드
- `preview-login.html` — 로그인/회원가입(단일 페이지 3단계)

`preview*.html`은 QA 확인용으로 블레이드 출력을 정적으로 재현한 파일입니다.
마크업 수정은 반드시 블레이드 템플릿(`resources/views/`)에서 하세요.

### 테스트 영상
`public/videos/`의 `drama01.mp4`·`cow_story.mp4`·`shot01.mp4`는 데모용 더미 영상입니다.
(`cow_story`·`shot01` = 쇼츠 세로 피드 1·2번째, `drama01` = 드라마/영화 재생)
실서비스 연동 시 스트리밍 URL로 교체하세요.

## 사용 폰트 (CDN)

- [Pretendard](https://github.com/orioncactus/pretendard) — 카드/GNB 로고/배지
- [Gothic A1](https://fonts.google.com/specimen/Gothic+A1) — 히어로 타이틀/버튼/GNB 메뉴/랭킹 숫자

## 참고 사항

- **크리에이터 섹션 타이틀**: 시안 원본에 "AIVEON TOP6"로 표기되어 있어 그대로 반영했습니다
  (랭킹 섹션과 중복 — 기획/디자인 확인 필요). 수정은 `MainController`의 `creatorSectionTitle` 값만 바꾸면 됩니다.
- **TOP6 랭킹 숫자**: 투명 채움 + 브랜드 컬러(#a78bfa) 4px 외곽선(`-webkit-text-stroke`).
  placeholder 카드 위로는 보이고 포스터 이미지 뒤로는 가려지는 시안 구조를 z-index로 재현했습니다.
- **배지 위치 규칙**: PREMIUM = 썸네일 우상단(10px 오프셋), NEW = 썸네일 좌하단(모서리 밀착).
- **가로 리스트 풀블리드**: 시안처럼 넘치는 카드가 화면 오른쪽 끝에 걸쳐 보이도록
  `.scroll-x`에 음수 마진 + 내부 패딩(40px) 패턴을 적용했습니다. 마우스 드래그/휠/키보드(포커스 후 방향키)로 스크롤됩니다.
- **NEW 배지 색상**: 시안 원본은 `#ff0000`이지만 흰색 12px 텍스트의 명도대비 AA(4.5:1) 충족을 위해
  `--badge-new: #e60000`(4.81:1)으로 미세 조정했습니다. 원본 유지가 필요하면 토큰 값만 되돌리면 됩니다.
- **접근성 반영**: 본문 바로가기(skip link), 가로 스크롤 영역 `role="region"` + `tabindex="0"` + aria-label,
  랭킹 숫자 스크린리더 대체 텍스트("N위"), 배지 `<span>` 시맨틱.
- **GNB 명도대비**: GNB 배경이 시안대로 반투명(rgba(24,24,31,0.1))이라 비활성 메뉴(65% 흰색)의 대비가
  히어로 이미지에 따라 달라질 수 있습니다. 필요 시 스크롤 시 배경 강화 등 보완을 검토하세요.
- **반응형**: 시안이 데스크톱 1920 단일 기준이라 `body { min-width: 1280px }`로 고정형입니다.
  모바일 시안이 나오면 브레이크포인트 추가가 필요합니다.
- **이미지**: Figma 원본 에셋을 표시 크기 2배(레티나)로 최적화(총 86MB → 약 1.2MB).
  가로 카드가 시안에서 살짝 다른 비율의 원본을 쓰는 경우 `object-fit: cover`로 크롭됩니다.
- **긴 타이틀**: 시안은 카드 폭을 넘겨도 그대로 노출되지만, 구현은 한 줄 말줄임(ellipsis) 처리했습니다.
