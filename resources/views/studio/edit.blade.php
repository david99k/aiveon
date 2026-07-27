@extends('layouts.app')

@section('title', '채널 편집 · AIVEON')

{{-- 마이페이지 셸 재사용 : 사이드바가 푸터까지 이어지도록 --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        {{-- 좌측 : 마이페이지 사이드바 (크리에이터 스튜디오 펼침 + 내 채널 관리 활성) --}}
        @include('partials.mypage-sidebar', ['studioSub' => 'channel'])

        {{-- 우측 : 채널 편집 폼 (공개 채널 페이지에 노출되는 정보) --}}
        <div class="mypage__content mypage__content--studio">
            <a href="{{ route('studio') }}" class="board__back" aria-label="내 채널로" title="내 채널">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>

            <h2 class="studio__title">채널 편집</h2>
            <p class="studio__lead">여기서 수정한 내용은 시청자에게 보이는 <a href="{{ route('channel') }}" class="chedit__link">공개 채널 페이지</a>에 그대로 반영됩니다.</p>

            <form class="chedit" action="#" method="post" onsubmit="return false">
                {{-- 배너 --}}
                <section class="chedit__group">
                    <h3 class="chedit__group-title">채널 배너</h3>
                    <p class="chedit__hint">권장 크기 1920 × 300 px · JPG/PNG · 최대 4MB</p>
                    <div class="chedit__banner">
                        <img src="{{ asset($channel['banner']) }}" alt="현재 채널 배너">
                    </div>
                    <div class="chedit__file-actions">
                        <button type="button" class="btn btn--primary">배너 변경</button>
                        <button type="button" class="btn btn--ghost">배너 삭제</button>
                    </div>
                </section>

                {{-- 프로필 이미지 --}}
                <section class="chedit__group">
                    <h3 class="chedit__group-title">프로필 이미지</h3>
                    <p class="chedit__hint">정사각형 이미지를 권장합니다 · 최소 98 × 98 px</p>
                    <div class="chedit__avatar-row">
                        <img class="chedit__avatar" src="{{ asset($channel['avatar']) }}" alt="현재 프로필 이미지">
                        <div class="chedit__file-actions">
                            <button type="button" class="btn btn--primary">이미지 변경</button>
                            <button type="button" class="btn btn--ghost">기본 이미지</button>
                        </div>
                    </div>
                </section>

                {{-- 기본 정보 --}}
                <section class="chedit__group">
                    <h3 class="chedit__group-title">기본 정보</h3>

                    <div class="inquiry__row">
                        <label class="inquiry__label" for="ch-name">채널명<span class="req">*</span></label>
                        <div class="inquiry__field">
                            <input type="text" id="ch-name" class="inquiry__input" value="{{ $channel['name'] }}" maxlength="30">
                            <p class="chedit__hint">최대 30자 · 14일에 2회까지 변경할 수 있어요</p>
                        </div>
                    </div>

                    <div class="inquiry__row">
                        <label class="inquiry__label" for="ch-handle">핸들<span class="req">*</span></label>
                        <div class="inquiry__field">
                            <div class="chedit__handle">
                                <span class="chedit__handle-at">@</span>
                                <input type="text" id="ch-handle" class="inquiry__input chedit__handle-input" value="{{ $channel['handle'] }}" maxlength="20">
                            </div>
                            <p class="chedit__hint">영문·숫자·밑줄(_)만 사용 · aiveon.kr/@{{ $channel['handle'] }}</p>
                        </div>
                    </div>

                    <div class="inquiry__row">
                        <label class="inquiry__label" for="ch-tagline">한 줄 소개</label>
                        <div class="inquiry__field">
                            <input type="text" id="ch-tagline" class="inquiry__input" value="{{ $channel['tagline'] }}" maxlength="60">
                            <p class="chedit__hint">채널명 아래에 표시됩니다 · 최대 60자</p>
                        </div>
                    </div>

                    <div class="inquiry__row inquiry__row--top">
                        <label class="inquiry__label" for="ch-desc">채널 소개</label>
                        <div class="inquiry__field">
                            <textarea id="ch-desc" class="inquiry__textarea chedit__textarea" maxlength="1000">{{ $channel['description'] }}</textarea>
                            <p class="chedit__hint">채널 정보 탭에 표시됩니다 · 최대 1,000자</p>
                        </div>
                    </div>
                </section>

                {{-- 대표 AI 툴 --}}
                <section class="chedit__group">
                    <h3 class="chedit__group-title">주로 사용하는 AI 툴</h3>
                    <p class="chedit__hint">채널 정보에 표시됩니다. 업로드 시 기록한 &ldquo;사용한 AI&rdquo; 중에서 골라주세요.</p>
                    <div class="chedit__tools">
                        @foreach ($toolOptions as $tool)
                            <label class="chedit__tool">
                                <input type="checkbox" name="tools[]" value="{{ $tool }}" @checked(in_array($tool, $channel['tools'], true))>
                                <span>{{ $tool }}</span>
                            </label>
                        @endforeach
                    </div>
                </section>

                {{-- 링크 --}}
                <section class="chedit__group">
                    <h3 class="chedit__group-title">링크</h3>
                    <p class="chedit__hint">채널 정보 하단에 버튼으로 노출됩니다 · 최대 5개</p>
                    <ul class="chedit__links">
                        @foreach ($channel['links'] as $i => $link)
                            <li class="chedit__link-row">
                                <input type="text" class="inquiry__input chedit__link-label" value="{{ $link['label'] }}" placeholder="표시 이름" aria-label="링크 {{ $i + 1 }} 표시 이름">
                                <input type="url" class="inquiry__input chedit__link-url" value="{{ $link['url'] }}" placeholder="https://" aria-label="링크 {{ $i + 1 }} 주소">
                                <button type="button" class="chedit__link-del" aria-label="링크 삭제">
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                                </button>
                            </li>
                        @endforeach
                    </ul>
                    <button type="button" class="chedit__link-add">＋ 링크 추가</button>
                </section>

                {{-- 공개 범위 --}}
                <section class="chedit__group">
                    <h3 class="chedit__group-title">채널 공개 범위</h3>
                    <div class="chedit__radios" role="radiogroup" aria-label="채널 공개 범위">
                        @foreach ($visibilities as $value => $label)
                            <label class="chedit__radio">
                                <input type="radio" class="radio" name="visibility" value="{{ $value }}" @checked($channel['visibility'] === $value)>
                                <span>{{ $label }}</span>
                            </label>
                        @endforeach
                    </div>
                </section>

                {{-- 저장 --}}
                <div class="chedit__actions">
                    <a href="{{ route('studio') }}" class="btn btn--ghost">취소</a>
                    <button type="submit" class="btn btn--primary">저장하기</button>
                </div>
            </form>
        </div>
    </section>
@endsection
