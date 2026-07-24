@extends('layouts.app')

@section('title', '콘텐츠 업로드 · AIVEON')

@section('content')
    <section class="upload">
        <h1 class="upload__title">콘텐츠 업로드</h1>

        <form class="upload-form js-upload-form" action="{{ route('upload') }}" method="post" novalidate>
            {{-- 미리보기 : 업로드된 동영상 --}}
            <div class="upload-row">
                <span class="upload-row__label">미리보기</span>
                <div class="upload-preview">
                    <figure class="upload-preview__thumb"><img src="{{ asset('images/main/thumb_wide_adventure.jpg') }}" alt=""></figure>
                    <div class="upload-preview__meta">
                        <div class="upload-preview__badges">
                            <span class="upload-preview__badge">FHD</span>
                            <span class="upload-preview__badge">2K</span>
                            <span class="upload-preview__badge">4K</span>
                        </div>
                        <span class="upload-preview__name">파일명 : 마법 같은 우리의 모험 원본.png</span>
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

            {{-- 사용한 AI --}}
            <div class="upload-row">
                <span class="upload-row__label">사용한 AI</span>
                <div>
                    <button type="button" class="upload-ai-btn">
                        사용한 AI 선택하기
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="upload-chips">
                        @foreach ($aiTools as $tool)
                            <span class="upload-chip">{{ $tool }}
                                <button type="button" aria-label="삭제"><svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button>
                            </span>
                        @endforeach
                    </div>
                </div>
            </div>

            <button type="submit" class="btn btn--primary upload-submit js-upload-submit">영상 등록하기</button>
        </form>
    </section>

    {{-- 1) 동영상 종류 선택 --}}
    <div class="modal js-upload-modal" id="modal-type" role="dialog" aria-modal="true" aria-labelledby="modal-type-title">
        <div class="modal__box">
            <div class="modal__head">
                <h2 class="modal__title" id="modal-type-title">동영상 업로드</h2>
                <button type="button" class="modal__close js-modal-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </div>
            <p class="modal__desc">동영상의 종류를 선택해주세요</p>
            <div class="modal__choice">
                <button type="button" class="btn btn--ghost js-type-shorts">숏츠</button>
                <button type="button" class="btn btn--primary js-type-drama">드라마/영화</button>
            </div>
        </div>
    </div>

    {{-- 2) 파일 업로드 --}}
    <div class="modal js-upload-modal" id="modal-file" role="dialog" aria-modal="true" aria-labelledby="modal-file-title">
        <div class="modal__box">
            <div class="modal__head">
                <h2 class="modal__title" id="modal-file-title">동영상 업로드</h2>
                <button type="button" class="modal__close js-modal-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </div>
            <div class="upload-dropzone">
                <svg class="upload-dropzone__icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <path d="M20 44a12 12 0 0 1-1.5-23.9A16 16 0 0 1 49 24a10 10 0 0 1-.5 20H40" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M32 30v18m0-18-6 6m6-6 6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p class="upload-dropzone__text">동영상 파일을 여기에 올려주세요.</p>
                <button type="button" class="btn btn--primary js-file-select">파일 선택하기</button>
            </div>
        </div>
    </div>

    {{-- 3) 주의사항 확인 (등록 시) --}}
    <div class="modal js-upload-modal" id="modal-notice" role="dialog" aria-modal="true" aria-labelledby="modal-notice-title">
        <div class="modal__box">
            <div class="modal__head">
                <h2 class="modal__title" id="modal-notice-title">동영상 업로드</h2>
                <button type="button" class="modal__close js-modal-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </div>
            <p class="modal__desc">동영상 업로드 중입니다.</p>
            <svg class="modal__warn-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <path d="M18 4 34 32H2L18 4Z" fill="#e60000"/>
                <path d="M18 15v8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
                <circle cx="18" cy="27" r="1.6" fill="#fff"/>
            </svg>
            <p class="modal__notice">
                영상은 내부 심사를 거쳐 게시되며, 심사로 인해 업로드가 지연될 수 있습니다.
                아티스트가 저작권을 침해하거나 음란·폭력·테러 등 위법한 영상물을 게시할 경우
                제3자 피해를 포함한 모든 책임은 업로드한 아티스트에게 있으며,
                AIVEON은 해당 영상물의 삭제·차단 및 계정 접근 제한 등의 조치를 취할 수 있습니다.
            </p>
            <div class="modal__actions">
                <button type="button" class="btn btn--primary js-notice-ok">확인</button>
            </div>
        </div>
    </div>
@endsection
