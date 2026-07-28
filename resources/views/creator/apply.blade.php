@extends('layouts.app')

@section('title', '크리에이터 신청 · AIVEON')

@section('content')
    <section class="capply">
        <div class="capply__head">
            <h1 class="capply__title">크리에이터 신청</h1>
            <p class="capply__lead">한 화면에서 모두 작성하고 제출합니다. 작성 중인 내용은 자동 임시저장됩니다.</p>
        </div>

        <form class="capply__body js-capply" method="post" action="{{ route('creator.apply.store') }}">
            @csrf

            {{-- 좌측 : 신청서 4개 그룹 --}}
            <div class="capply__main">
                {{-- 1. 기본 정보 : 로그인 계정에서 가져오는 값 --}}
                <section class="capply-card" data-capply-group="basic">
                    <div class="capply-card__head">
                        <span class="capply-card__no">1</span>
                        <h2 class="capply-card__title">기본 정보</h2>
                    </div>
                    <div class="capply-card__body">
                        <div class="capply-row">
                            <label class="capply-row__label" for="ca-name">이름<span class="req">*</span></label>
                            <div class="capply-row__field">
                                <input type="text" id="ca-name" name="name" class="capply-input capply-input--sm" value="{{ $account['name'] }}" readonly>
                                <p class="capply-hint">본인인증 정보와 동일해야 하며 직접 수정할 수 없습니다.</p>
                            </div>
                        </div>

                        <div class="capply-row">
                            <span class="capply-row__label">본인 인증<span class="req">*</span></span>
                            <div class="capply-row__field">
                                @if ($account['verified'])
                                    <div class="capply-verified">
                                        <span class="capply-verified__badge">
                                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                            인증 완료
                                        </span>
                                        <span class="capply-verified__meta">{{ $account['verifiedBy'] }} · {{ $account['verifiedAt'] }}</span>
                                    </div>
                                @else
                                    <button type="button" class="btn btn--ghost">본인 인증하기</button>
                                @endif
                                <p class="capply-hint">정산 지급을 위해 실명 확인이 필요합니다.</p>
                            </div>
                        </div>

                        <div class="capply-row">
                            <label class="capply-row__label" for="ca-email">연락 이메일<span class="req">*</span></label>
                            <div class="capply-row__field">
                                <input type="email" id="ca-email" name="email" class="capply-input capply-input--md" value="{{ $account['email'] }}" required>
                                <p class="capply-hint">심사 결과와 운영 안내를 이 주소로 보내드립니다.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {{-- 2. 채널 정보 : 승인 후 공개 채널에 그대로 노출 --}}
                <section class="capply-card" data-capply-group="channel">
                    <div class="capply-card__head">
                        <span class="capply-card__no">2</span>
                        <h2 class="capply-card__title">채널 정보</h2>
                    </div>
                    <div class="capply-card__body">
                        <div class="capply-row">
                            <label class="capply-row__label" for="ca-channel">채널명<span class="req">*</span></label>
                            <div class="capply-row__field">
                                <input type="text" id="ca-channel" name="channel_name" class="capply-input js-capply-required"
                                       value="{{ $form['channelName'] }}" maxlength="30" placeholder="시청자에게 보일 채널 이름" required>
                                <p class="capply-hint">최대 30자 · 승인 후 채널 편집에서 변경할 수 있어요</p>
                            </div>
                        </div>

                        <div class="capply-row">
                            <label class="capply-row__label" for="ca-handle">채널 핸들<span class="req">*</span></label>
                            <div class="capply-row__field">
                                <div class="capply-handle">
                                    <span class="capply-handle__at">@</span>
                                    <input type="text" id="ca-handle" name="handle" class="capply-input capply-handle__input js-capply-required js-capply-handle"
                                           value="{{ $form['handle'] }}" maxlength="20" placeholder="synergy_on" required>
                                </div>
                                <p class="capply-hint">영문·숫자·밑줄(_)만 사용 · <span class="js-capply-handle-url">aiveon.kr/@</span></p>
                            </div>
                        </div>

                        <div class="capply-row capply-row--top">
                            <label class="capply-row__label" for="ca-desc">채널 소개<span class="req">*</span></label>
                            <div class="capply-row__field">
                                <textarea id="ca-desc" name="description" class="capply-textarea js-capply-required" maxlength="500"
                                          placeholder="어떤 콘텐츠를 만들 계획인지 알려주세요. 심사에 참고합니다." required>{{ $form['description'] }}</textarea>
                                <p class="capply-hint">최대 500자</p>
                            </div>
                        </div>
                    </div>
                </section>

                {{-- 3. 활동 정보 : 심사 시 활동 계획 판단 근거 --}}
                <section class="capply-card" data-capply-group="activity">
                    <div class="capply-card__head">
                        <span class="capply-card__no">3</span>
                        <h2 class="capply-card__title">활동 정보</h2>
                    </div>
                    <div class="capply-card__body">
                        <div class="capply-row capply-row--top">
                            <span class="capply-row__label">주력 카테고리<span class="req">*</span></span>
                            <div class="capply-row__field">
                                <div class="capply-pills js-capply-cats" data-max="{{ $maxCategory }}">
                                    @foreach ($categories as $value => $label)
                                        <label class="capply-pill">
                                            <input type="checkbox" name="categories[]" value="{{ $value }}" @checked(in_array($value, $form['categories'], true))>
                                            <span>{{ $label }}</span>
                                        </label>
                                    @endforeach
                                </div>
                                <p class="capply-hint">최대 {{ $maxCategory }}개까지 선택할 수 있어요</p>
                            </div>
                        </div>

                        <div class="capply-row capply-row--top">
                            <span class="capply-row__label">사용하는 AI 툴<span class="req">*</span></span>
                            <div class="capply-row__field">
                                {{-- 업로드 폼과 같은 "사용한 AI 선택" 팝업 (initAiPicker) --}}
                                <div class="upload-ai capply-ai js-upload-ai"
                                     data-ai-groups='@json($aiToolGroups)'
                                     data-ai-selected='@json($form['tools'])'
                                     data-ai-name="tools[]"
                                     data-ai-label="AI 툴 선택하기"
                                     data-ai-noun="AI 툴">
                                    <button type="button" class="upload-ai-btn js-ai-btn" aria-haspopup="dialog">
                                        <span class="js-ai-btn-text">AI 툴 선택하기</span>
                                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    </button>
                                    <div class="upload-chips js-ai-chips"></div>
                                </div>
                                <p class="capply-hint">영상 업로드 시 기록하는 &ldquo;사용한 AI&rdquo;와 같은 목록입니다</p>
                            </div>
                        </div>

                        <div class="capply-row">
                            <label class="capply-row__label" for="ca-plan">업로드 계획<span class="req">*</span></label>
                            <div class="capply-row__field">
                                <select id="ca-plan" name="plan" class="capply-select capply-input--sm js-capply-required" required>
                                    <option value="" disabled @selected($form['plan'] === '')>업로드 주기를 선택해주세요</option>
                                    @foreach ($plans as $value => $label)
                                        <option value="{{ $value }}" @selected($form['plan'] === $value)>{{ $label }}</option>
                                    @endforeach
                                </select>
                                <p class="capply-hint">승인 후 데뷔 영상 3편을 올리면 최종 검토가 시작됩니다.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {{-- 4. 약관 동의 --}}
                <section class="capply-card" data-capply-group="terms">
                    <div class="capply-card__head">
                        <span class="capply-card__no">4</span>
                        <h2 class="capply-card__title">약관 동의</h2>
                    </div>
                    <div class="capply-card__body">
                        <div class="capply-terms js-capply-terms">
                            @foreach ($terms as $term)
                                <label class="capply-term">
                                    <input type="checkbox" name="agree_{{ $term['key'] }}" value="1" @class(['js-capply-req-term' => $term['required']])>
                                    <span class="capply-term__box" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    </span>
                                    <span class="capply-term__text">
                                        {{ $term['label'] }}
                                        <em class="capply-term__flag {{ $term['required'] ? 'is-req' : '' }}">({{ $term['required'] ? '필수' : '선택' }})</em>
                                    </span>
                                </label>
                            @endforeach
                        </div>
                    </div>
                </section>
            </div>

            {{-- 우측 : 진행률 · 제출 · 승인 후 안내 (데스크톱 고정) --}}
            <aside class="capply__side">
                <div class="capply-progress">
                    <div class="capply-progress__top">
                        <span class="capply-progress__label">작성 진행률</span>
                        <span class="capply-progress__pct js-capply-pct">0%</span>
                    </div>
                    <div class="capply-progress__track">
                        <span class="capply-progress__fill js-capply-fill" style="width: 0%"></span>
                    </div>

                    <ul class="capply-check js-capply-check">
                        <li data-capply-check="basic"><span class="capply-check__mark" aria-hidden="true"></span>기본 정보</li>
                        <li data-capply-check="channel"><span class="capply-check__mark" aria-hidden="true"></span>채널 정보</li>
                        <li data-capply-check="activity"><span class="capply-check__mark" aria-hidden="true"></span>활동 정보</li>
                        <li data-capply-check="terms"><span class="capply-check__mark" aria-hidden="true"></span>약관 동의</li>
                    </ul>

                    <button type="submit" class="btn btn--primary capply-submit js-capply-submit" disabled>신청서 제출</button>
                    <p class="capply-hint capply-hint--center">제출 후 {{ $reviewDays }}영업일 내 심사 결과 안내</p>
                </div>

                <div class="capply-notice">
                    <strong class="capply-notice__title">승인 후 진행 순서</strong>
                    심사 승인 → 데뷔 영상 3편 업로드 → 최종 검토 → 채널 공개
                </div>
            </aside>
        </form>
    </section>

    {{-- AI 툴 선택 팝업 (업로드 폼과 동일한 UI · initAiPicker 가 내용 구성) --}}
    <div class="modal js-ai-modal" id="modal-ai" role="dialog" aria-modal="true" aria-labelledby="modal-ai-title">
        <div class="modal__box modal__box--ai">
            <div class="modal__head">
                <h2 class="modal__title" id="modal-ai-title">사용한 AI 선택</h2>
                <button type="button" class="modal__close js-ai-modal-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </div>
            <p class="modal__desc">주로 사용하는 AI 툴을 선택해 주세요 (복수 선택 가능)</p>
            <div class="ai-modal__list js-ai-modal-list"></div>
            <div class="modal__actions">
                <button type="button" class="btn btn--primary js-ai-modal-ok">선택 완료</button>
            </div>
        </div>
    </div>
@endsection
