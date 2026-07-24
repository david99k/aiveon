@extends('layouts.app')

@section('title', '콘텐츠 업로드 · AIVEON')

@section('content')
    <section class="upload">
        <h1 class="upload__title">콘텐츠 업로드</h1>

        <form class="upload-form js-upload-form" action="{{ route('upload') }}" method="post" novalidate>
            {{-- 영상 업로드 (상단) : 드롭존 → 선택 시 미리보기로 전환 --}}
            <div class="upload-row">
                <span class="upload-row__label">영상 업로드<span class="req">*</span></span>
                <div class="upload-video">
                    <div class="upload-dropzone upload-dropzone--inline js-video-dropzone">
                        <svg class="upload-dropzone__icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                            <path d="M20 44a12 12 0 0 1-1.5-23.9A16 16 0 0 1 49 24a10 10 0 0 1-.5 20H40" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M32 30v18m0-18-6 6m6-6 6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <p class="upload-dropzone__text">동영상 파일을 여기에 올려주세요.</p>
                        <button type="button" class="btn btn--primary js-video-select">파일 선택하기</button>
                    </div>
                    <div class="upload-preview js-video-preview" hidden>
                        <figure class="upload-preview__thumb"><img src="{{ asset('images/main/thumb_wide_adventure.jpg') }}" alt=""></figure>
                        <div class="upload-preview__meta">
                            <div class="upload-preview__badges">
                                <span class="upload-preview__badge">FHD</span>
                                <span class="upload-preview__badge">2K</span>
                                <span class="upload-preview__badge">4K</span>
                            </div>
                            <span class="upload-preview__name">파일명 : 마법 같은 우리의 모험 원본.mp4</span>
                            <button type="button" class="upload-preview__change js-video-change">다른 영상 선택</button>
                        </div>
                    </div>
                </div>
            </div>

            {{-- 제목 --}}
            <div class="upload-row">
                <label class="upload-row__label" for="up-title">제목<span class="req">*</span></label>
                <input type="text" id="up-title" name="title" class="upload-input" value="마법 같은 우리의 모험" placeholder="제목을 입력해주세요">
            </div>

            {{-- 상세설명 --}}
            <div class="upload-row">
                <label class="upload-row__label" for="up-desc">상세설명<span class="req">*</span></label>
                <textarea id="up-desc" name="description" class="upload-textarea" placeholder="동영상에 대해서 설명해주세요."></textarea>
            </div>

            {{-- 공개 상태 --}}
            <div class="upload-row">
                <label class="upload-row__label" for="up-visibility">공개 상태<span class="req">*</span></label>
                <select id="up-visibility" name="visibility" class="upload-select is-placeholder">
                    <option value="" disabled selected>선택해 주세요</option>
                    @foreach ($visibilities as $value => $label)
                        <option value="{{ $value }}">{{ $label }}</option>
                    @endforeach
                </select>
            </div>

            {{-- 섬네일 --}}
            <div class="upload-row">
                <span class="upload-row__label">섬네일<span class="req">*</span></span>
                <div>
                    <div class="upload-thumb-row">
                        <figure class="upload-thumb"><img src="{{ asset('images/main/poster_04.jpg') }}" alt=""></figure>
                        <button type="button" class="upload-thumb-btn">
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V4m0 0L8 8m4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                            파일 업로드
                        </button>
                    </div>
                    <p class="upload-hint">* 썸네일로 사용하고자 하는 이미지를 선택해주세요.</p>
                </div>
            </div>

            {{-- 카테고리 (상단 GNB 콘텐츠 유형 기준) --}}
            <div class="upload-row">
                <label class="upload-row__label" for="up-category">카테고리<span class="req">*</span></label>
                <select id="up-category" name="category" class="upload-select is-placeholder js-upload-category" data-genres='@json($genres)'>
                    <option value="" disabled selected>카테고리를 선택해주세요</option>
                    @foreach ($categories as $value => $label)
                        <option value="{{ $value }}">{{ $label }}</option>
                    @endforeach
                </select>
            </div>

            {{-- 장르 (IA 명세 : 카테고리별 하위 장르, 팝업에서 복수 선택 → 선택 결과는 하단 칩으로) --}}
            <div class="upload-row">
                <span class="upload-row__label">장르<span class="req">*</span></span>
                <div class="upload-genre js-upload-genre">
                    <button type="button" class="upload-ai-btn upload-genre-btn js-genre-btn" disabled aria-haspopup="dialog">
                        <span class="js-genre-btn-text">카테고리를 먼저 선택해주세요</span>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="upload-chips js-genre-chips"></div>
                </div>
            </div>

            {{-- 시청자층 --}}
            <div class="upload-row">
                <label class="upload-row__label" for="up-audience">시청자층<span class="req">*</span></label>
                <select id="up-audience" name="audience" class="upload-select is-placeholder">
                    <option value="" disabled selected>시청자 층을 선택해주세요</option>
                    @foreach ($audiences as $value => $label)
                        <option value="{{ $value }}">{{ $label }}</option>
                    @endforeach
                </select>
            </div>

            {{-- 사용한 AI (팝업에서 카테고리별 툴 복수 선택 → 하단 칩) --}}
            <div class="upload-row">
                <span class="upload-row__label">사용한 AI</span>
                <div class="upload-ai js-upload-ai" data-ai-groups='@json($aiToolGroups)'>
                    <button type="button" class="upload-ai-btn js-ai-btn" aria-haspopup="dialog">
                        <span class="js-ai-btn-text">사용한 AI 선택하기</span>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="upload-chips js-ai-chips"></div>
                </div>
            </div>

            <button type="submit" class="btn btn--primary upload-submit js-upload-submit">영상 등록하기</button>
        </form>
    </section>

    {{-- 사용한 AI 선택 팝업 (AI 버튼 클릭 시, 카테고리별 복수 선택) --}}
    <div class="modal js-ai-modal" id="modal-ai" role="dialog" aria-modal="true" aria-labelledby="modal-ai-title">
        <div class="modal__box modal__box--ai">
            <div class="modal__head">
                <h2 class="modal__title" id="modal-ai-title">사용한 AI 선택</h2>
                <button type="button" class="modal__close js-ai-modal-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </div>
            <p class="modal__desc">사용한 AI 툴을 선택해 주세요 (복수 선택 가능)</p>
            <div class="ai-modal__list js-ai-modal-list"></div>
            <div class="modal__actions">
                <button type="button" class="btn btn--primary js-ai-modal-ok">선택 완료</button>
            </div>
        </div>
    </div>

    {{-- 장르 선택 팝업 (장르 버튼 클릭 시, 복수 선택) --}}
    <div class="modal js-genre-modal" id="modal-genre" role="dialog" aria-modal="true" aria-labelledby="modal-genre-title">
        <div class="modal__box">
            <div class="modal__head">
                <h2 class="modal__title" id="modal-genre-title">장르 선택</h2>
                <button type="button" class="modal__close js-genre-modal-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </div>
            <p class="modal__desc">장르를 선택해 주세요 (복수 선택 가능)</p>
            <div class="genre-modal__list js-genre-modal-list"></div>
            <div class="modal__actions">
                <button type="button" class="btn btn--primary js-genre-modal-ok">선택 완료</button>
            </div>
        </div>
    </div>

    {{-- 주의사항 확인 (영상 등록하기 클릭 시) --}}
    <div class="modal js-upload-modal" id="modal-notice" role="dialog" aria-modal="true" aria-labelledby="modal-notice-title">
        <div class="modal__box modal__box--notice">
            <div class="modal__head">
                <h2 class="modal__title" id="modal-notice-title">동영상 업로드</h2>
                <button type="button" class="modal__close js-modal-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </div>
            <p class="modal__desc">동영상 업로드 중입니다.</p>
            <div class="modal__notice-box">
                <svg class="modal__warn-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                    <path d="M18 4 34 32H2L18 4Z" fill="#e60000"/>
                    <path d="M18 15v8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
                    <circle cx="18" cy="27" r="1.6" fill="#fff"/>
                </svg>
                <p class="modal__notice">영상은 내부 심사를 통해 게시됩니다.<br>심사로 인해 동영상 업로드가 지연될 수 있습니다.</p>
                <p class="modal__notice">아티스트가 저작권 침해·음란·폭력·테러 등 위법 영상물을 게시할 경우 제3자 피해를 포함한 모든 책임은 업로드한 아티스트에게 있으며, AIVEON은 해당 영상물의 삭제·차단 및 계정 접근 제한 등의 조치를 취할 수 있습니다.</p>
            </div>
            <div class="modal__actions">
                <button type="button" class="btn btn--primary js-notice-ok">확인</button>
            </div>
        </div>
    </div>
@endsection
