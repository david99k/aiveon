/**
 * VIBUZZ 메인 - 공통 스크립트
 * 가로 스크롤 리스트([data-scroll-x])에 마우스 드래그 스크롤을 적용한다.
 */
(function () {
    'use strict';

    var DRAG_THRESHOLD = 5; // px - 이 값 이상 움직여야 드래그로 판정 (클릭 오동작 방지)

    function initDragScroll(el) {
        var isDown = false;
        var isDragging = false;
        var startX = 0;
        var startScrollLeft = 0;

        // 썸네일 이미지의 네이티브 HTML5 드래그가 드래그 스크롤을 가로채지 않도록 차단
        el.addEventListener('dragstart', function (e) {
            e.preventDefault();
        });

        el.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse') { return; } // 터치는 네이티브 스크롤 사용
            isDown = true;
            isDragging = false;
            startX = e.clientX;
            startScrollLeft = el.scrollLeft;
        });

        el.addEventListener('pointermove', function (e) {
            if (!isDown) { return; }

            var dx = e.clientX - startX;

            if (!isDragging && Math.abs(dx) > DRAG_THRESHOLD) {
                isDragging = true;
                el.classList.add('is-dragging');
                try {
                    el.setPointerCapture(e.pointerId);
                } catch (err) {
                    /* 일부 구형 브라우저 미지원 - 캡처 없이 동작 */
                }
            }

            if (isDragging) {
                el.scrollLeft = startScrollLeft - dx;
            }
        });

        function endDrag() {
            if (!isDown) { return; }
            isDown = false;

            // 클릭 이벤트가 드래그 직후 발생하지 않도록 한 프레임 뒤에 해제
            window.setTimeout(function () {
                isDragging = false;
                el.classList.remove('is-dragging');
            }, 0);
        }

        el.addEventListener('pointerup', endDrag);
        el.addEventListener('pointercancel', endDrag);
        el.addEventListener('pointerleave', endDrag);
    }

    /**
     * 비밀번호 표시/숨김 토글.
     * .js-pw-toggle 버튼이 같은 .field__control 안의 password input을 제어한다.
     */
    function initPasswordToggles() {
        var toggles = document.querySelectorAll('.js-pw-toggle');

        Array.prototype.forEach.call(toggles, function (btn) {
            btn.addEventListener('click', function () {
                var control = btn.closest('.field__control');
                if (!control) { return; }

                var input = control.querySelector('input');
                if (!input) { return; }

                var isHidden = input.type === 'password';
                input.type = isHidden ? 'text' : 'password';
                btn.classList.toggle('is-hidden', isHidden);
                btn.setAttribute('aria-pressed', String(isHidden));
                btn.setAttribute('aria-label', isHidden ? '비밀번호 숨김' : '비밀번호 표시');
            });
        });
    }

    /**
     * 약관 전체동의(.js-terms-all)와 개별 약관(.js-terms-item) 동기화.
     * - 전체동의 클릭 -> 모든 개별 항목 on/off
     * - 개별 항목 변경 -> 전체가 모두 체크됐을 때만 전체동의 on
     */
    function initTermsAgree() {
        var master = document.querySelector('.js-terms-all');
        if (!master) { return; }

        var items = document.querySelectorAll('.js-terms-item');
        if (!items.length) { return; }

        master.addEventListener('change', function () {
            Array.prototype.forEach.call(items, function (item) {
                item.checked = master.checked;
            });
        });

        Array.prototype.forEach.call(items, function (item) {
            item.addEventListener('change', function () {
                master.checked = Array.prototype.every.call(items, function (i) { return i.checked; });
            });
        });
    }

    /**
     * 메일 인증번호 카운트다운.
     * .js-send-code 클릭 시 .js-code-timer를 지정 시간(기본 3분)부터 감소시킨다.
     */
    function initCodeTimer() {
        var timerEl = document.querySelector('.js-code-timer');
        if (!timerEl) { return; }

        var DURATION = 180; // seconds
        var remaining = 0;
        var intervalId = null;

        function render() {
            var m = Math.floor(remaining / 60);
            var s = remaining % 60;
            timerEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        }

        function start() {
            remaining = DURATION;
            render();
            window.clearInterval(intervalId);
            intervalId = window.setInterval(function () {
                remaining -= 1;
                if (remaining <= 0) {
                    remaining = 0;
                    window.clearInterval(intervalId);
                }
                render();
            }, 1000);
        }

        var triggers = document.querySelectorAll('.js-send-code, .js-resend-code');
        Array.prototype.forEach.call(triggers, function (btn) {
            btn.addEventListener('click', function (e) {
                if (btn.tagName === 'A') { e.preventDefault(); }
                start();
            });
        });
    }

    /**
     * 휴대폰 번호 자동 하이픈.
     * 숫자만 남긴 뒤 010-1234-5678(11자리 3-4-4) / 011-123-4567(10자리 3-3-4)
     * 형태로 포맷하고, 커서는 입력하던 숫자 위치를 유지한다.
     */
    function formatPhoneDigits(digits) {
        if (digits.length < 4) { return digits; }
        if (digits.length < 8) { return digits.slice(0, 3) + '-' + digits.slice(3); }
        if (digits.length < 11) { return digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6); }
        return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7);
    }

    function initPhoneFormat() {
        var tels = document.querySelectorAll('input[type="tel"]');

        Array.prototype.forEach.call(tels, function (input) {
            function apply() {
                /* 계정 찾기처럼 런타임에 type이 email 등으로 바뀌는 필드는 건너뛴다 */
                if (input.type !== 'tel') { return; }

                var caret = input.selectionStart === null ? input.value.length : input.selectionStart;
                var digitsBeforeCaret = input.value.slice(0, caret).replace(/\D/g, '').length;
                var digits = input.value.replace(/\D/g, '').slice(0, 11);
                var next = formatPhoneDigits(digits);

                if (input.value !== next) { input.value = next; }

                // 커서를 "같은 숫자 개수 뒤" 위치로 복원 (하이픈 삽입에 밀리지 않게)
                var pos = 0;
                var count = 0;
                while (pos < next.length && count < digitsBeforeCaret) {
                    if (/\d/.test(next.charAt(pos))) { count += 1; }
                    pos += 1;
                }
                try { input.setSelectionRange(pos, pos); } catch (e) { /* 미포커스 상태 등 - 무시 */ }
            }

            input.addEventListener('input', apply);
            if (input.value) { apply(); } // 서버 재렌더로 채워진 기존 값도 포맷
        });
    }

    /**
     * 단일 페이지 멀티스텝(위저드) 로그인/회원가입 플로우.
     * .auth-flow 안의 .auth-step 패널들을 가로 슬라이드 + 높이 모핑으로 전환하고,
     * 각 단계 이동 전에 클라이언트 유효성 검사를 수행한다.
     */
    function initAuthFlow() {
        var flow = document.querySelector('.auth-flow');
        if (!flow) { return; }

        var viewport = flow.querySelector('.auth-flow__viewport');
        var track = flow.querySelector('.auth-flow__track');
        var steps = Array.prototype.slice.call(flow.querySelectorAll('.auth-step'));
        var bar = flow.querySelector('.auth-flow__bar');
        var countEl = flow.querySelector('.js-flow-count');
        var backBtn = flow.querySelector('.js-flow-back');
        var total = steps.length;
        var current = parseInt(flow.getAttribute('data-step'), 10) || 1;
        var resizeObserver = null;
        var SUPPORTS_INERT = ('inert' in HTMLElement.prototype);
        var progressEl = flow.querySelector('.auth-flow__progress');
        var statusEl = flow.querySelector('.auth-flow__status');

        var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var PHONE_RE = /^01[0-9]{8,9}$/;

        function field(name) { return flow.querySelector('.field[data-field="' + name + '"]'); }

        function setError(el, msg) {
            if (!el) { return; }
            el.classList.add('is-error');
            var m = el.querySelector('.field__error-msg');
            if (m && msg) { m.textContent = msg; }
            var input = el.querySelector('input');
            if (input) { input.setAttribute('aria-invalid', 'true'); }
        }

        function clearError(el) {
            if (!el) { return; }
            el.classList.remove('is-error');
            var input = el.querySelector('input');
            if (input) { input.removeAttribute('aria-invalid'); }
        }

        function focusFirstError(step) {
            var panel = steps[step - 1];
            if (!panel) { return; }
            var firstBad = panel.querySelector('.field.is-error input');
            if (!firstBad && step === 1 && panel.querySelector('.auth__terms-error.is-visible')) {
                firstBad = panel.querySelector('.js-agree');
            }
            if (!firstBad && step === 2 && panel.querySelector('.js-terms-error.is-visible')) {
                firstBad = ['term-privacy', 'term-age', 'term-service']
                    .map(function (id) { return document.getElementById(id); })
                    .filter(function (cb) { return cb && !cb.checked; })[0];
            }
            if (firstBad) {
                try { firstBad.focus({ preventScroll: true }); }
                catch (e) { firstBad.focus(); }
            }
        }

        function value(name) {
            var f = field(name);
            var input = f && f.querySelector('input');
            return input ? input.value : '';
        }

        function setHeight() {
            var active = steps[current - 1];
            if (active) { viewport.style.height = active.offsetHeight + 'px'; }
        }

        function observeActive() {
            if (typeof ResizeObserver === 'undefined') { return; }
            if (resizeObserver) { resizeObserver.disconnect(); }
            resizeObserver = new ResizeObserver(function () { setHeight(); });
            resizeObserver.observe(steps[current - 1]);
        }

        function validateStep(step) {
            var ok = true;
            var panel = steps[step - 1];

            if (step === 1) {
                var email = field('email');
                var emailV = value('email').trim();
                if (!emailV) { setError(email, '이메일을 입력해주세요.'); ok = false; }
                else if (!EMAIL_RE.test(emailV)) { setError(email, '올바른 이메일 형식이 아닙니다.'); ok = false; }
                else { clearError(email); }

                var pw = field('password');
                var pwV = value('password');
                if (!pwV) { setError(pw, '비밀번호를 입력해주세요.'); ok = false; }
                else if (pwV.length < 8) { setError(pw, '비밀번호를 8자 이상 입력해주세요.'); ok = false; }
                else { clearError(pw); }

                var pwc = field('password_confirm');
                var pwcV = value('password_confirm');
                if (!pwcV) { setError(pwc, '비밀번호를 다시 입력해주세요.'); ok = false; }
                else if (pwcV !== pwV) { setError(pwc, '비밀번호가 일치하지 않습니다.'); ok = false; }
                else { clearError(pwc); }

                var agree = panel.querySelector('.js-agree');
                var agreeErr = panel.querySelector('.auth__terms-error');
                var agreeRow = panel.querySelector('.auth__terms-row');
                if (agree && !agree.checked) {
                    if (agreeErr) { agreeErr.classList.add('is-visible'); }
                    if (agreeRow) { agreeRow.classList.add('is-error'); }
                    ok = false;
                } else {
                    if (agreeErr) { agreeErr.classList.remove('is-visible'); }
                    if (agreeRow) { agreeRow.classList.remove('is-error'); }
                }
            } else if (step === 2) {
                var code = field('code');
                var codeV = value('code').replace(/\D/g, '');
                if (!codeV) { setError(code, '메일 인증번호를 입력해주세요.'); ok = false; }
                else if (!/^[0-9]{6}$/.test(codeV)) { setError(code, '6자리 인증번호를 정확히 입력해주세요.'); ok = false; }
                else { clearError(code); }

                var termsErr = panel.querySelector('.js-terms-error');
                var required = ['term-privacy', 'term-age', 'term-service'];
                var allReq = required.every(function (id) {
                    var cb = document.getElementById(id);
                    return cb && cb.checked;
                });
                if (!allReq) {
                    if (termsErr) { termsErr.classList.add('is-visible'); }
                    ok = false;
                } else if (termsErr) {
                    termsErr.classList.remove('is-visible');
                }
            } else if (step === 3) {
                var name = field('name');
                if (!value('name').trim()) { setError(name, '이름을 입력해주세요.'); ok = false; }
                else { clearError(name); }

                var phone = field('phone');
                var phoneV = value('phone').replace(/\D/g, '');
                if (!phoneV) { setError(phone, '휴대폰 번호를 입력해주세요.'); ok = false; }
                else if (!PHONE_RE.test(phoneV)) { setError(phone, '올바른 휴대폰 번호를 입력해주세요.'); ok = false; }
                else { clearError(phone); }
            }

            setHeight();
            return ok;
        }

        function render(focusInput) {
            flow.setAttribute('data-step', String(current));
            track.style.transform = 'translateX(' + (-(current - 1) * 100) + '%)';
            if (bar) { bar.style.width = (current / total * 100) + '%'; }
            if (countEl) { countEl.textContent = String(current); }
            if (progressEl) { progressEl.setAttribute('aria-valuenow', String(current)); }

            steps.forEach(function (s, i) {
                var isActive = (i === current - 1);
                s.setAttribute('aria-hidden', String(!isActive));
                if (isActive) { s.removeAttribute('inert'); }
                else { s.setAttribute('inert', ''); }

                // inert 미지원 브라우저: 비활성 단계의 포커스 대상을 탭 순서에서 제외
                if (!SUPPORTS_INERT) {
                    var focusables = s.querySelectorAll('input, button, a, select, textarea');
                    Array.prototype.forEach.call(focusables, function (el) {
                        if (isActive) {
                            if (el.hasAttribute('data-flow-tabindex')) {
                                el.setAttribute('tabindex', el.getAttribute('data-flow-tabindex'));
                                el.removeAttribute('data-flow-tabindex');
                            } else {
                                el.removeAttribute('tabindex');
                            }
                        } else {
                            if (!el.hasAttribute('data-flow-tabindex')) {
                                el.setAttribute('data-flow-tabindex', el.getAttribute('tabindex') || '');
                            }
                            el.setAttribute('tabindex', '-1');
                        }
                    });
                }
            });

            setHeight();
            observeActive();

            if (focusInput) {
                var firstInput = steps[current - 1].querySelector('input:not([type="checkbox"])');
                if (firstInput) {
                    try { firstInput.focus({ preventScroll: true }); }
                    catch (e) { firstInput.focus(); }
                }
            }
        }

        function goTo(step, focusInput) {
            current = Math.min(Math.max(step, 1), total);
            render(focusInput);
            // 단계 변경을 보조기술에 공지
            if (statusEl) {
                var label = steps[current - 1].getAttribute('aria-label') || '';
                statusEl.textContent = current + ' / ' + total + ' 단계' + (label ? ' · ' + label : '');
            }
        }

        // 다음 단계 버튼
        Array.prototype.forEach.call(flow.querySelectorAll('.js-flow-next'), function (btn) {
            btn.addEventListener('click', function () {
                if (validateStep(current)) { goTo(current + 1, true); }
                else { focusFirstError(current); }
            });
        });

        // 뒤로가기
        if (backBtn) {
            backBtn.addEventListener('click', function () { goTo(current - 1, true); });
        }

        // 입력 시 해당 필드 에러 해제 + 높이 보정
        Array.prototype.forEach.call(flow.querySelectorAll('.field input'), function (input) {
            input.addEventListener('input', function () {
                clearError(input.closest('.field'));
                setHeight();
            });
        });

        // 폼 제출(엔터 포함) 처리:
        // 마지막 단계가 아니면 제출 대신 다음 단계로 이동.
        // 마지막 단계에서는 모든 단계를 재검증하고, 실패 시 첫 실패 단계로 이동한다.
        flow.addEventListener('submit', function (e) {
            if (current < total) {
                e.preventDefault();
                if (validateStep(current)) { goTo(current + 1, true); }
                else { focusFirstError(current); }
                return;
            }

            var firstInvalid = 0;
            for (var s = 1; s <= total; s++) {
                if (!validateStep(s) && !firstInvalid) { firstInvalid = s; }
            }
            if (firstInvalid) {
                e.preventDefault();
                if (firstInvalid !== current) { goTo(firstInvalid, false); }
                focusFirstError(firstInvalid);
            }
        });

        window.addEventListener('resize', setHeight);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(setHeight);
        }

        // 초기 표시는 애니메이션 없이 위치만 세팅
        var vT = viewport.style.transition;
        var tT = track.style.transition;
        viewport.style.transition = 'none';
        track.style.transition = 'none';
        render(false);
        void viewport.offsetHeight; // reflow
        viewport.style.transition = vT;
        track.style.transition = tT;
    }

    /**
     * 메인 히어로 슬라이더 (Swiper CDN).
     * 3개 이상 콘텐츠를 루프 + 자동재생(5초, 호버 시 일시정지)으로 순환한다.
     * Swiper 미로드/슬라이드 1개면 조용히 건너뛴다(첫 슬라이드 정적 노출).
     */
    function initHeroSwiper() {
        var el = document.querySelector('.js-hero-swiper');
        if (!el || typeof Swiper === 'undefined') { return; }

        var slideCount = el.querySelectorAll('.swiper-slide').length;
        if (slideCount < 2) { return; }

        var reduceMotion = window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        new Swiper(el, {
            loop: true,
            speed: 600,
            autoplay: reduceMotion ? false : {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            keyboard: { enabled: true, onlyInViewport: true },
            pagination: {
                el: el.querySelector('.hero__pagination'),
                clickable: true
            },
            navigation: {
                prevEl: el.querySelector('.hero__nav--prev'),
                nextEl: el.querySelector('.hero__nav--next')
            },
            a11y: {
                prevSlideMessage: '이전 콘텐츠',
                nextSlideMessage: '다음 콘텐츠',
                paginationBulletMessage: '{{index}}번째 콘텐츠로 이동'
            }
        });
    }

    /**
     * 플레이어 영상 제어.
     * - 중앙 재생 버튼/영상 클릭 : 재생 <-> 일시정지 (재생 중엔 버튼 숨김)
     * - 음소거 버튼 : 토글 + 아이콘 전환
     * - 진행바 : timeupdate 로 실시간 갱신, 클릭/드래그로 구간 이동(시킹)
     */
    function initPlayerVideo() {
        var videos = document.querySelectorAll('.js-player-video');
        if (!videos.length) { return; }
        // 세로 피드에서 슬라이드마다 영상이 있으므로 각 영상을 독립적으로 제어
        Array.prototype.forEach.call(videos, setupPlayerVideo);
    }

    function setupPlayerVideo(video) {
        var wrap = video.closest('.player__video');
        var playBtn = wrap.querySelector('.player__play');
        var muteBtn = wrap.querySelector('.js-player-mute');
        var progress = wrap.querySelector('.player__progress');
        var fill = wrap.querySelector('.player__progress-fill');

        function syncPlayState() {
            wrap.classList.toggle('is-playing', !video.paused && !video.ended);
            if (playBtn) { playBtn.setAttribute('aria-label', video.paused ? '재생' : '일시정지'); }
        }

        function togglePlay() {
            if (video.paused || video.ended) {
                var p = video.play();
                if (p && p.catch) { p.catch(function () { /* 자동재생 정책 등으로 거부 - 버튼 유지 */ }); }
            } else {
                video.pause();
            }
        }

        if (playBtn) { playBtn.addEventListener('click', togglePlay); }
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', syncPlayState);
        video.addEventListener('pause', syncPlayState);
        video.addEventListener('ended', syncPlayState);

        if (muteBtn) {
            muteBtn.addEventListener('click', function () {
                video.muted = !video.muted;
                muteBtn.classList.toggle('is-muted', video.muted);
                muteBtn.setAttribute('aria-pressed', String(video.muted));
                muteBtn.setAttribute('aria-label', video.muted ? '음소거 해제' : '음소거');
            });
        }

        // 진행바 실시간 갱신
        if (progress && fill) {
            video.addEventListener('timeupdate', function () {
                if (!video.duration) { return; }
                var pct = (video.currentTime / video.duration) * 100;
                fill.style.width = pct + '%';
                progress.setAttribute('aria-valuenow', String(Math.round(pct)));
            });

            // 클릭/드래그 시킹
            var seeking = false;

            function seekTo(clientX) {
                var rect = progress.getBoundingClientRect();
                var ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
                if (video.duration) { video.currentTime = ratio * video.duration; }
            }

            progress.addEventListener('pointerdown', function (e) {
                seeking = true;
                try { progress.setPointerCapture(e.pointerId); } catch (err) { /* 미지원 무시 */ }
                seekTo(e.clientX);
            });
            progress.addEventListener('pointermove', function (e) {
                if (seeking) { seekTo(e.clientX); }
            });
            progress.addEventListener('pointerup', function () { seeking = false; });
            progress.addEventListener('pointercancel', function () { seeking = false; });
        }

        syncPlayState();
    }

    /**
     * 시청 페이지(드라마/영화) 16:9 플레이어 제어.
     * 중앙/하단 재생 토글, 음소거, 시간 표시(mm:ss / mm:ss),
     * 진행바 실시간 갱신 + 클릭/드래그 시킹, 전체화면.
     */
    function initWatchVideo() {
        var video = document.querySelector('.js-watch-video');
        if (!video) { return; }

        var wrap = video.closest('.watch__player');
        var centerBtn = wrap.querySelector('.watch__play-center');
        var playBtn = wrap.querySelector('.js-watch-play');
        var muteBtn = wrap.querySelector('.js-watch-mute');
        var volumeSlider = wrap.querySelector('.js-watch-volume');
        var fullBtn = wrap.querySelector('.js-watch-full');
        var timeEl = wrap.querySelector('.js-watch-time');
        var progress = wrap.querySelector('.watch__progress');
        var fill = wrap.querySelector('.watch__progress-fill');
        var lastVolume = 1; // 음소거 해제 시 복원할 직전 음량

        function fmt(sec) {
            if (!isFinite(sec)) { return '0:00'; }
            var m = Math.floor(sec / 60);
            var s = Math.floor(sec % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }

        function syncPlayState() {
            wrap.classList.toggle('is-playing', !video.paused && !video.ended);
        }

        function syncTime() {
            if (timeEl) { timeEl.textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration); }
            if (fill && video.duration) {
                var pct = (video.currentTime / video.duration) * 100;
                fill.style.width = pct + '%';
                if (progress) { progress.setAttribute('aria-valuenow', String(Math.round(pct))); }
            }
        }

        function togglePlay() {
            if (video.paused || video.ended) {
                var p = video.play();
                if (p && p.catch) { p.catch(function () { /* 자동재생 거부 - 무시 */ }); }
            } else {
                video.pause();
            }
        }

        [centerBtn, playBtn].forEach(function (btn) {
            if (btn) { btn.addEventListener('click', togglePlay); }
        });
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', syncPlayState);
        video.addEventListener('pause', syncPlayState);
        video.addEventListener('ended', syncPlayState);
        video.addEventListener('timeupdate', syncTime);
        video.addEventListener('loadedmetadata', syncTime);

        // 음소거 아이콘·슬라이더를 현재 음량/음소거 상태에 맞춰 동기화
        function syncVolumeUI() {
            var effective = video.muted ? 0 : video.volume; // 0~1
            if (muteBtn) {
                muteBtn.classList.toggle('is-muted', effective === 0);
                muteBtn.setAttribute('aria-pressed', String(video.muted));
                muteBtn.setAttribute('aria-label', effective === 0 ? '음소거 해제' : '음소거');
            }
            if (volumeSlider) {
                volumeSlider.value = String(effective);
                volumeSlider.style.setProperty('--vol', (effective * 100) + '%');
            }
        }

        if (muteBtn) {
            muteBtn.addEventListener('click', function () {
                if (video.muted || video.volume === 0) {
                    // 음소거 해제 → 직전 음량(없으면 최대)으로 복원
                    video.muted = false;
                    if (video.volume === 0) { video.volume = lastVolume || 1; }
                } else {
                    lastVolume = video.volume;
                    video.muted = true;
                }
                syncVolumeUI();
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', function () {
                var v = parseFloat(volumeSlider.value);
                video.volume = v;
                video.muted = (v === 0);
                if (v > 0) { lastVolume = v; }
                syncVolumeUI();
            });
        }

        // 프로그램적 음량/음소거 변경도 UI에 반영
        video.addEventListener('volumechange', syncVolumeUI);

        if (fullBtn) {
            fullBtn.addEventListener('click', function () {
                var target = wrap;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (target.requestFullscreen) {
                    target.requestFullscreen();
                }
            });
        }

        if (progress) {
            var seeking = false;

            function seekTo(clientX) {
                var rect = progress.getBoundingClientRect();
                var ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
                if (video.duration) { video.currentTime = ratio * video.duration; }
            }

            progress.addEventListener('pointerdown', function (e) {
                seeking = true;
                try { progress.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
                seekTo(e.clientX);
            });
            progress.addEventListener('pointermove', function (e) { if (seeking) { seekTo(e.clientX); } });
            progress.addEventListener('pointerup', function () { seeking = false; });
            progress.addEventListener('pointercancel', function () { seeking = false; });
        }

        /* 재생 중 마우스 유휴 시 컨트롤 자동 숨김 (움직이면 다시 표시).
           일시정지 상태에서는 항상 표시한다. */
        var IDLE_MS = 2600;
        var idleTimer = null;

        function showControls() {
            wrap.classList.remove('is-controls-hidden');
        }

        function hideControls() {
            if (!video.paused && !video.ended) { wrap.classList.add('is-controls-hidden'); }
        }

        function scheduleHide() {
            window.clearTimeout(idleTimer);
            if (video.paused || video.ended) { return; }
            idleTimer = window.setTimeout(hideControls, IDLE_MS);
        }

        function onActivity() {
            showControls();
            scheduleHide();
        }

        wrap.addEventListener('mousemove', onActivity);
        wrap.addEventListener('touchstart', onActivity, { passive: true });
        wrap.addEventListener('mouseleave', function () {
            window.clearTimeout(idleTimer);
            hideControls();
        });
        video.addEventListener('play', scheduleHide);
        video.addEventListener('pause', function () { window.clearTimeout(idleTimer); showControls(); });
        video.addEventListener('ended', function () { window.clearTimeout(idleTimer); showControls(); });

        /* 5초 스킵 · 재생속도 · 화질선택 (마크업 주입 → 블레이드/프리뷰 수정 없이 전 시청 페이지 적용) */
        var tools = initWatchTools(wrap, video, {
            isMenuOpen: function () { return !!wrap.querySelector('.watch__menu.is-open'); },
            onActivity: function () { showControls(); scheduleHide(); }
        });

        /* 메뉴가 열려 있으면 컨트롤을 숨기지 않는다 */
        var _hideControls = hideControls;
        hideControls = function () {
            if (tools && tools.isMenuOpen()) { return; }
            _hideControls();
        };

        syncPlayState();
        syncTime();
        syncVolumeUI();
        scheduleHide(); // 자동재생 시작 시 유휴 타이머 가동
    }

    /**
     * 시청 플레이어 부가 컨트롤 : 5초 뒤로/앞으로 · 재생 속도 · 화질 선택.
     *
     * 마크업을 JS로 주입해 블레이드와 정적 프리뷰 어디서나 동일하게 동작한다.
     * - 5초 스킵 : 버튼 + 좌우 방향키
     * - 재생 속도 : 0.5 ~ 2배속 (video.playbackRate)
     * - 화질 : 자동 / 1080p / 720p / 480p
     *   시안은 단일 MP4 소스라 라벨·선택 상태만 바뀐다.
     *   실서비스(HLS/DASH)에서는 선택값을 해당 렌디션으로 전환하는 지점이다.
     *
     * 라이브(.watch__live-panel)에서는 되감기·배속이 성립하지 않아 화질만 노출한다.
     */
    function initWatchTools(wrap, video, hooks) {
        var bar = wrap.querySelector('.watch__controls');
        if (!bar || bar.querySelector('.watch__menu')) { return null; }

        var isLive = !!document.querySelector('.watch__live-panel');
        var SKIP = 5;

        var ICON = {
            back: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5.5A7.5 7.5 0 1 1 4.7 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 2.6 8.6 5.5 12 8.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            fwd: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5.5A7.5 7.5 0 1 0 19.3 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 2.6 15.4 5.5 12 8.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            gear: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.6 8.6h16.8M3.6 15.4h16.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="8.6" r="2.4" stroke="currentColor" stroke-width="1.8"/><circle cx="15" cy="15.4" r="2.4" stroke="currentColor" stroke-width="1.8"/></svg>',
            /* 자막 : CC 박스. 꺼짐 상태는 사선을 덧그린다 */
            ccOn: '<svg class="icon-cc-on" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.6" y="5" width="18.8" height="14" rx="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M10.2 10.3a2.4 2.4 0 1 0 0 3.4M17 10.3a2.4 2.4 0 1 0 0 3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
            ccOff: '<svg class="icon-cc-off" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.6" y="5" width="18.8" height="14" rx="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M10.2 10.3a2.4 2.4 0 1 0 0 3.4M17 10.3a2.4 2.4 0 1 0 0 3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m3.6 20.4 16.8-16.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
        };

        /* 시안용 자막 대사 : 실서비스에서는 <track> 의 VTT 를 그대로 쓴다 */
        var DEMO_CC = [
            '당신의 하루에, 가장 따뜻한 빛이 되기를',
            '어떤 밤은 혼자 견디기엔 너무 길었다',
            '그래서 우리는 서로의 빛이 되기로 했다',
            '괜찮아, 오늘은 여기까지만 걸어도 돼'
        ];

        var SPEEDS = [
            { v: 0.5, t: '0.5배속' }, { v: 0.75, t: '0.75배속' }, { v: 1, t: '보통' },
            { v: 1.25, t: '1.25배속' }, { v: 1.5, t: '1.5배속' }, { v: 2, t: '2배속' }
        ];
        var QUALITIES = [
            { v: 'auto', t: '자동' }, { v: '1080p', t: '1080p' }, { v: '720p', t: '720p' }, { v: '480p', t: '480p' }
        ];

        function el(tag, cls, html) {
            var n = document.createElement(tag);
            if (cls) { n.className = cls; }
            if (html !== undefined) { n.innerHTML = html; }
            return n;
        }

        /* --- 5초 스킵 버튼 : 재생 버튼 뒤에 --- */
        function seekBtn(cls, icon, label) {
            var b = el('button', 'watch__ctrl watch__seek ' + cls, icon);
            b.type = 'button';
            b.setAttribute('aria-label', label);
            var num = el('span', 'watch__seek-num', String(SKIP));
            b.appendChild(num);
            return b;
        }
        function skip(delta) {
            if (!isFinite(video.duration)) { return; }
            var t = video.currentTime + delta;
            video.currentTime = Math.min(Math.max(t, 0), video.duration);
            if (hooks && hooks.onActivity) { hooks.onActivity(); }
        }

        var playBtn = bar.querySelector('.watch__ctrl--play');
        if (!isLive && playBtn) {
            var back = seekBtn('js-watch-back', ICON.back, SKIP + '초 뒤로');
            var fwd = seekBtn('js-watch-fwd', ICON.fwd, SKIP + '초 앞으로');
            back.addEventListener('click', function () { skip(-SKIP); });
            fwd.addEventListener('click', function () { skip(SKIP); });
            // 배치 : 재생 · 볼륨 · 시간 다음(시간 오른쪽)에 스킵 두 개
            var timeAnchor = bar.querySelector('.watch__time') || playBtn;
            timeAnchor.insertAdjacentElement('afterend', fwd);
            timeAnchor.insertAdjacentElement('afterend', back);
        }

        /* --- 메뉴(속도/화질) --- */
        function buildMenu(opts) {
            var box = el('div', 'watch__menu');
            var btn = el('button', 'watch__ctrl watch__menu-btn');
            btn.type = 'button';
            btn.setAttribute('aria-haspopup', 'true');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', opts.title);
            if (opts.icon) { btn.innerHTML = opts.icon; }
            var val = el('span', 'watch__menu-val', opts.initialLabel);
            btn.appendChild(val);

            var pop = el('div', 'watch__menu-pop');
            pop.hidden = true;
            pop.setAttribute('role', 'menu');
            pop.appendChild(el('p', 'watch__menu-title', opts.title));

            opts.items.forEach(function (it) {
                var item = el('button', 'watch__menu-item' + (it.v === opts.initial ? ' is-on' : ''));
                item.type = 'button';
                item.setAttribute('role', 'menuitemradio');
                item.setAttribute('aria-checked', String(it.v === opts.initial));
                item.setAttribute('data-val', String(it.v));
                item.appendChild(el('span', 'watch__menu-check', '<svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'));
                item.appendChild(document.createTextNode(it.t));
                item.addEventListener('click', function () {
                    Array.prototype.forEach.call(pop.querySelectorAll('.watch__menu-item'), function (o) {
                        o.classList.remove('is-on');
                        o.setAttribute('aria-checked', 'false');
                    });
                    item.classList.add('is-on');
                    item.setAttribute('aria-checked', 'true');
                    val.textContent = opts.label(it);
                    opts.onPick(it);
                    setOpen(box, false);
                    if (hooks && hooks.onActivity) { hooks.onActivity(); }
                });
                pop.appendChild(item);
            });

            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var open = box.classList.contains('is-open');
                closeAll();
                setOpen(box, !open);
            });

            box.appendChild(btn);
            box.appendChild(pop);
            return box;
        }

        function setOpen(box, open) {
            box.classList.toggle('is-open', open);
            var b = box.querySelector('.watch__menu-btn');
            var p = box.querySelector('.watch__menu-pop');
            if (b) { b.setAttribute('aria-expanded', String(open)); }
            if (p) { p.hidden = !open; }
        }
        function closeAll() {
            Array.prototype.forEach.call(wrap.querySelectorAll('.watch__menu.is-open'), function (o) { setOpen(o, false); });
        }

        var fullBtn = bar.querySelector('.watch__ctrl--full');

        /* --- 자막 켜기/끄기 ---
           <track> 이 있으면 textTracks 를 직접 제어하고, 없으면(시안) 데모 자막을 영상 위에 띄운다. */
        var ccBtn = el('button', 'watch__ctrl watch__cc js-watch-cc', ICON.ccOn + ICON.ccOff);
        ccBtn.type = 'button';
        ccBtn.setAttribute('aria-label', '자막');
        ccBtn.setAttribute('aria-pressed', 'false');

        var realTracks = [];
        try {
            realTracks = Array.prototype.filter.call(video.textTracks || [], function (t) {
                return t.kind === 'subtitles' || t.kind === 'captions';
            });
        } catch (e) { realTracks = []; }

        var ccLine = null;
        if (!realTracks.length) {
            ccLine = el('p', 'watch__cc-line js-watch-cc-line');
            ccLine.hidden = true;
            var stage = wrap.querySelector('.watch__player') || wrap;
            stage.appendChild(ccLine);
            video.addEventListener('timeupdate', function () {
                if (!ccLine || ccLine.hidden) { return; }
                var i = Math.floor((video.currentTime || 0) / 4) % DEMO_CC.length;
                if (ccLine.textContent !== DEMO_CC[i]) { ccLine.textContent = DEMO_CC[i]; }
            });
        }

        function setCc(on) {
            ccBtn.classList.toggle('is-on', on);
            ccBtn.setAttribute('aria-pressed', String(on));
            if (realTracks.length) {
                realTracks.forEach(function (t, i) { t.mode = (on && i === 0) ? 'showing' : 'disabled'; });
            } else if (ccLine) {
                ccLine.hidden = !on;
                if (on && !ccLine.textContent) { ccLine.textContent = DEMO_CC[0]; }
            }
        }
        ccBtn.addEventListener('click', function () {
            setCc(!ccBtn.classList.contains('is-on'));
            if (hooks && hooks.onActivity) { hooks.onActivity(); }
        });
        setCc(false);
        if (fullBtn) { fullBtn.insertAdjacentElement('beforebegin', ccBtn); }
        else { bar.appendChild(ccBtn); }

        if (!isLive) {
            var speedMenu = buildMenu({
                title: '재생 속도',
                initial: 1,
                initialLabel: '1x',
                items: SPEEDS,
                label: function (it) { return it.v + 'x'; },
                onPick: function (it) { video.playbackRate = it.v; }
            });
            if (fullBtn) { fullBtn.insertAdjacentElement('beforebegin', speedMenu); }
            else { bar.appendChild(speedMenu); }
        }

        var qualityMenu = buildMenu({
            title: '화질',
            initial: 'auto',
            initialLabel: '자동',
            icon: ICON.gear,
            items: QUALITIES,
            label: function (it) { return it.t; },
            // 실서비스 : 여기서 HLS/DASH 렌디션을 전환한다(시안은 단일 소스라 표시만 변경)
            onPick: function (it) { video.setAttribute('data-quality', it.v); }
        });
        if (fullBtn) { fullBtn.insertAdjacentElement('beforebegin', qualityMenu); }
        else { bar.appendChild(qualityMenu); }

        /* 자막·배속·화질·전체화면을 한 묶음으로 우측 정렬 (그룹의 첫 요소가 여백을 밀어낸다) */
        var groupFirst = bar.querySelector('.watch__cc, .watch__menu');
        if (groupFirst) { groupFirst.classList.add('watch__menu--push'); }

        /* 바깥 클릭 · Esc 로 닫기 */
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) { closeAll(); }
            else if (!e.target.closest('.watch__menu')) { closeAll(); }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeAll(); }
        });

        /* 좌우 방향키로 5초 이동 (입력 요소에 포커스가 있을 때는 제외) */
        if (!isLive) {
            document.addEventListener('keydown', function (e) {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') { return; }
                var t = e.target;
                // 입력 요소·가로 스크롤 목록에 포커스가 있으면 그쪽 키 조작을 방해하지 않는다
                if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], [data-scroll-x]')) { return; }
                e.preventDefault();
                skip(e.key === 'ArrowLeft' ? -SKIP : SKIP);
            });
        }

        return { isMenuOpen: hooks && hooks.isMenuOpen ? hooks.isMenuOpen : function () { return false; } };
    }

    /**
     * 시청 페이지 시즌 선택 드롭다운.
     * 트리거 클릭 시 시즌 목록을 펼치고, 선택하면 라벨을 갱신한다.
     * 바깥 클릭·Esc 로 닫힌다. (실제 에피소드 목록 교체는 백엔드 연동 지점)
     */
    function initWatchSeason() {
        var dropdown = document.querySelector('.watch__season-dropdown');
        if (!dropdown) { return; }

        var toggle = dropdown.querySelector('.js-season-toggle');
        var label = dropdown.querySelector('.js-season-label');
        var options = dropdown.querySelectorAll('.js-season-option');
        if (!toggle) { return; }

        function setOpen(open) {
            dropdown.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(!dropdown.classList.contains('is-open'));
        });

        Array.prototype.forEach.call(options, function (opt) {
            opt.addEventListener('click', function () {
                Array.prototype.forEach.call(options, function (o) {
                    o.classList.remove('is-selected');
                    o.setAttribute('aria-checked', 'false');
                });
                opt.classList.add('is-selected');
                opt.setAttribute('aria-checked', 'true');
                if (label) { label.textContent = opt.textContent.trim(); }
                setOpen(false);
                toggle.focus();
            });
        });

        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target)) { setOpen(false); }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });
    }

    /**
     * 플레이어 댓글 패널.
     * 레일의 댓글 버튼(.js-comments-toggle) 클릭 시 .is-comments 를 토글해
     * 패널이 오른쪽에서 슬라이드 인 되고 스테이지(영상)는 왼쪽으로 이동한다.
     * X 버튼(.js-comments-close)과 Esc 로 닫힌다.
     * 세로 피드에서 슬라이드가 바뀌면(player:slidechange) 열림 여부와 무관하게
     * 해당 영상의 댓글 목록/카운트로 전환한다.
     */
    function initPlayerComments() {
        var player = document.querySelector('.player');
        if (!player) { return; }

        // 세로 피드에서는 슬라이드마다 댓글 버튼이 있으므로 모두 공유 패널에 연결
        var toggles = player.querySelectorAll('.js-comments-toggle');
        var panel = player.querySelector('.player__comments');
        if (!toggles.length || !panel) { return; }

        var closeBtn = panel.querySelector('.js-comments-close');
        var lastToggle = toggles[0];

        function setOpen(open) {
            player.classList.toggle('is-comments', open);
            Array.prototype.forEach.call(toggles, function (t) {
                t.setAttribute('aria-expanded', String(open));
            });
            panel.setAttribute('aria-hidden', String(!open));
        }

        // 슬라이드별 댓글 목록(data-comments-for) 전환 : 활성 영상의 목록만 표시 + 카운트 갱신
        var lists = panel.querySelectorAll('[data-comments-for]');
        var countEl = panel.querySelector('.player__comments-count');

        function syncTo(slideIndex) {
            if (!lists.length) { return; }
            Array.prototype.forEach.call(lists, function (list) {
                var mine = Number(list.getAttribute('data-comments-for')) === slideIndex;
                if (mine) {
                    list.removeAttribute('hidden');
                    list.scrollTop = 0; // 새 영상 댓글은 맨 위부터
                    if (countEl) { countEl.textContent = list.getAttribute('data-count') || ''; }
                } else {
                    list.setAttribute('hidden', '');
                }
            });
        }

        player.addEventListener('player:slidechange', function (e) {
            syncTo(e.detail ? e.detail.index : 0);
        });
        syncTo(0);

        Array.prototype.forEach.call(toggles, function (toggle) {
            toggle.addEventListener('click', function () {
                lastToggle = toggle;
                setOpen(!player.classList.contains('is-comments'));
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                setOpen(false);
                lastToggle.focus();
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && player.classList.contains('is-comments')) {
                setOpen(false);
                lastToggle.focus();
            }
        });
    }

    /**
     * 쇼츠 세로 피드: 위로 드래그(스와이프/휠)하면 다음 슬라이드가 아래에서 올라오고,
     * 아래로 드래그하면 이전 슬라이드로. 활성 슬라이드의 영상만 재생한다.
     * 진행바 시킹/레일 버튼/링크/댓글 패널 위에서 시작한 제스처는 스와이프로 보지 않는다.
     * 댓글이 열려 있어도 이동 가능 — 슬라이드가 바뀌면 player:slidechange 이벤트로
     * 댓글 패널이 해당 영상의 댓글로 갱신된다(initPlayerComments).
     */
    function initPlayerFeed() {
        var feed = document.querySelector('.js-player-feed');
        if (!feed) { return; }

        var slides = feed.querySelectorAll('.player__slide');
        if (slides.length < 2) { return; } // 넘길 슬라이드가 없으면 스킵

        var player = feed.closest('.player');
        var index = 0;
        var startX = 0, startY = 0;
        var tracking = false; // 포인터 눌림
        var decided = false;  // 가로/세로 방향 판정 완료
        var swiping = false;  // 세로 스와이프 확정
        var didSwipe = false; // 직전 제스처가 스와이프였는지(클릭 차단용)
        var height = 0;
        var IGNORE = '.player__progress, .player__rail, .player__mute, .player__play, .player__comments, button, a, input, textarea';

        function setActive(i) {
            Array.prototype.forEach.call(slides, function (slide, si) {
                slide.classList.toggle('is-active', si === i);
                var v = slide.querySelector('.js-player-video');
                if (!v) { return; }
                if (si === i) {
                    var p = v.play();
                    if (p && p.catch) { p.catch(function () { /* 자동재생 거부 무시 */ }); }
                } else {
                    v.pause();
                }
            });
        }

        function goTo(i) {
            var next = Math.max(0, Math.min(slides.length - 1, i));
            var changed = next !== index;
            index = next;
            feed.style.transform = 'translateY(' + (-index * 100) + '%)';
            setActive(index);
            // 댓글 패널 등 외부 UI 가 활성 슬라이드를 따라가도록 알림
            if (changed && player) {
                player.dispatchEvent(new CustomEvent('player:slidechange', { detail: { index: index } }));
            }
        }

        function onDown(e) {
            // 새 포인터 시작 시 직전 스와이프 잔여 플래그를 즉시 해제한다.
            // (버튼/링크 등 IGNORE 대상은 아래에서 조기 return 하므로 여기서 먼저 리셋해야
            //  스와이프 직후의 버튼 탭 클릭이 잘못 차단되지 않는다.)
            didSwipe = false;
            if (e.pointerType === 'mouse' && e.button !== 0) { return; }
            if (e.target.closest(IGNORE)) { return; }
            startX = e.clientX; startY = e.clientY;
            tracking = true; decided = false; swiping = false;
            height = feed.getBoundingClientRect().height;
        }

        function onMove(e) {
            if (!tracking) { return; }
            var dx = e.clientX - startX;
            var dy = e.clientY - startY;
            if (!decided) {
                if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { return; } // 방향 미확정
                decided = true;
                if (Math.abs(dx) > Math.abs(dy)) { tracking = false; return; } // 가로 제스처 → 스와이프 취소
                swiping = true;
                feed.classList.add('is-dragging');
            }
            if (!swiping) { return; }
            // 첫/마지막 슬라이드 경계에서는 고무줄 저항
            var delta = dy;
            if ((index === 0 && dy > 0) || (index === slides.length - 1 && dy < 0)) {
                delta = dy * 0.35;
            }
            didSwipe = true;
            feed.style.transform = 'translateY(calc(' + (-index * 100) + '% + ' + delta + 'px))';
            if (e.cancelable) { e.preventDefault(); }
        }

        function onUp(e) {
            if (!tracking) { return; }
            tracking = false;
            feed.classList.remove('is-dragging');
            if (!swiping) { return; }
            swiping = false;
            var moved = e.clientY - startY;
            var threshold = Math.min(90, height * 0.12);   /* 스와이프 인식 거리 완화(더 쉽게 전환) */
            if (moved <= -threshold && index < slides.length - 1) { goTo(index + 1); }
            else if (moved >= threshold && index > 0) { goTo(index - 1); }
            else { goTo(index); } // 스냅백
        }

        feed.addEventListener('pointerdown', onDown);
        feed.addEventListener('pointermove', onMove);
        feed.addEventListener('pointerup', onUp);
        feed.addEventListener('pointercancel', function () {
            tracking = false; swiping = false;
            feed.classList.remove('is-dragging');
            goTo(index);
        });

        // 스와이프 직후 발생하는 click(재생 토글) 차단
        feed.addEventListener('click', function (e) {
            if (didSwipe) {
                e.stopPropagation();
                e.preventDefault();
                didSwipe = false;
            }
        }, true);

        // 데스크톱 휠로도 이동 (연속 입력 쿨다운) — 댓글 패널 위 휠은 피드 밖이라 목록 스크롤 유지
        var wheelLock = false;
        feed.addEventListener('wheel', function (e) {
            if (Math.abs(e.deltaY) < 20) { return; }
            e.preventDefault();
            if (wheelLock) { return; }
            wheelLock = true;
            setTimeout(function () { wheelLock = false; }, 550);
            if (e.deltaY > 0) { goTo(index + 1); } else { goTo(index - 1); }
        }, { passive: false });

        goTo(0);
    }

    /**
     * 상단 배너(세로 포스터 캐러셀) 좌/우 화살표.
     * 드래그 스크롤(data-scroll-x)은 공통 로직이 처리하므로, 여기서는
     * 화살표 클릭 시 카드 폭+간격만큼 부드럽게 좌/우로 스크롤한다.
     */
    function initPosterBanner() {
        var banners = document.querySelectorAll('.poster-banner');
        if (!banners.length) { return; }

        Array.prototype.forEach.call(banners, function (banner) {
            var track = banner.querySelector('[data-banner-track]');
            var prev = banner.querySelector('[data-banner-prev]');
            var next = banner.querySelector('[data-banner-next]');
            if (!track) { return; }

            function step() {
                var card = track.querySelector('.poster-banner__card');
                // 카드 폭 + gap(34px). 카드가 없으면 뷰포트의 80%.
                return card ? card.getBoundingClientRect().width + 34 : track.clientWidth * 0.8;
            }

            function scrollByCards(dir) {
                track.scrollBy({ left: dir * step(), behavior: 'smooth' });
            }

            if (prev) { prev.addEventListener('click', function () { scrollByCards(-1); }); }
            if (next) { next.addEventListener('click', function () { scrollByCards(1); }); }

            // 스크롤 위치에 따라 화살표 흐림 + 비활성화(맨 끝이면 반투명 · disabled 로 키보드/보조기술에도 노출)
            function syncNav() {
                var max = track.scrollWidth - track.clientWidth - 1;
                var atStart = track.scrollLeft <= 0;
                var atEnd = track.scrollLeft >= max;
                if (prev) { prev.classList.toggle('is-end', atStart); prev.disabled = atStart; }
                if (next) { next.classList.toggle('is-end', atEnd); next.disabled = atEnd; }
            }
            track.addEventListener('scroll', syncNav, { passive: true });
            window.addEventListener('resize', syncNav);
            syncNav();
        });
    }

    /**
     * 고정 GNB: 페이지를 조금이라도 내리면 .is-scrolled 를 붙여
     * 투명 헤더 -> 프로스티드 글래스 배경으로 전환한다.
     * 또한 조금 더 내리면 .is-collapsed 를 붙여, 모바일에서 로고 행을 접고
     * 카테고리 메뉴만 상단에 고정으로 남긴다(CSS ≤767 에서만 로고 숨김 적용).
     */
    function initStickyGnb() {
        var gnb = document.querySelector('.gnb');
        if (!gnb) { return; }

        // 히어로가 첫 콘텐츠인 페이지에서 히어로가 고정 헤더 뒤로 가려지지 않도록,
        // 헤더의 실제(펼친) 높이를 CSS 변수 --gnb-h 로 노출한다. 브레이크포인트마다
        // 내비 줄바꿈으로 헤더 높이가 달라지므로 로드·리사이즈·폰트로드 시 재계산한다.
        function syncGnbHeight() {
            var collapsed = gnb.classList.contains('is-collapsed');
            if (collapsed) { gnb.classList.remove('is-collapsed'); }
            document.documentElement.style.setProperty('--gnb-h', gnb.offsetHeight + 'px');
            if (collapsed) { gnb.classList.add('is-collapsed'); }
        }
        syncGnbHeight();
        window.addEventListener('resize', syncGnbHeight);
        if (document.fonts && document.fonts.ready) { document.fonts.ready.then(syncGnbHeight); }

        // 쇼츠 플레이어: 문서 스크롤이 잠겨 있으므로 헤더를 항상 접힘(탭메뉴만) + 프로스티드 배경으로 고정
        if (document.body.classList.contains('page-player')) {
            gnb.classList.add('is-scrolled', 'is-collapsed');
            return;
        }

        var THRESHOLD = 8;   // px : 프로스티드 배경 전환
        var COLLAPSE = 46;   // px : 로고 행 접힘(모바일)
        var isScrolled = false;
        var isCollapsed = false;

        // class 토글은 상태가 바뀔 때만 수행 (스크롤마다 DOM 변경 방지)
        function update() {
            var y = window.pageYOffset;
            var s = y > THRESHOLD;
            if (s !== isScrolled) { isScrolled = s; gnb.classList.toggle('is-scrolled', s); }
            var c = y > COLLAPSE;
            if (c !== isCollapsed) { isCollapsed = c; gnb.classList.toggle('is-collapsed', c); }
        }

        window.addEventListener('scroll', update, { passive: true });
        update(); // 새로고침 시 스크롤 위치 반영
    }

    /**
     * 레일 '전체보기' 노출 제어.
     * 콘텐츠가 가로로 넘쳐 실제로 스크롤되는 레일에만 '전체보기'를 보여준다.
     * 크리에이터(VIBUZZ TOP6)·재생목록처럼 한 줄에 다 들어와 "중간에 끝나는" 레일은
     * 더 볼 것이 없으므로 숨긴다. 뷰포트가 바뀌면(리사이즈) 다시 판정한다.
     */
    function initRailMoreVisibility() {
        var heads = document.querySelectorAll('.section__head');
        if (!heads.length) { return; }
        function update() {
            heads.forEach(function (head) {
                var more = head.querySelector('.section__more');
                if (!more) { return; }
                var sec = head.closest('.section') || head.parentElement;
                var scroll = sec ? sec.querySelector('.scroll-x') : null;
                var scrollable = scroll && (scroll.scrollWidth - scroll.clientWidth > 8);
                more.hidden = !scrollable;
            });
        }
        update();
        window.addEventListener('resize', update);
        if (document.fonts && document.fonts.ready) { document.fonts.ready.then(update); }
    }

    /**
     * 더보기 목록 페이지(preview-list.html): ?t= 쿼리의 타이틀을 제목/문서제목에 반영.
     */
    function initListPageTitle() {
        var titleEl = document.getElementById('listTitle');
        if (!titleEl) { return; }
        var t = '';
        try {
            var params = new URLSearchParams(location.search);
            t = params.get('t') || '';
        } catch (e) {
            var m = location.search.match(/[?&]t=([^&]*)/);
            t = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
        }
        t = (t || '').trim();
        if (t) {
            titleEl.textContent = t;
            document.title = t + ' · VIBUZZ';
        }
    }

    /**
     * 관심(찜) 타이틀 등록 — Wavve 식.
     * 포스터 카드 썸네일에 하트 버튼을 주입해 타이틀 단위로 관심 등록/해제한다.
     * 상태는 localStorage('vibuzz-fav')에 타이틀 배열로 저장해 새로고침·페이지이동 후에도 유지.
     * 상세페이지의 '저장' 버튼도 같은 관심 토글로 연결한다.
     */
    function initFavorites() {
        var KEY = 'vibuzz-fav';
        function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
        function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* 무시 */ } }
        var favs = load();
        function isFav(t) { return favs.indexOf(t) !== -1; }
        function toggle(t) {
            var i = favs.indexOf(t);
            if (i === -1) { favs.push(t); } else { favs.splice(i, 1); }
            save(favs);
            return i === -1; // 새로 등록되면 true
        }

        var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3l-1.1-1C6.1 15 3 12.1 3 8.6 3 6 5 4 7.5 4c1.5 0 2.9.7 3.8 1.9L12 7l.7-1.1C13.6 4.7 15 4 16.5 4 19 4 21 6 21 8.6c0 3.5-3.1 6.4-7.9 10.7l-1.1 1z"/></svg>';

        // 토스트
        var toastEl = null, toastTimer = null;
        function toast(msg) {
            if (!toastEl) {
                toastEl = document.createElement('div');
                toastEl.className = 'fav-toast';
                document.body.appendChild(toastEl);
            }
            toastEl.textContent = msg;
            toastEl.classList.add('is-show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 1600);
        }

        // 포스터 카드에 하트 버튼 주입
        document.querySelectorAll('.poster-card').forEach(function (card) {
            var thumb = card.querySelector('.poster-card__thumb');
            var titleEl = card.querySelector('.poster-card__title');
            if (!thumb || !titleEl || card.querySelector('.poster-card__fav')) { return; }
            var title = titleEl.textContent.trim();
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'poster-card__fav' + (isFav(title) ? ' is-active' : '');
            btn.setAttribute('aria-label', '관심 등록');
            btn.setAttribute('aria-pressed', isFav(title) ? 'true' : 'false');
            btn.innerHTML = HEART;
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation(); // 카드 링크 이동 방지
                var added = toggle(title);
                btn.classList.toggle('is-active', added);
                btn.setAttribute('aria-pressed', added ? 'true' : 'false');
                toast(added ? '관심 등록됨' : '관심 해제됨');
            });
            thumb.appendChild(btn);
        });

        // 상세페이지 '저장' 버튼 → 관심 토글
        var saveBtn = null;
        document.querySelectorAll('.btn--icon').forEach(function (b) {
            if (/저장/.test(b.textContent)) { saveBtn = b; }
        });
        if (saveBtn) {
            // 상세 콘텐츠 제목 (GNB 로고 h1 을 잡지 않도록 hero__title/detail__title 우선)
            var dTitleEl = document.querySelector('.hero--detail .hero__title, .detail__title, #content .hero__title');
            var dTitle = dTitleEl ? dTitleEl.textContent.trim() : (document.title.split('·')[0] || '').trim();
            var label = saveBtn.childNodes[0];
            function syncSave() {
                var on = isFav(dTitle);
                saveBtn.classList.toggle('is-fav', on);
                saveBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
                if (label && label.nodeType === 3) { label.nodeValue = on ? '관심 등록됨' : '저장'; }
            }
            syncSave();
            saveBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var added = toggle(dTitle);
                syncSave();
                toast(added ? '관심 등록됨' : '관심 해제됨');
            });
        }
    }

    /**
     * 댓글 더보기(⋮) 메뉴.
     * ⋮ 버튼 클릭 시 해당 댓글의 옵션 메뉴를 토글한다. 메뉴 항목 노출은
     * CSS 가 .is-mine(내 댓글) 기준으로 제어한다(내 댓글=수정·삭제, 타인=신고하기).
     * 한 번에 하나만 열리며 바깥 클릭·Esc 로 닫힌다.
     * 실제 수정/삭제/신고 동작은 백엔드 연동 지점이다.
     */
    function initCommentMenu() {
        var buttons = document.querySelectorAll('.js-comment-more');
        if (!buttons.length) { return; }

        function closeAll(except) {
            Array.prototype.forEach.call(buttons, function (btn) {
                var comment = btn.closest('.comment');
                if (!comment || comment === except) { return; }
                comment.classList.remove('is-menu-open');
                btn.setAttribute('aria-expanded', 'false');
            });
        }

        Array.prototype.forEach.call(buttons, function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var comment = btn.closest('.comment');
                if (!comment) { return; }
                var willOpen = !comment.classList.contains('is-menu-open');
                closeAll(comment);
                comment.classList.toggle('is-menu-open', willOpen);
                btn.setAttribute('aria-expanded', String(willOpen));
            });
        });

        // 메뉴 항목 선택 : 시안에서는 닫기만 (실제 동작은 백엔드 연동)
        Array.prototype.forEach.call(document.querySelectorAll('.comment__menu-item'), function (item) {
            item.addEventListener('click', function () { closeAll(null); });
        });

        // 바깥 클릭 / Esc 로 닫기
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.comment__menu, .js-comment-more')) { closeAll(null); }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeAll(null); }
        });
    }

    /**
     * 댓글 답글 작성 폼 (watch·player 공통).
     * 댓글의 "답글" 버튼 클릭 시 해당 댓글 아래에 대댓글 라인에 맞춘 인라인 폼
     * (내 아바타 + 입력박스 + 취소/댓글)을 삽입한다. 한 번에 하나만 열리고,
     * 취소/Esc 로 닫히며, 등록 시 데모용 답글(.comment--reply)을 그 자리에 추가한다.
     * 실서비스에서는 등록 핸들러를 댓글 API 호출로 교체하면 된다.
     */
    function initCommentReply() {
        var openForm = null;   // 현재 열린 폼
        var originBtn = null;  // 폼을 연 답글 버튼 (포커스 복원용)

        function myAvatarSrc() {
            var img = document.querySelector('.watch__comment-form .comment__avatar img, .player__comments-form .comment__avatar img');
            return img ? img.getAttribute('src') : 'images/common/default_icon.png';
        }

        function closeForm(restoreFocus) {
            if (!openForm) { return; }
            var btn = originBtn;
            if (openForm.parentNode) { openForm.parentNode.removeChild(openForm); }
            openForm = null; originBtn = null;
            if (restoreFocus && btn) { btn.focus(); }
        }

        function buildForm() {
            var item = document.createElement('li');
            item.className = 'comment-reply-form';
            item.innerHTML =
                '<span class="comment__avatar"><img src="' + myAvatarSrc() + '" alt=""></span>' +
                '<div class="comment-reply-form__box">' +
                    '<textarea class="comment-reply-form__input" placeholder="답글 추가..." aria-label="답글 입력"></textarea>' +
                    '<div class="comment-reply-form__actions">' +
                        '<button type="button" class="player__comments-cancel js-reply-cancel">취소</button>' +
                        '<button type="button" class="player__comments-submit js-reply-submit">댓글</button>' +
                    '</div>' +
                '</div>';
            return item;
        }

        /* 데모 답글 항목 생성 : 사용자 입력은 textContent 로만 주입 */
        function buildReply(text, deep) {
            var item = document.createElement('li');
            item.className = 'comment comment--reply' + (deep ? ' comment--reply-2' : '');
            var avatar = document.createElement('span');
            avatar.className = 'comment__avatar';
            var img = document.createElement('img');
            img.src = myAvatarSrc(); img.alt = '';
            avatar.appendChild(img);
            var body = document.createElement('div');
            body.className = 'comment__body';
            var meta = document.createElement('div');
            meta.className = 'comment__meta';
            meta.innerHTML = '<span class="comment__name">synergy_on</span><span class="comment__date">2026.07.23</span>';
            var p = document.createElement('p');
            p.className = 'comment__text';
            p.textContent = text;
            var actions = document.createElement('div');
            actions.className = 'comment__actions';
            actions.innerHTML = '<button type="button"><img src="' + (document.querySelector('.comment__actions img') ? document.querySelector('.comment__actions img').getAttribute('src') : 'images/player/ic_heart.svg') + '" alt="">좋아요</button><button type="button">답글</button>';
            body.appendChild(meta); body.appendChild(p); body.appendChild(actions);
            item.appendChild(avatar); item.appendChild(body);
            return item;
        }

        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.comment__actions button');

            // 답글 버튼 → 폼 토글
            if (btn && btn.textContent.replace(/\s/g, '') === '답글') {
                var comment = btn.closest('.comment');
                if (!comment) { return; }
                var reopen = !(openForm && openForm.previousElementSibling === comment);
                closeForm(false);
                if (reopen) {
                    openForm = buildForm();
                    originBtn = btn;
                    // 대댓글(.comment--reply)에 답글이면 폼을 한 단계 더 안쪽으로 (depth 정리)
                    if (comment.classList.contains('comment--reply')) {
                        openForm.classList.add('comment-reply-form--nested');
                    }
                    comment.insertAdjacentElement('afterend', openForm);
                    openForm.querySelector('.comment-reply-form__input').focus();
                }
                return;
            }

            if (!openForm) { return; }

            // 취소 / 등록
            if (e.target.closest('.js-reply-cancel') && openForm.contains(e.target)) {
                closeForm(true);
            } else if (e.target.closest('.js-reply-submit') && openForm.contains(e.target)) {
                var input = openForm.querySelector('.comment-reply-form__input');
                var text = input.value.trim();
                if (!text) { input.focus(); return; }
                var deep = openForm.classList.contains('comment-reply-form--nested');
                openForm.insertAdjacentElement('beforebegin', buildReply(text, deep));
                closeForm(false);
            }
        });

        // Esc : 답글 폼만 닫기 (캡처 단계에서 먼저 처리해 댓글 패널 닫힘과 겹치지 않게)
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && openForm) {
                e.stopPropagation();
                closeForm(true);
            }
        }, true);
    }

    /*
     * 로그인 상태 데모.
     * - 프로필 클릭 시 상태별 메뉴(비로그인=로그인 유도 / 로그인=유저 메뉴) 표시
     * - 우측 하단 토글로 로그인/비로그인 전환 + 현재 상태 상시 표시 (localStorage 유지)
     * 실서비스에서는 서버 인증 상태로 body.is-authed 를 정하고 이 토글은 제거하면 된다.
     */
    function initAuthDemo() {
        var KEY = 'vibuzz-demo-auth';
        var body = document.body;
        var wrap = document.querySelector('.gnb__profile-wrap');

        var ICON = {
            user: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
            swap: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 8.5h13m0 0-3.2-3.2M20 8.5l-3.2 3.2M17 15.5H4m0 0 3.2-3.2M4 15.5l3.2 3.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            help: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M9.6 9.4a2.4 2.4 0 1 1 3.4 2.2c-.7.35-1 .85-1 1.5v.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1" fill="currentColor"/></svg>',
            logout: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9 8.5 5.5 12 9 15.5M5.5 12H16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            adult: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V6l7-3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 11.5l2 2 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            premium: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8l3.7 2.7L12 5l4.3 5.7L20 8l-1.4 9.5H5.4L4 8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
        };

        // 아바타 경로 (프리뷰=상대경로, 블레이드=asset() 절대경로 모두 대응)
        var avatarImg = wrap ? wrap.querySelector('.gnb__profile img') : null;
        var guestSrc = '', duckSrc = '';
        if (avatarImg) {
            var cur = avatarImg.getAttribute('src') || '';
            var i = cur.indexOf('images/');
            var base = i >= 0 ? cur.slice(0, i) : '';
            guestSrc = base + 'images/common/default_icon.png';
            duckSrc = base + 'images/common/avatar_user.jpg';
        }

        // 마이페이지 링크 : 통합 대시보드(회원정보+허브). 프리뷰 파일명은 기존 사이드바 링크와 맞춰 preview-favorites.html
        var mypageUrl = /\.html$/.test(location.pathname) ? 'preview-favorites.html' : '/mypage';
        var studioUrl = /\.html$/.test(location.pathname) ? 'preview-studio.html' : '/studio';
        var csUrl = /\.html$/.test(location.pathname) ? 'preview-faq.html' : '/mypage/faq'; // 고객센터 = 자주하는 질문(고객센터) 페이지
        // 크리에이터 신청 : 아직 크리에이터가 아닌 회원의 전환 진입점
        var applyUrl = /\.html$/.test(location.pathname) ? 'preview-creator-apply.html' : '/creator/apply';
        var appliedUrl = /\.html$/.test(location.pathname) ? 'preview-creator-applied.html' : '/creator/applied';
        var uploadUrl = /\.html$/.test(location.pathname) ? 'preview-upload.html' : '/upload';

        // 데모 상태 5종 : 로그인 / 성인인증 / 프리미엄 구독 / 크리에이터 신청(심사중) / 크리에이터 승인.
        // 각각 body 클래스 + localStorage 로 유지. 실서비스에선 서버가 내려주는 상태로 대체.
        var STATES = [
            { key: 'auth',    cls: 'is-authed',  on: '로그인 상태',     off: '비로그인 상태' },
            { key: 'adult',   cls: 'is-adult',   on: '성인인증 완료',   off: '성인인증 전' },
            { key: 'premium', cls: 'is-premium', on: '프리미엄 구독중', off: '프리미엄 미구독' },
            /* 크리에이터 승인 파이프라인 : 신청 → 데뷔 심사 → 승인.
               앞 단계를 밟아야 다음 단계가 되므로 누적(사다리)으로 동작한다. */
            { key: 'applied', cls: 'is-applied', on: '크리에이터 신청함',  off: '크리에이터 신청 전' },
            { key: 'debut',   cls: 'is-debut',   on: '데뷔 영상 심사중',   off: '데뷔 단계 전' },
            { key: 'creator', cls: 'is-creator', on: '크리에이터 승인됨',  off: '크리에이터 미승인' }
        ];
        var STAGE_KEYS = ['applied', 'debut', 'creator'];   /* 낮은 단계 → 높은 단계 */
        var demo = { auth: false, adult: false, premium: false, applied: false, debut: false, creator: false };
        STATES.forEach(function (s) { try { demo[s.key] = localStorage.getItem('vibuzz-demo-' + s.key) === '1'; } catch (e) {} });

        /* 저장된 값이 사다리 규칙에 어긋나면(예전 배타 방식으로 저장된 경우) 읽을 때 바로잡는다 */
        (function normalizeStages() {
            var top = -1;
            STAGE_KEYS.forEach(function (k, i) { if (demo[k]) { top = i; } });
            STAGE_KEYS.forEach(function (k, i) {
                var want = i <= top;
                if (demo[k] === want) { return; }
                demo[k] = want;
                try { localStorage.setItem('vibuzz-demo-' + k, want ? '1' : '0'); } catch (e) { /* 무시 */ }
            });
        }());

        function demoRowHtml(s) {
            return '<div class="gnb__demo-row" data-demo="' + s.key + '">' +
                    '<span class="gnb__demo-info"><span class="authbar__dot"></span><span class="gnb__demo-state js-demo-label">' + (demo[s.key] ? s.on : s.off) + '</span></span>' +
                    '<button type="button" class="authbar__toggle js-demo-toggle" data-demo="' + s.key + '" role="switch" aria-checked="' + demo[s.key] + '" aria-label="' + s.on + ' 전환"><span class="authbar__knob"></span></button>' +
                '</div>';
        }
        // 로그인 후 메뉴 : 4종 토글 그룹 / 게스트 팝업 : 로그인 토글만
        var groupHtml = '<div class="gnb__demo-group">' + STATES.map(demoRowHtml).join('') + '</div>';
        var loginGroupHtml = '<div class="gnb__demo-group">' + demoRowHtml(STATES[0]) + '</div>';

        // 로그인 후 유저 메뉴 주입 (마이페이지·크리에이터 스튜디오·고객센터·로그아웃 + 데모 상태 토글 3종)
        if (wrap && !wrap.querySelector('.gnb__usermenu')) {
            var menu = document.createElement('div');
            menu.className = 'gnb__usermenu';
            menu.setAttribute('role', 'menu');
            menu.setAttribute('aria-label', '계정 메뉴');
            menu.innerHTML =
                '<div class="gnb__usermenu-head">' +
                    '<img class="gnb__usermenu-avatar" src="' + duckSrc + '" alt="">' +
                    '<div class="gnb__usermenu-id"><strong class="gnb__usermenu-name">synergy kim</strong><span class="gnb__usermenu-plan js-plan-label">Free</span></div>' +
                '</div>' +
                '<ul class="gnb__usermenu-list">' +
                    '<li><a href="' + mypageUrl + '" class="gnb__usermenu-item" role="menuitem">' + ICON.user + '마이페이지</a></li>' +
                    // 크리에이터 승인 여부에 따라 둘 중 하나만 노출 (CSS : body.is-creator)
                    '<li class="js-creator-only"><a href="' + studioUrl + '" class="gnb__usermenu-item" role="menuitem">' + ICON.swap + '크리에이터 스튜디오</a></li>' +
                    '<li class="js-applied-only"><a href="' + appliedUrl + '" class="gnb__usermenu-item" role="menuitem">' + ICON.swap + '신청 진행 상황</a></li>' +
                    '<li class="js-noncreator-only"><a href="' + applyUrl + '" class="gnb__usermenu-item" role="menuitem">' + ICON.swap + '크리에이터 신청</a></li>' +
                    '<li><a href="' + csUrl + '" class="gnb__usermenu-item" role="menuitem">' + ICON.help + '고객센터</a></li>' +
                    '<li><button type="button" class="gnb__usermenu-item js-demo-logout" role="menuitem">' + ICON.logout + '로그아웃</button></li>' +
                '</ul>' +
                groupHtml;
            wrap.appendChild(menu);
        }

        // 비로그인 팝업(게스트)에도 로그인 토글 주입 → 로그인 전환 가능
        var pop = wrap ? wrap.querySelector('.gnb__profile-pop') : null;
        if (pop && !pop.querySelector('.gnb__demo-group')) {
            pop.insertAdjacentHTML('beforeend', loginGroupHtml);
        }

        /*
         * 크리에이터 진입점 전환.
         * 신청 전 : GNB "크리에이터 신청하기" · 모바일 독 "신청" → 신청 페이지
         * 승인 후 : GNB "업로드 +" · 모바일 독 "업로드" → 업로드 페이지
         * 실서비스에서는 서버가 내려주는 크리에이터 승인 상태로 판정한다.
         */
        function syncCreatorEntry() {
            /* 승인됨 > 데뷔(승인중) > 승인 대기 > 신청 전 순으로 판정한다.
               데뷔 단계는 영상을 올려야 하는 시기이므로 업로드 진입점을 그대로 연다. */
            var stage = (demo.creator || demo.debut) ? 'creator' : (demo.applied ? 'applied' : 'none');
            var TEXT = { creator: '업로드 +', applied: '신청 진행 상황', none: '크리에이터 신청하기' };
            var DOCK = { creator: '업로드', applied: '진행 상황', none: '신청' };
            var URL = { creator: uploadUrl, applied: appliedUrl, none: applyUrl };

            Array.prototype.forEach.call(document.querySelectorAll('.gnb__upload'), function (a) {
                a.textContent = TEXT[stage];
                a.setAttribute('href', URL[stage]);
                a.classList.toggle('gnb__upload--apply', stage !== 'creator');
            });
            var dockUp = document.querySelector('.mobile-dock__item[data-dock="upload"]');
            if (dockUp) {
                dockUp.setAttribute('href', URL[stage]);
                var lbl = dockUp.querySelector('.mobile-dock__label');
                if (lbl) { lbl.textContent = DOCK[stage]; }
            }
        }

        function apply() {
            STATES.forEach(function (s) {
                var on = demo[s.key];
                body.classList.toggle(s.cls, on);
                Array.prototype.forEach.call(document.querySelectorAll('.gnb__demo-row[data-demo="' + s.key + '"]'), function (row) {
                    row.classList.toggle('is-on', on);
                    var lbl = row.querySelector('.js-demo-label');
                    if (lbl) { lbl.textContent = on ? s.on : s.off; }
                    var tog = row.querySelector('.js-demo-toggle');
                    if (tog) { tog.setAttribute('aria-checked', String(on)); }
                });
            });
            if (avatarImg) { avatarImg.setAttribute('src', demo.auth ? duckSrc : guestSrc); }
            syncCreatorEntry();
            // 프리미엄 상태를 메뉴 헤드 플랜 라벨에 반영 (구독중=Premium / 해지 예약 / 미구독=Free)
            syncPlanLabels();
            syncPremiumEntries();
        }
        apply();

        function setState(key, val) {
            demo[key] = val;
            try { localStorage.setItem('vibuzz-demo-' + key, val ? '1' : '0'); } catch (e) {}
            /* 구독을 직접 켜고 끄면 해지 예약은 의미가 없으므로 함께 초기화 */
            if (key === 'premium') { setPremCancel(false); }
            /* 승인 단계는 누적 : 켜면 앞 단계도 함께 켜고(신청 없이 심사중일 수 없다),
               끄면 뒤 단계는 함께 끈다(신청 전으로 돌아가면 심사·승인도 무효). */
            var idx = STAGE_KEYS.indexOf(key);
            if (idx >= 0) {
                STAGE_KEYS.forEach(function (k, i) {
                    if (i === idx) { return; }
                    var next = val ? (i < idx ? true : demo[k]) : (i > idx ? false : demo[k]);
                    if (demo[k] === next) { return; }
                    demo[k] = next;
                    try { localStorage.setItem('vibuzz-demo-' + k, next ? '1' : '0'); } catch (e) { /* 무시 */ }
                });
            }
            apply(); // 메뉴는 열린 채로 두어 상태 전환을 바로 확인
        }

        // 데모 토글 클릭 → 해당 상태 전환. 메뉴 바깥클릭 닫힘과 겹치지 않게 정지.
        document.addEventListener('click', function (e) {
            var t = e.target.closest('.js-demo-toggle');
            if (t) { e.preventDefault(); e.stopPropagation(); var k = t.getAttribute('data-demo'); setState(k, !demo[k]); }
        });

        // 프로필 아바타 클릭 → 상태별 메뉴 열기/닫기
        if (wrap) {
            var avatarBtn = wrap.querySelector('.gnb__profile');
            if (avatarBtn) {
                avatarBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrap.classList.toggle('is-open');
                });
            }
            // 로그아웃(유저 메뉴) → 비로그인으로 전환 (데모)
            document.addEventListener('click', function (e) {
                if (e.target.closest('.js-demo-logout')) { e.preventDefault(); setState('auth', false); }
            });
            // 바깥 클릭 / Esc 로 닫기
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.gnb__profile-wrap')) { wrap.classList.remove('is-open'); }
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') { wrap.classList.remove('is-open'); }
            });
        }
    }

    /* 자주하는 질문 아코디언 : 질문 클릭 시 해당 항목 펼치기/접기 */
    function initFaq() {
        var toggles = document.querySelectorAll('.js-faq-toggle');
        if (!toggles.length) { return; }
        Array.prototype.forEach.call(toggles, function (btn) {
            btn.addEventListener('click', function () {
                var item = btn.closest('.faq__item');
                if (!item) { return; }
                var willOpen = !item.classList.contains('is-open');
                item.classList.toggle('is-open', willOpen);
                btn.setAttribute('aria-expanded', String(willOpen));
            });
        });
    }

    /**
     * 프로필 이미지 변경 팝업 (마이페이지 아바타 우하단 기어 배지 클릭).
     * 사진 변경 = 파일 선택 시 즉시 반영 후 닫힘 / 사진 삭제 = 기본 프로필 이미지로 즉시 변경 후 닫힘 (완료·취소 없음).
     * 정적 데모라 FileReader 로 클라이언트 미리보기만; 실서비스에선 업로드 API 로 교체.
     */
    function initAvatarModal() {
        var modal = document.getElementById('modal-avatar');
        var gear = document.querySelector('.mypage__avatar-gear');
        if (!modal || !gear) { return; }

        var pageAvatar = document.querySelector('.mypage__avatar');
        var preview = modal.querySelector('.js-avatar-preview');
        var fileInput = modal.querySelector('.js-avatar-file');

        // 기본 프로필 이미지 경로 (프리뷰=상대경로 / 블레이드=asset() 절대경로 모두 대응)
        var cur = pageAvatar ? (pageAvatar.getAttribute('src') || '') : '';
        var i = cur.indexOf('images/');
        var defaultSrc = (i >= 0 ? cur.slice(0, i) : '') + 'images/common/default_icon.png';

        function open() {
            if (pageAvatar) { preview.src = pageAvatar.getAttribute('src'); } // 현재 이미지로 표시
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
        function close() { modal.classList.remove('is-open'); document.body.style.overflow = ''; }

        gear.addEventListener('click', open);
        modal.querySelector('.js-avatar-close').addEventListener('click', close);
        modal.addEventListener('click', function (e) { if (e.target === modal) { close(); } });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) { close(); }
        });

        // 사진 변경 → 파일 선택 → 선택 즉시 페이지 아바타 반영 + 팝업 닫힘
        modal.querySelector('.js-avatar-change').addEventListener('click', function () { fileInput.click(); });
        fileInput.addEventListener('change', function () {
            var f = fileInput.files && fileInput.files[0];
            if (!f) { return; }
            var reader = new FileReader();
            reader.onload = function (ev) {
                if (pageAvatar) { pageAvatar.src = ev.target.result; }
                fileInput.value = '';
                close();
            };
            reader.readAsDataURL(f);
        });
        // 사진 삭제 → 기본 프로필 이미지로 즉시 변경 + 팝업 닫힘
        modal.querySelector('.js-avatar-delete').addEventListener('click', function () {
            if (pageAvatar) { pageAvatar.src = defaultSrc; }
            fileInput.value = '';
            close();
        });
    }

    /**
     * 마이페이지 사이드바 "크리에이터 스튜디오" 아코디언 토글.
     * 부모 버튼 클릭 시 서브메뉴(내 채널 관리 / 콘텐츠 관리 / 수익 관리 / 댓글 관리)를 펼치고 접는다.
     */
    function initMypageStudioNav() {
        var toggles = document.querySelectorAll('.js-studio-toggle');
        if (!toggles.length) { return; }
        Array.prototype.forEach.call(toggles, function (btn) {
            btn.addEventListener('click', function () {
                var group = btn.closest('.mypage__side-group');
                if (!group) { return; }
                var willOpen = !group.classList.contains('is-open');
                group.classList.toggle('is-open', willOpen);
                btn.setAttribute('aria-expanded', String(willOpen));
            });
        });
    }

    /*
     * 마이페이지 하위 페이지(스튜디오·즐겨찾기·고객센터·문의 등)의 "전단계로 가기" 버튼.
     * 모바일에선 상단 사이드바 메뉴를 숨기고(CSS) 이 버튼만 노출한다(표시 제어는 CSS ≤767).
     * 라이브러리(마이페이지 홈, .mypage--library)는 제외 — 그 자체가 메뉴 허브이므로.
     * authbar/독바와 동일하게 JS 주입 → 블레이드·프리뷰 모두 자동 적용.
     */
    /*
     * AI 툴 도감(목록·상세)의 로고 채우기.
     * 마크업은 <span data-ai-logo="Runway"></span> 형태로만 두고, 실제 로고는 여기서 주입한다.
     * (업로드 팝업과 동일한 AI_TOOL_LOGOS 사용 — 로고 미확보 툴은 첫 글자 모노그램)
     */
    function initAiToolLogos() {
        var slots = document.querySelectorAll('[data-ai-logo]');
        if (!slots.length) { return; }
        Array.prototype.forEach.call(slots, function (el) {
            var name = el.getAttribute('data-ai-logo') || '';
            var logo = AI_TOOL_LOGOS[name];
            if (logo) {
                el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + logo.p + '" fill="' + logo.c + '"/></svg>';
                return;
            }
            var m = name.replace(/[^0-9A-Za-z가-힣]/g, '');
            var h = 0;
            for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) % 360; }
            el.classList.add('is-mono');
            el.textContent = (m.charAt(0) || '?').toUpperCase();
            el.style.color = 'hsl(' + h + ', 62%, 42%)';
        });
    }

    /*
     * 크리에이터 스튜디오 > 댓글 관리 동작 (데모).
     * 숨기기 / 삭제 / 신고 무시 / 작성자 차단 / 답글 달기 / 하트 를 이벤트 위임으로 처리하고,
     * 처리 결과는 실행취소 바 + 상단 요약/탭 카운트에 즉시 반영한다.
     * 실서비스에서는 각 분기에서 API 호출 후 응답으로 상태를 갱신하면 된다.
     */
    function initStudioComments() {
        var list = document.querySelector('.js-cmt-list');
        if (!list) { return; }

        // 상단 요약 카드 · 탭 카운트 동기화 (전체 / 답글 대기 / 신고 접수)
        function counts() {
            var live = list.querySelectorAll('.cmt:not(.is-removed)');
            var waiting = 0, reported = 0;
            Array.prototype.forEach.call(live, function (c) {
                if (c.classList.contains('is-hidden')) { return; }
                if (c.getAttribute('data-type') === 'waiting') { waiting++; }
                if (c.classList.contains('cmt--reported')) { reported++; }
            });
            return { total: live.length, waiting: waiting, reported: reported };
        }
        // 데모 기준값 (표시 숫자는 큰 값이므로 증감분만 반영한다)
        var baseline = counts();
        var baseText = [];
        Array.prototype.forEach.call(document.querySelectorAll('.cmt-sum__value'), function (el) {
            baseText.push(parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0);
        });
        function syncCounts() {
            var now = counts();
            var deltas = [now.total - baseline.total, now.waiting - baseline.waiting, now.reported - baseline.reported];
            var cards = document.querySelectorAll('.cmt-sum__value');
            var tabs = document.querySelectorAll('.cmt-tab__count');
            [0, 1, 2].forEach(function (i) {
                var v = Math.max(0, baseText[i] + deltas[i]);
                if (cards[i]) { cards[i].textContent = v.toLocaleString(); }
                if (tabs[i]) { tabs[i].textContent = v.toLocaleString(); }
            });
        }

        // 처리 결과 안내 + 실행취소
        function notice(cmt, message, undo) {
            var old = cmt.querySelector('.cmt__notice');
            if (old) { old.remove(); }
            var bar = document.createElement('div');
            bar.className = 'cmt__notice';
            var txt = document.createElement('span');
            txt.textContent = message;
            bar.appendChild(txt);
            if (undo) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'cmt__undo';
                btn.textContent = '실행취소';
                btn.addEventListener('click', function () { undo(); bar.remove(); syncCounts(); });
                bar.appendChild(btn);
            }
            // .cmt 는 flex(아바타+본문) 라 직접 붙이면 본문이 짓눌린다 → 본문 안쪽에 붙인다
            (cmt.querySelector('.cmt__body') || cmt).appendChild(bar);
            syncCounts();
        }

        // 답글 폼 (하나만 열림)
        function openReplyForm(cmt) {
            var exist = cmt.querySelector('.cmt-reply-box');
            if (exist) { exist.remove(); return; }
            Array.prototype.forEach.call(list.querySelectorAll('.cmt-reply-box'), function (b) { b.remove(); });

            var box = document.createElement('div');
            box.className = 'cmt-reply-box';
            var ta = document.createElement('textarea');
            ta.className = 'cmt-reply-box__input';
            ta.placeholder = '답글을 입력하세요';
            ta.rows = 2;
            var acts = document.createElement('div');
            acts.className = 'cmt-reply-box__actions';
            var cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.className = 'cmt-act';
            cancel.textContent = '취소';
            cancel.addEventListener('click', function () { box.remove(); });
            var submit = document.createElement('button');
            submit.type = 'button';
            submit.className = 'cmt-act cmt-act--primary';
            submit.textContent = '답글 등록';
            submit.addEventListener('click', function () {
                var text = ta.value.trim();
                if (!text) { ta.focus(); return; }
                var reply = document.createElement('div');
                reply.className = 'cmt__reply';
                var head = document.createElement('div');
                head.className = 'cmt__head';
                head.innerHTML = '<strong class="cmt__user cmt__user--me">synergy_on</strong><span class="cmt__time">· 작성자</span>';
                var p = document.createElement('p');
                p.className = 'cmt__text';
                p.textContent = text;   // textContent 로 넣어 XSS 방지
                reply.appendChild(head);
                reply.appendChild(p);
                box.replaceWith(reply);
                cmt.setAttribute('data-type', 'replied');   // 답글 대기 → 답글 완료
                var replyBtn = cmt.querySelector('[data-cmt-act="reply"]');
                if (replyBtn) { replyBtn.textContent = '답글 추가'; }
                syncCounts();
            });
            acts.appendChild(cancel);
            acts.appendChild(submit);
            box.appendChild(ta);
            box.appendChild(acts);

            var body = cmt.querySelector('.cmt__body');
            body.appendChild(box);
            ta.focus();
        }

        list.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-cmt-act]');
            if (!btn) { return; }
            var cmt = btn.closest('.cmt');
            if (!cmt) { return; }
            var act = btn.getAttribute('data-cmt-act');

            if (act === 'hide') {
                var wasHidden = cmt.classList.toggle('is-hidden');
                if (wasHidden) {
                    notice(cmt, '이 댓글을 숨겼습니다. 작성자에게는 계속 보입니다.', function () { cmt.classList.remove('is-hidden'); });
                } else {
                    var n = cmt.querySelector('.cmt__notice');
                    if (n) { n.remove(); }
                    syncCounts();
                }
                return;
            }

            if (act === 'delete' || act === 'block') {
                cmt.classList.add('is-removed');
                notice(cmt, act === 'delete' ? '댓글을 삭제했습니다.' : '작성자를 차단하고 댓글을 삭제했습니다.', function () {
                    cmt.classList.remove('is-removed');
                });
                return;
            }

            if (act === 'dismiss') {
                cmt.classList.remove('cmt--reported');
                var flag = cmt.querySelector('.cmt__flag');
                if (flag) { flag.hidden = true; }
                cmt.setAttribute('data-type', 'waiting');
                btn.closest('.cmt__actions').remove();
                notice(cmt, '신고를 무시했습니다. 댓글이 정상 노출됩니다.', null);
                return;
            }

            if (act === 'reply') { openReplyForm(cmt); return; }

            if (act === 'heart') {
                var on = btn.classList.toggle('is-on');
                btn.setAttribute('aria-pressed', String(on));
                return;
            }
        });

        // 탭 : 활성 표시 + 목록 필터 (전체 / 답글 대기 / 신고됨 / 내가 남긴 댓글)
        var tabs = document.querySelectorAll('.cmt-tab');
        Array.prototype.forEach.call(tabs, function (tab, idx) {
            tab.addEventListener('click', function () {
                Array.prototype.forEach.call(tabs, function (t) {
                    t.classList.remove('is-active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('is-active');
                tab.setAttribute('aria-selected', 'true');

                var mode = ['all', 'waiting', 'reported', 'mine'][idx];
                Array.prototype.forEach.call(list.querySelectorAll('.cmt'), function (c) {
                    var type = c.getAttribute('data-type');
                    var show = mode === 'all'
                        || (mode === 'waiting' && type === 'waiting')
                        || (mode === 'reported' && c.classList.contains('cmt--reported'))
                        || (mode === 'mine' && !!c.querySelector('.cmt__reply'));
                    c.hidden = !show;
                });
            });
        });
    }

    /*
     * 콘텐츠 이용 게이트 (성인인증 · 프리미엄 구독).
     *   - 성인 19+ : 인증 전에는 GNB 메뉴 클릭 차단 + 인증 안내 모달. 인증 후 정상 진입.
     *   - 프리미엄 : 미구독 상태에서 프리미엄 전용 영상 재생 시 구독 유도 오버레이.
     * 상태는 body 클래스(is-adult / is-premium)로 판별하며, 데모 토글(gnb__demo-group)과 연동된다.
     * 실서비스에서는 서버 인증 결과로 body 클래스를 내려주면 그대로 동작한다.
     */
    function initContentGates() {
        var isPreview = /\.html$/.test(location.pathname);
        var adultUrl = isPreview ? 'preview-category-adult.html' : '/category/adult';

        /* --- 성인 19+ 게이트 --- */
        var adultLinks = Array.prototype.filter.call(
            document.querySelectorAll('a[href]'),
            function (a) {
                var t = (a.textContent || '').replace(/\s/g, '');
                return t.indexOf('성인19') === 0 || /category\/adult|preview-category-adult\.html/.test(a.getAttribute('href') || '');
            }
        );

        function adultVerified() { return document.body.classList.contains('is-adult'); }

        // 인증 전에는 잠금 표시 (CSS 가 자물쇠 아이콘 노출)
        adultLinks.forEach(function (a) { a.classList.add('is-adult-gate'); });

        function openAdultModal() {
            var modal = document.getElementById('modal-adult');
            if (!modal) {
                modal = document.createElement('div');
                modal.className = 'modal js-adult-modal';
                modal.id = 'modal-adult';
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');
                modal.innerHTML =
                    '<div class="modal__box modal__box--gate">' +
                        '<div class="modal__head"><h2 class="modal__title">성인 인증이 필요합니다</h2>' +
                        '<button type="button" class="modal__close js-gate-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>' +
                        '<div class="gate">' +
                            '<span class="gate__badge">19+</span>' +
                            '<p class="gate__desc">성인 19+ 콘텐츠는 <b>본인인증을 통한 성인 확인</b> 후 이용할 수 있습니다.<br>인증 후 바로 시청하실 수 있어요.</p>' +
                            '<ul class="gate__notes"><li>만 19세 미만은 이용할 수 없습니다.</li><li>인증 정보는 본인 확인 용도로만 사용됩니다.</li></ul>' +
                        '</div>' +
                        '<div class="modal__actions">' +
                            '<button type="button" class="btn btn--ghost js-gate-close">취소</button>' +
                            '<button type="button" class="btn btn--primary js-gate-verify">성인 인증하기</button>' +
                        '</div>' +
                    '</div>';
                document.body.appendChild(modal);

                modal.addEventListener('click', function (e) {
                    if (e.target === modal || e.target.closest('.js-gate-close')) { closeGate(modal); }
                    if (e.target.closest('.js-gate-verify')) {
                        // 데모 : 인증 완료 처리 후 성인 19+ 페이지로 이동 (실서비스는 본인인증 모듈 연동 지점)
                        try { localStorage.setItem('vibuzz-demo-adult', '1'); } catch (err) {}
                        document.body.classList.add('is-adult');
                        closeGate(modal);
                        location.href = adultUrl;
                    }
                });
            }
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
        function closeGate(m) { m.classList.remove('is-open'); document.body.style.overflow = ''; }

        adultLinks.forEach(function (a) {
            a.addEventListener('click', function (e) {
                if (adultVerified()) { return; }   // 인증 완료 → 정상 이동
                e.preventDefault();
                e.stopPropagation();
                openAdultModal();
            });
        });

        // 인증 전 직접 URL 진입 차단 (성인 카테고리 페이지)
        var isAdultPage = /category\/adult|preview-category-adult\.html/.test(location.pathname + location.search);
        if (isAdultPage && !adultVerified()) {
            var main = document.querySelector('.content') || document.body;
            main.innerHTML = '<section class="gate-page">'
                + '<span class="gate__badge">19+</span>'
                + '<h1 class="gate-page__title">성인 인증이 필요합니다</h1>'
                + '<p class="gate-page__desc">성인 19+ 콘텐츠는 본인인증을 통한 성인 확인 후 이용할 수 있습니다.</p>'
                + '<button type="button" class="btn btn--primary js-gate-verify-page">성인 인증하기</button>'
                + '</section>';
            var vp = main.querySelector('.js-gate-verify-page');
            if (vp) {
                vp.addEventListener('click', function () {
                    try { localStorage.setItem('vibuzz-demo-adult', '1'); } catch (err) {}
                    document.body.classList.add('is-adult');
                    location.reload();
                });
            }
        }

        /* --- 프리미엄 구독 게이트 (프리미엄 전용 영상 재생 시) --- */
        var premiumHost = document.querySelector('[data-premium="1"] .watch__player, [data-premium="1"] .player__stage');
        if (premiumHost && !document.body.classList.contains('is-premium')) {
            var video = premiumHost.querySelector('video');
            if (video) { video.pause(); video.removeAttribute('autoplay'); }

            var wall = document.createElement('div');
            wall.className = 'paywall';
            wall.innerHTML =
                '<div class="paywall__inner">' +
                    '<p class="paywall__title">이 콘텐츠는 <b>프리미엄 전용</b>입니다. 구독 후 시청하실 수 있습니다.</p>' +
                    '<a href="' + (/\.html$/.test(location.pathname) ? 'preview-premium.html' : '/premium') + '" class="paywall__cta">프리미엄 구독하러 가기</a>' +
                    '<ul class="paywall__benefits">' +
                        '<li><span class="paywall__icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></span>최신 콘텐츠 먼저보기</li>' +
                        '<li><span class="paywall__icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 10v4M7.5 12h2.6M10.1 10v4M13.4 10v4h1.8a1.6 1.6 0 0 0 1.6-1.6v-.8a1.6 1.6 0 0 0-1.6-1.6h-1.8Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>1080P (Full HD)</li>' +
                        '<li><span class="paywall__icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="5" width="13" height="10" rx="1.8" stroke="currentColor" stroke-width="1.6"/><rect x="16.5" y="9" width="5" height="10" rx="1.4" stroke="currentColor" stroke-width="1.6"/><path d="M6 18h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span>여러 기기에서 시청</li>' +
                        '<li><span class="paywall__icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="m20 20-3.4-3.4M8.6 13l2.4-5 2.4 5M9.4 11.4h3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>광고 건너뛰기</li>' +
                    '</ul>' +
                '</div>';
            premiumHost.appendChild(wall);
            // CTA 는 프리미엄 구독 페이지(/premium)로 이동한다.
            // 구독 완료(initPremium)에서 is-premium 을 켜므로 돌아오면 페이월이 사라진다.
        }
    }

    /*
     * 포스터 카드 메타의 크리에이터 프로필 이미지 클릭 → 크리에이터 채널로 이동.
     * 카드 전체가 이미 영상 링크(<a>)라 아바타를 <a>로 중첩할 수 없으므로,
     * 이벤트 위임으로 카드 링크를 막고 채널로 보낸다.
     */
    function initCreatorAvatarLinks() {
        var avatars = document.querySelectorAll('.poster-card__avatar');
        if (!avatars.length) { return; }
        var url = /\.html$/.test(location.pathname) ? 'preview-channel.html' : '/channel';

        Array.prototype.forEach.call(avatars, function (img) {
            img.classList.add('is-linked');
            img.setAttribute('title', '크리에이터 채널로 이동');
            img.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                location.href = url;
            });
        });
    }

    /*
     * 가입 직후 온보딩 - 취향(장르) 선택.
     * 선택 개수를 하단 바에 실시간 반영하고, 최소 개수를 채워야 "시작하기"가 활성화된다.
     */
    function initTastePicker() {
        var form = document.querySelector('.js-taste-form');
        if (!form) { return; }

        var MIN = 3;
        var checks = form.querySelectorAll('.js-taste-check');
        var countEl = document.querySelector('.js-taste-count');
        var hintEl = document.querySelector('.js-taste-hint');
        var submit = document.querySelector('.js-taste-submit');

        function sync() {
            var n = form.querySelectorAll('.js-taste-check:checked').length;
            if (countEl) { countEl.textContent = n; }
            if (submit) { submit.disabled = n < MIN; }
            if (hintEl) {
                hintEl.textContent = n < MIN ? ('· ' + (MIN - n) + '개 더 선택해주세요') : '· 준비 완료!';
                hintEl.classList.toggle('is-ready', n >= MIN);
            }
        }

        Array.prototype.forEach.call(checks, function (c) {
            c.addEventListener('change', sync);
        });
        sync();
    }

    /**
     * 확인 모달 (되돌리는 게 번거로운 동작 전 한 번 되묻는 용도).
     * 마크업은 최초 호출 때 한 번만 주입하고 이후 재사용한다.
     * opts : { title, desc, target, avatar, ok, cancel, danger, onOk }
     */
    var confirmModal = null;
    function openConfirm(opts) {
        if (!confirmModal) {
            var m = document.createElement('div');
            m.className = 'modal js-confirm-modal';
            m.setAttribute('role', 'dialog');
            m.setAttribute('aria-modal', 'true');
            m.innerHTML =
                '<div class="modal__box">' +
                    '<div class="modal__head">' +
                        '<h2 class="modal__title js-confirm-title"></h2>' +
                        '<button type="button" class="modal__close js-confirm-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
                    '</div>' +
                    '<div class="confirm__target js-confirm-target" hidden><img class="confirm__avatar js-confirm-avatar" src="" alt=""><strong class="js-confirm-name"></strong></div>' +
                    '<p class="confirm__desc js-confirm-desc"></p>' +
                    '<div class="modal__actions modal__actions--split">' +
                        '<button type="button" class="btn btn--ghost js-confirm-close"></button>' +
                        '<button type="button" class="btn btn--primary js-confirm-ok"></button>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(m);
            confirmModal = m;

            m.addEventListener('click', function (e) { if (e.target === m) { closeConfirm(); } });
            Array.prototype.forEach.call(m.querySelectorAll('.js-confirm-close'), function (b) {
                b.addEventListener('click', closeConfirm);
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && m.classList.contains('is-open')) { closeConfirm(); }
            });
        }

        var box = confirmModal;
        var okBtn = box.querySelector('.js-confirm-ok');
        var target = box.querySelector('.js-confirm-target');

        box.querySelector('.js-confirm-title').textContent = opts.title || '확인';
        box.querySelector('.js-confirm-desc').textContent = opts.desc || '';
        box.querySelector('.js-confirm-close.btn').textContent = opts.cancel || '취소';

        if (opts.target) {
            target.hidden = false;
            box.querySelector('.js-confirm-name').textContent = opts.target;
            var av = box.querySelector('.js-confirm-avatar');
            if (opts.avatar) { av.src = opts.avatar; av.hidden = false; } else { av.hidden = true; }
        } else {
            target.hidden = true;
        }

        /* 이전 호출의 핸들러가 남지 않도록 버튼을 통째로 갈아끼운다 */
        var fresh = okBtn.cloneNode(false);
        fresh.className = 'btn js-confirm-ok ' + (opts.danger ? 'btn--danger' : 'btn--primary');
        fresh.textContent = opts.ok || '확인';
        fresh.addEventListener('click', function () {
            closeConfirm();
            if (typeof opts.onOk === 'function') { opts.onOk(); }
        });
        okBtn.parentNode.replaceChild(fresh, okBtn);

        box.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        fresh.focus();
    }
    function closeConfirm() {
        if (!confirmModal) { return; }
        confirmModal.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    /* 채널 구독 버튼 (데모 : 구독 ↔ 구독중 토글, 취소할 때만 한 번 되묻는다) */
    function initChannelSubscribe() {
        var btn = document.querySelector('.js-channel-subscribe');
        if (!btn) { return; }
        function apply(on) {
            btn.classList.toggle('is-subscribed', on);
            btn.textContent = on ? '구독중' : '구독';
        }
        btn.addEventListener('click', function () {
            if (!btn.classList.contains('is-subscribed')) { apply(true); return; }
            var nameEl = document.querySelector('.channel__name');
            var avatarEl = document.querySelector('.channel__avatar');
            openConfirm({
                title: '구독을 취소할까요?',
                target: nameEl ? nameEl.textContent.trim() : '',
                avatar: avatarEl ? avatarEl.getAttribute('src') : '',
                desc: '구독을 취소하면 이 채널의 새 영상 알림을 더 이상 받을 수 없어요. 언제든 다시 구독할 수 있습니다.',
                cancel: '유지하기',
                ok: '구독 취소',
                danger: true,
                onOk: function () { apply(false); }
            });
        });
    }

    /* 크리에이터 팔로우 버튼 (데모 : 팔로우 ↔ 팔로잉, 취소할 때만 되묻는다)
       상태 표기는 기존 CSS 계약을 따른다 — .player__follow--primary = 미팔로우, 없으면 팔로잉 */
    function initFollow() {
        var btns = document.querySelectorAll('.player__follow');
        if (!btns.length) { return; }
        Array.prototype.forEach.call(btns, function (btn) {
            var box = btn.closest ? btn.closest('.player__channel') : null;
            function apply(on) {
                btn.classList.toggle('player__follow--primary', !on);
                btn.textContent = on ? '팔로잉' : '팔로우';
                btn.setAttribute('aria-pressed', String(on));
            }
            /* 마크업이 이미 담고 있는 초기 상태를 그대로 반영(문구는 바뀌지 않는다) */
            apply(!btn.classList.contains('player__follow--primary'));

            btn.addEventListener('click', function () {
                if (btn.classList.contains('player__follow--primary')) { apply(true); return; }
                var nameEl = box ? box.querySelector('.player__channel-name') : null;
                var avatarEl = box ? box.querySelector('.player__channel-avatar img') : null;
                openConfirm({
                    title: '팔로우를 취소할까요?',
                    target: nameEl ? nameEl.textContent.trim() : '',
                    avatar: avatarEl ? avatarEl.getAttribute('src') : '',
                    desc: '팔로우를 취소하면 이 크리에이터의 새 영상 알림을 더 이상 받을 수 없어요. 언제든 다시 팔로우할 수 있습니다.',
                    cancel: '유지하기',
                    ok: '팔로우 취소',
                    danger: true,
                    onOk: function () { apply(false); }
                });
            });
        });
    }

    function initMypageBack() {
        var content = document.querySelector('.mypage:not(.mypage--library) .mypage__content');
        if (!content || content.querySelector('.mypage-back')) { return; }
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'mypage-back';
        back.setAttribute('aria-label', '전단계로 가기');   // 아이콘 전용 버튼 — 라벨은 보조기술용
        back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        back.addEventListener('click', function () {
            if (window.history.length > 1) { window.history.back(); }
            else { location.href = /\.html$/.test(location.pathname) ? 'preview-favorites.html' : '/mypage'; }
        });
        content.insertBefore(back, content.firstChild);
    }

    /*
     * 모바일 하단 고정 독바 (홈·검색·업로드·즐겨찾기·마이페이지).
     * 기존 authbar/usermenu 와 동일하게 JS 주입 → 모든 페이지(프리뷰·블레이드)에 자동 적용.
     * 푸터 없는 몰입 화면(플레이어·시청·로그인)엔 표시하지 않는다(.footer 존재 여부로 판별).
     * 표시는 CSS(≤767)가 제어하며, 데스크톱/태블릿에선 숨겨진다.
     */
    function initMobileDock() {
        // 푸터가 있는 브라우즈/앱 페이지 + 쇼츠 플레이어에 표시 (watch/로그인 등 그 외 몰입/플로우는 제외)
        if (!document.querySelector('.footer') && !document.body.classList.contains('page-player')) { return; }
        if (document.querySelector('.mobile-dock')) { return; }  // 중복 방지

        var isPreview = /\.html$/.test(location.pathname);
        var link = function (route, preview) { return isPreview ? preview : route; };

        var ICON = {
            home: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11.4 12 4.5l8 6.9V19a1.5 1.5 0 0 1-1.5 1.5H15V15a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.5H5.5A1.5 1.5 0 0 1 4 19v-7.6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
            search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/><path d="m20 20-3.4-3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
            upload: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
            favorites: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.2l-6.5-3.7-6.5 3.7V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
            mypage: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
        };

        var ITEMS = [
            { key: 'home', label: '홈', href: link('/', 'preview.html'), icon: ICON.home },
            { key: 'search', label: '검색', href: link('/search', 'preview-search.html'), icon: ICON.search },
            { key: 'upload', label: '업로드', href: link('/upload', 'preview-upload.html'), icon: ICON.upload },
            { key: 'favorites', label: '즐겨찾기', href: link('/mypage#favorites', 'preview-favorites.html#favorites'), icon: ICON.favorites },
            { key: 'mypage', label: '마이페이지', href: link('/mypage', 'preview-favorites.html'), icon: ICON.mypage }
        ];

        // 현재 경로 기준 활성 탭 판정 (그 외 브라우즈 페이지는 모두 '홈')
        var path = location.pathname;
        var active = /upload/.test(path) ? 'upload'
            : /search/.test(path) ? 'search'
            // 통합 후 preview-favorites.html = 마이페이지 홈 (즐겨찾기는 같은 페이지의 섹션)
            : /(mypage|favorite|faq)/.test(path) ? 'mypage'
            : 'home';

        var nav = document.createElement('nav');
        nav.className = 'mobile-dock';
        nav.setAttribute('aria-label', '하단 메뉴');
        nav.innerHTML = ITEMS.map(function (it) {
            var on = it.key === active;
            return '<a href="' + it.href + '" data-dock="' + it.key + '" class="mobile-dock__item' + (on ? ' is-active' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
                '<span class="mobile-dock__icon">' + it.icon + '</span>' +
                '<span class="mobile-dock__label">' + it.label + '</span></a>';
        }).join('');
        document.body.appendChild(nav);
        document.body.classList.add('has-mobile-dock');
    }

    /*
     * 모바일(≤767) GNB 카테고리 라벨 축약 (Figma 모바일 시안: AI/성인 접두 제거).
     * 데스크톱/태블릿은 전체 라벨 유지하며, 리사이즈에도 대응한다.
     */
    function initMobileGnbLabels() {
        var links = document.querySelectorAll('.gnb__nav-link');
        if (!links.length || !window.matchMedia) { return; }

        var SHORT = {
            'AI 라이브채널': '라이브채널',
            '성인 19+': '19+'
        };
        var mq = window.matchMedia('(max-width: 767px)');

        function apply() {
            var mobile = mq.matches;
            Array.prototype.forEach.call(links, function (a) {
                var full = a.getAttribute('data-label-full');
                if (full === null) { full = a.textContent.trim(); a.setAttribute('data-label-full', full); }
                a.textContent = (mobile && SHORT[full]) ? SHORT[full] : full;
            });
        }
        apply();
        if (mq.addEventListener) { mq.addEventListener('change', apply); }
        else if (mq.addListener) { mq.addListener(apply); }
    }

    /*
     * 콘텐츠 업로드 플로우.
     * 진입 시 종류 선택 → 파일 업로드 모달 → 상세 폼 → 영상 등록하기 → 주의사항 확인.
     * 공용 .modal 오버레이(.is-open)를 열고 닫는다.
     */
    /* 실제 브랜드 로고 (simple-icons, CC0). 없는 툴은 아래 모노그램으로 폴백한다. */
    var AI_TOOL_LOGOS = {
        'ChatGPT Plus/Pro': { p: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z', c: '#412991' },
        'Claude Pro': { p: 'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z', c: '#D97757' },
        'Gemini Advanced': { p: 'M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81', c: '#8E75B2' },
        'Notion AI': { p: 'M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z', c: '#000000' },
        'Flux API': { p: 'M11.402 23.747c.154.075.306.154.454.238.181.038.37.004.525-.097l.386-.251c-1.242-.831-2.622-1.251-3.998-1.602l2.633 1.712Zm-7.495-5.783a8.088 8.088 0 0 1-.222-.236.696.696 0 0 0 .112 1.075l2.304 1.498c1.019.422 2.085.686 3.134.944 1.636.403 3.2.79 4.554 1.728l.697-.453c-1.541-1.158-3.327-1.602-5.065-2.03-2.039-.503-3.965-.977-5.514-2.526Zm1.414-1.322-.665.432c.023.024.044.049.068.073 1.702 1.702 3.825 2.225 5.877 2.731 1.778.438 3.469.856 4.9 1.982l.682-.444c-1.612-1.357-3.532-1.834-5.395-2.293-2.019-.497-3.926-.969-5.467-2.481Zm7.502 2.084c1.596.412 3.096.904 4.367 2.036l.67-.436c-1.484-1.396-3.266-1.953-5.037-2.403v.803Zm.698-2.337a64.695 64.695 0 0 1-.698-.174v.802l.512.127c2.039.503 3.965.978 5.514 2.526l.007.009.663-.431c-.041-.042-.079-.086-.121-.128-1.702-1.701-3.824-2.225-5.877-2.731Zm-.698-1.928v.816c.624.19 1.255.347 1.879.501 2.039.502 3.965.977 5.513 2.526.077.077.153.157.226.239a.704.704 0 0 0-.238-.911l-3.064-1.992c-.744-.245-1.502-.433-2.251-.618a31.436 31.436 0 0 1-2.065-.561Zm-1.646 3.049c-1.526-.4-2.96-.888-4.185-1.955l-.674.439c1.439 1.326 3.151 1.88 4.859 2.319v-.803Zm0-1.772a8.543 8.543 0 0 1-2.492-1.283l-.686.446c.975.804 2.061 1.293 3.178 1.655v-.818Zm0-1.946a7.59 7.59 0 0 1-.776-.453l-.701.456c.462.337.957.627 1.477.865v-.868Zm3.533.269-1.887-1.226v.581c.614.257 1.244.473 1.887.645Zm5.493-8.863L12.381.112a.705.705 0 0 0-.762 0L3.797 5.198a.698.698 0 0 0 0 1.171l7.38 4.797V7.678a.414.414 0 0 0-.412-.412h-.543a.413.413 0 0 1-.356-.617l1.777-3.079a.412.412 0 0 1 .714 0l1.777 3.079a.413.413 0 0 1-.356.617h-.543a.414.414 0 0 0-.412.412v3.488l7.38-4.797a.7.7 0 0 0 0-1.171Z', c: '#5468FF' },
        'DALL·E': { p: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z', c: '#412991' },
        'Adobe Firefly': { p: 'M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425zM8.884 1.376H0v21.248zm15.116 0h-8.884L24 22.624Z', c: '#FF0000' },
        'Photoshop': { p: 'M9.85 8.42c-.37-.15-.77-.21-1.18-.2-.26 0-.49 0-.68.01-.2-.01-.34 0-.41.01v3.36c.14.01.27.02.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03.01-.31-.07-.62-.23-.89-.17-.26-.41-.46-.7-.57zM19.75.3H4.25C1.9.3 0 2.2 0 4.55v14.899c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.391 11.65c-.399.56-.959.98-1.609 1.22-.68.25-1.43.34-2.25.34-.24 0-.4 0-.5-.01s-.24-.01-.43-.01v3.209c.01.07-.04.131-.11.141H5.52c-.08 0-.12-.041-.12-.131V6.42c0-.07.03-.11.1-.11.17 0 .33 0 .56-.01.24-.01.49-.01.76-.02s.56-.01.87-.02c.31-.01.61-.01.91-.01.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.149.42.229.85.229 1.3.001.86-.199 1.57-.6 2.13zm7.091 3.89c-.28.4-.671.709-1.12.891-.49.209-1.09.318-1.811.318-.459 0-.91-.039-1.359-.129-.35-.061-.7-.17-1.02-.32-.07-.039-.121-.109-.111-.189v-1.74c0-.029.011-.07.041-.09.029-.02.06-.01.09.01.39.23.8.391 1.24.49.379.1.779.15 1.18.15.38 0 .65-.051.83-.141.16-.07.27-.24.27-.42 0-.141-.08-.27-.24-.4-.16-.129-.489-.279-.979-.471-.51-.18-.979-.42-1.42-.719-.31-.221-.569-.51-.761-.85-.159-.32-.239-.67-.229-1.021 0-.43.12-.84.341-1.21.25-.4.619-.72 1.049-.92.469-.239 1.059-.349 1.769-.349.41 0 .83.03 1.24.09.3.04.59.12.86.23.039.01.08.05.1.09.01.04.02.08.02.12v1.63c0 .04-.02.08-.05.1-.09.02-.14.02-.18 0-.3-.16-.62-.27-.96-.34-.37-.08-.74-.13-1.12-.13-.2-.01-.41.02-.601.07-.129.03-.24.1-.31.2-.05.08-.08.18-.08.27s.04.18.101.26c.09.11.209.2.34.27.229.12.47.23.709.33.541.18 1.061.43 1.541.73.33.209.6.49.789.83.16.318.24.67.23 1.029.011.471-.129.94-.389 1.331z', c: '#31A8FF' },
        'Veo': { p: 'M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81', c: '#8E75B2' },
        'ElevenLabs': { p: 'M4.6035 0v24h4.9317V0zm9.8613 0v24h4.9317V0z', c: '#000000' },
        'Google TTS': { p: 'M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-2.821-4.552l-.043.043.006-.05A9.344 9.344 0 0 0 12.19 2.38zm-.358 4.146c1.244-.04 2.518.368 3.486 1.15a5.186 5.186 0 0 1 1.862 4.078v.518c3.53-.07 3.53 5.262 0 5.193h-5.193l-.008.009v-.04H6.785a2.59 2.59 0 0 1-1.067-.23h.001a2.597 2.597 0 1 1 3.437-3.437l3.013-3.012A6.747 6.747 0 0 0 8.11 8.24c.018-.01.04-.026.054-.023a5.186 5.186 0 0 1 3.67-1.69z', c: '#4285F4' },
        'Suno': { p: 'M16.5 0C20.642 0 24 5.373 24 12h-9c0 6.627-3.358 12-7.5 12C3.358 24 0 18.627 0 12h9c0-6.627 3.358-12 7.5-12Z', c: '#000000' },
        'ElevenLabs SFX': { p: 'M4.6035 0v24h4.9317V0zm9.8613 0v24h4.9317V0z', c: '#000000' },
        'Premiere Pro': { p: 'M10.15 8.42a2.93 2.93 0 00-1.18-.2 13.9 13.9 0 00-1.09.02v3.36l.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03a1.45 1.45 0 00-.93-1.46zM19.75.3H4.25A4.25 4.25 0 000 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.09 11.65c-.4.56-.96.98-1.61 1.22-.68.25-1.43.34-2.25.34l-.5-.01-.43-.01v3.21a.12.12 0 01-.11.14H5.82c-.08 0-.12-.04-.12-.13V6.42c0-.07.03-.11.1-.11l.56-.01.76-.02.87-.02.91-.01c.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.15.42.23.85.23 1.3 0 .86-.2 1.57-.6 2.13zm6.82-3.15v1.95c0 .08-.05.11-.16.11a4.35 4.35 0 00-1.92.37c-.19.09-.37.21-.51.37v5.1c0 .1-.04.14-.13.14h-1.97a.14.14 0 01-.16-.12v-5.58l-.01-.75-.02-.78c0-.23-.02-.45-.04-.68a.1.1 0 01.07-.11h1.78c.1 0 .18.07.2.16a3.03 3.03 0 01.13.92c.3-.35.67-.64 1.08-.86a3.1 3.1 0 011.52-.39c.07-.01.13.04.14.11v.04z', c: '#9999FF' },
        'DaVinci Resolve Studio': { p: 'M17.621 0 5.977.004c-1.37 0-2.756.345-3.762 1.11a4.925 4.925 0 0 0-1.61 2.003C.233 3.93 0 5.02 0 5.951l.012 12.2c.002 1.604.479 3.057 1.461 4.112.984 1.056 2.462 1.683 4.331 1.691L16.856 24c1.26.005 3.095-.036 4.303-.714 1.075-.605 2.025-1.556 2.497-2.984.278-.84.345-2.084.344-3.147l-.021-11.13c-.002-.888-.15-2.023-.547-2.934-.425-.976-1.181-1.815-2.322-2.425C20.353.26 19.123 0 17.622 0zm0 .93c1.378 0 2.538.295 3.04.565.977.523 1.544 1.166 1.889 1.96.315.721.47 1.793.473 2.572l.018 11.13c.002 1.013-.097 2.257-.298 2.86-.396 1.202-1.146 1.946-2.063 2.462-.814.457-2.612.593-3.82.588l-11.05-.044c-1.657-.007-2.832-.534-3.626-1.386-.792-.851-1.212-2.06-1.212-3.485L.999 5.95c0-.829.196-1.827.474-2.437.345-.757.75-1.207 1.365-1.674C3.585 1.27 4.868.97 6.08.97zm-5.66 3.423c-1.976.089-3.204 1.658-3.214 3.29.019 1.443 1.635 3.481 2.884 4.53.12.099.154.109.33.18.062.025.198-.047.327-.135.36-.245.993-.947 1.648-1.738a7.67 7.67 0 0 0 1.031-1.683c.409-.89.261-1.599.235-1.888a3.983 3.983 0 0 0-.99-1.692 3.36 3.36 0 0 0-2.251-.864zm4.172 7.922a10.185 10.185 0 0 0-3.244.61c-.15.058-.26.1-.374.17-.057.036-.11.135-.105.292.017.433.29 1.278.624 2.27.384 1.135 1.066 2.27 1.844 2.74a3.23 3.23 0 0 0 2.53.342c.832-.243 1.595-.868 1.962-1.546.986-1.818.19-3.548-1.121-4.417-.447-.296-1.133-.445-1.89-.46-.074 0-.15-.002-.226-.001zm-8.432.038a6.201 6.201 0 0 0-.752.047c-.596.078-.932.273-1.29.51a3.177 3.177 0 0 0-1.365 1.979c-.075.552-.086 1.053.033 1.507.433 1.389 1.326 2.222 2.847 2.452.636.028 1.37-.063 1.99-.45 1.269-.782 2.08-3.17 2.412-4.742.053-.176.035-.357-.013-.42-.005-.067-.044-.113-.19-.183-.398-.192-1.32-.417-2.375-.6a7.68 7.68 0 0 0-1.297-.1z', c: '#233A51' },
        'Filmora': { p: 'M16.216 17.814 7.704 9.368l.02-.02c.391.239.91.19 1.249-.147l3.041-3.016 7.241 7.184c.397.394.402 1.029.005 1.426l-3.044 3.019Zm-5.253-3.017-3.03 3.017L0 9.915l3.746-3.73 7.217 7.187a1.005 1.005 0 0 1 0 1.425ZM24 9.913l-3.725 3.727L16 9.367l.02-.021c.388.239.903.19 1.239-.146l3.014-3.015L24 9.913Z', c: '#07273D' },
        'DaVinci Studio': { p: 'M17.621 0 5.977.004c-1.37 0-2.756.345-3.762 1.11a4.925 4.925 0 0 0-1.61 2.003C.233 3.93 0 5.02 0 5.951l.012 12.2c.002 1.604.479 3.057 1.461 4.112.984 1.056 2.462 1.683 4.331 1.691L16.856 24c1.26.005 3.095-.036 4.303-.714 1.075-.605 2.025-1.556 2.497-2.984.278-.84.345-2.084.344-3.147l-.021-11.13c-.002-.888-.15-2.023-.547-2.934-.425-.976-1.181-1.815-2.322-2.425C20.353.26 19.123 0 17.622 0zm0 .93c1.378 0 2.538.295 3.04.565.977.523 1.544 1.166 1.889 1.96.315.721.47 1.793.473 2.572l.018 11.13c.002 1.013-.097 2.257-.298 2.86-.396 1.202-1.146 1.946-2.063 2.462-.814.457-2.612.593-3.82.588l-11.05-.044c-1.657-.007-2.832-.534-3.626-1.386-.792-.851-1.212-2.06-1.212-3.485L.999 5.95c0-.829.196-1.827.474-2.437.345-.757.75-1.207 1.365-1.674C3.585 1.27 4.868.97 6.08.97zm-5.66 3.423c-1.976.089-3.204 1.658-3.214 3.29.019 1.443 1.635 3.481 2.884 4.53.12.099.154.109.33.18.062.025.198-.047.327-.135.36-.245.993-.947 1.648-1.738a7.67 7.67 0 0 0 1.031-1.683c.409-.89.261-1.599.235-1.888a3.983 3.983 0 0 0-.99-1.692 3.36 3.36 0 0 0-2.251-.864zm4.172 7.922a10.185 10.185 0 0 0-3.244.61c-.15.058-.26.1-.374.17-.057.036-.11.135-.105.292.017.433.29 1.278.624 2.27.384 1.135 1.066 2.27 1.844 2.74a3.23 3.23 0 0 0 2.53.342c.832-.243 1.595-.868 1.962-1.546.986-1.818.19-3.548-1.121-4.417-.447-.296-1.133-.445-1.89-.46-.074 0-.15-.002-.226-.001zm-8.432.038a6.201 6.201 0 0 0-.752.047c-.596.078-.932.273-1.29.51a3.177 3.177 0 0 0-1.365 1.979c-.075.552-.086 1.053.033 1.507.433 1.389 1.326 2.222 2.847 2.452.636.028 1.37-.063 1.99-.45 1.269-.782 2.08-3.17 2.412-4.742.053-.176.035-.357-.013-.42-.005-.067-.044-.113-.19-.183-.398-.192-1.32-.417-2.375-.6a7.68 7.68 0 0 0-1.297-.1z', c: '#233A51' },
        'Premiere AI': { p: 'M10.15 8.42a2.93 2.93 0 00-1.18-.2 13.9 13.9 0 00-1.09.02v3.36l.39.02h.53c.39 0 .78-.06 1.15-.18.32-.09.6-.28.82-.53.21-.25.31-.59.31-1.03a1.45 1.45 0 00-.93-1.46zM19.75.3H4.25A4.25 4.25 0 000 4.55v14.9c0 2.35 1.9 4.25 4.25 4.25h15.5c2.35 0 4.25-1.9 4.25-4.25V4.55C24 2.2 22.1.3 19.75.3zm-7.09 11.65c-.4.56-.96.98-1.61 1.22-.68.25-1.43.34-2.25.34l-.5-.01-.43-.01v3.21a.12.12 0 01-.11.14H5.82c-.08 0-.12-.04-.12-.13V6.42c0-.07.03-.11.1-.11l.56-.01.76-.02.87-.02.91-.01c.82 0 1.5.1 2.06.31.5.17.96.45 1.34.82.32.32.57.71.73 1.14.15.42.23.85.23 1.3 0 .86-.2 1.57-.6 2.13zm6.82-3.15v1.95c0 .08-.05.11-.16.11a4.35 4.35 0 00-1.92.37c-.19.09-.37.21-.51.37v5.1c0 .1-.04.14-.13.14h-1.97a.14.14 0 01-.16-.12v-5.58l-.01-.75-.02-.78c0-.23-.02-.45-.04-.68a.1.1 0 01.07-.11h1.78c.1 0 .18.07.2.16a3.03 3.03 0 01.13.92c.3-.35.67-.64 1.08-.86a3.1 3.1 0 011.52-.39c.07-.01.13.04.14.11v.04z', c: '#9999FF' },
        'Adobe Enhance Premium': { p: 'M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425zM8.884 1.376H0v21.248zm15.116 0h-8.884L24 22.624Z', c: '#FF0000' },
        'Remove.bg': { p: 'm23.729 13.55-1.903-.995-9.134 4.776a1.497 1.497 0 0 1-1.383.002l-9.137-4.778-1.903.995a.5.5 0 0 0 0 .888l11.499 6.011a.495.495 0 0 0 .462 0l11.499-6.011a.5.5 0 0 0 0-.888zM.269 10.447l11.499 6.013a.495.495 0 0 0 .462 0l11.499-6.013a.5.5 0 0 0 0-.887l-11.5-6.012a.505.505 0 0 0-.462 0L.268 9.559a.5.5 0 0 0 .001.887z', c: '#54616C' },
        'Firefly': { p: 'M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425zM8.884 1.376H0v21.248zm15.116 0h-8.884L24 22.624Z', c: '#FF0000' }
    };

    function initUploadFlow() {
        var form = document.querySelector('.js-upload-form');
        if (!form) { return; }

        function closeAll() {
            Array.prototype.forEach.call(document.querySelectorAll('.js-upload-modal'), function (m) { m.classList.remove('is-open'); });
            document.body.style.overflow = '';
        }
        function show(id) {
            closeAll();
            var m = document.getElementById(id);
            if (m) { m.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
        }

        // QA 해시(#notice)로 주의사항 모달 바로 확인 (진입 시 자동 모달 없음)
        if (/notice/.test(location.hash)) { show('modal-notice'); }

        // 상단 영상 업로드 : 드롭존 ↔ 미리보기 토글 (파일 선택은 데모)
        var vdz = document.querySelector('.js-video-dropzone');
        var vpv = document.querySelector('.js-video-preview');
        function videoPreview(on) { if (vdz) { vdz.hidden = on; } if (vpv) { vpv.hidden = !on; } }
        var vsel = document.querySelector('.js-video-select');
        if (vsel) { vsel.addEventListener('click', function () { videoPreview(true); }); }
        var vchg = document.querySelector('.js-video-change');
        if (vchg) { vchg.addEventListener('click', function () { videoPreview(false); }); }

        // 카테고리 선택 → 장르 팝업(복수 선택) (IA 명세 : 카테고리별 하위 장르, 처음엔 미선택 → 하단 칩)
        var catSel = document.querySelector('.js-upload-category');
        var genreWrap = document.querySelector('.js-upload-genre');
        var genreModal = document.getElementById('modal-genre');
        if (catSel && genreWrap && genreModal) {
            var genreMap = {};
            try { genreMap = JSON.parse(catSel.getAttribute('data-genres') || '{}'); } catch (e) {}
            var genreBtn = genreWrap.querySelector('.js-genre-btn');
            var genreBtnText = genreWrap.querySelector('.js-genre-btn-text');
            var genreChips = genreWrap.querySelector('.js-genre-chips');
            var genreList = genreModal.querySelector('.js-genre-modal-list');
            var selected = [];

            function syncList() {
                Array.prototype.forEach.call(genreList.querySelectorAll('.genre-modal__item'), function (it) {
                    it.classList.toggle('is-selected', selected.indexOf(it.getAttribute('data-genre')) >= 0);
                    it.setAttribute('aria-pressed', selected.indexOf(it.getAttribute('data-genre')) >= 0);
                });
                genreBtnText.textContent = selected.length ? ('장르 ' + selected.length + '개 선택됨') : '장르 선택하기';
            }
            function renderChips() {
                genreChips.innerHTML = '';
                selected.forEach(function (g) {
                    var chip = document.createElement('span');
                    chip.className = 'upload-chip';
                    chip.appendChild(document.createTextNode(g + ' '));
                    var x = document.createElement('button');
                    x.type = 'button';
                    x.setAttribute('aria-label', g + ' 삭제');
                    x.innerHTML = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
                    x.addEventListener('click', function () { setGenre(g, false); });
                    chip.appendChild(x);
                    genreChips.appendChild(chip);
                });
            }
            function setGenre(g, on) {
                var idx = selected.indexOf(g);
                if (on && idx < 0) { selected.push(g); }
                else if (!on && idx >= 0) { selected.splice(idx, 1); }
                syncList();
                renderChips();
            }
            catSel.addEventListener('change', function () {
                catSel.classList.toggle('is-placeholder', !catSel.value);
                selected = []; // 카테고리 변경 시 처음엔 아무것도 선택 안 됨
                var list = genreMap[catSel.value] || [];
                genreList.innerHTML = '';
                list.forEach(function (g) {
                    var it = document.createElement('button');
                    it.type = 'button';
                    it.className = 'genre-modal__item';
                    it.setAttribute('data-genre', g);
                    it.setAttribute('aria-pressed', 'false');
                    it.textContent = g;
                    it.addEventListener('click', function () { setGenre(g, selected.indexOf(g) < 0); });
                    genreList.appendChild(it);
                });
                genreBtn.disabled = list.length === 0;
                renderChips();
                syncList();
            });
            // 장르 버튼 → 팝업 열기
            function openGenre() { genreModal.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
            function closeGenre() { genreModal.classList.remove('is-open'); document.body.style.overflow = ''; }
            genreBtn.addEventListener('click', function () { if (!genreBtn.disabled) { syncList(); openGenre(); } });
            genreModal.querySelector('.js-genre-modal-close').addEventListener('click', closeGenre);
            genreModal.querySelector('.js-genre-modal-ok').addEventListener('click', closeGenre);
            genreModal.addEventListener('click', function (e) { if (e.target === genreModal) { closeGenre(); } });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && genreModal.classList.contains('is-open')) { closeGenre(); } });
        }

        // 닫기(X) / 오버레이 클릭 / Esc (주의사항 모달)
        Array.prototype.forEach.call(document.querySelectorAll('.js-modal-close'), function (b) { b.addEventListener('click', closeAll); });
        Array.prototype.forEach.call(document.querySelectorAll('.js-upload-modal'), function (m) {
            m.addEventListener('click', function (e) { if (e.target === m) { closeAll(); } });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && document.querySelector('.js-upload-modal.is-open')) { closeAll(); }
        });

        // 영상 등록하기 → 주의사항 확인 모달
        form.addEventListener('submit', function (e) { e.preventDefault(); show('modal-notice'); });
        // 확인 → 완료(홈으로)
        var ok = document.querySelector('.js-notice-ok');
        if (ok) {
            ok.addEventListener('click', function () {
                closeAll();
                location.href = /\.html$/.test(location.pathname) ? 'preview.html' : '/';
            });
        }

        // 셀렉트 placeholder 색상 + AI 칩 삭제
        Array.prototype.forEach.call(document.querySelectorAll('.upload-select'), function (sel) {
            sel.addEventListener('change', function () { sel.classList.toggle('is-placeholder', !sel.value); });
        });
        Array.prototype.forEach.call(document.querySelectorAll('.upload-chip button'), function (b) {
            b.addEventListener('click', function () { var c = b.closest('.upload-chip'); if (c) { c.remove(); } });
        });
    }

    /**
     * "사용한 AI" 선택 팝업 (카테고리별 툴, 복수 선택 → 하단 칩).
     * 업로드 폼과 채널 편집이 같은 목록 · 같은 UI 를 공유한다.
     *
     * 마크업 계약 :
     *   .js-upload-ai[data-ai-groups]    선택지 JSON (필수)
     *                [data-ai-selected]  초기 선택값 JSON 배열
     *                [data-ai-modal]     팝업 id (기본 : modal-ai)
     *                [data-ai-name]      폼 전송용 hidden input name
     *                [data-ai-label]     미선택 시 버튼 문구
     *                [data-ai-noun]      "OO N개 선택됨" 의 OO
     */
    function initAiPicker() {
        var wraps = document.querySelectorAll('.js-upload-ai');
        if (!wraps.length) { return; }

        // 카테고리별 아이콘 (각 타이틀에 맞춘 라인 아이콘)
        var AI_ICONS = {
            'plan': '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8.9.8 1.5v.6h5.4v-.6c0-.6.3-1.1.8-1.5A6 6 0 0 0 12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.5 19h5M10 21.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
            'image': '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6"/><circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" stroke-width="1.4"/><path d="M4 17l4.5-4.5L13 17m2-3 2-2 3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'image-edit': '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="14" height="12" rx="2.2" stroke="currentColor" stroke-width="1.6"/><circle cx="7.5" cy="8.5" r="1.4" stroke="currentColor" stroke-width="1.3"/><path d="M4 14l3.5-3.5L11 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 15.5 20 10l2 2-5.5 5.5-2.6.6.6-2.6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
            'video': '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="13" height="12" rx="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M16 10.5 21 8v8l-5-2.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.5 9.5v5l4-2.5-4-2.5Z" fill="currentColor"/></svg>',
            'avatar': '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.5" r="3.8" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c0-3.4 3.1-5.8 7-5.8s7 2.4 7 5.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
            'lipsync': '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 3.5 6.6L4 20l1-3.2A7.9 7.9 0 0 1 4 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 11.5c1 1.5 5 1.5 6 0M9.5 14.5c.9.8 4.1.8 5 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
            'motion': '<svg viewBox="0 0 24 24" fill="none"><circle cx="14" cy="5.5" r="1.8" stroke="currentColor" stroke-width="1.5"/><path d="M15 9l-4 2.5.5 3.5m0 0L14 20m-2.5-5-3.5-1M15 9l3 1.5M11 11.5 8 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'voice': '<svg viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9.5 21h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
            'music': '<svg viewBox="0 0 24 24" fill="none"><path d="M9 18V6l10-2v11" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="6.5" cy="18" rx="2.5" ry="2" stroke="currentColor" stroke-width="1.6"/><ellipse cx="16.5" cy="15" rx="2.5" ry="2" stroke="currentColor" stroke-width="1.6"/></svg>',
            'sfx': '<svg viewBox="0 0 24 24" fill="none"><path d="M4 9v6h3l5 4V5L7 9H4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
            'edit': '<svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="7" r="2.5" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="17" r="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M8.2 8.5 20 16M8.2 15.5 20 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
            'color': '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
            'upscale': '<svg viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6M20 4l-6 6M10 20H4v-6M4 20l6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'denoise': '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12h2l2-5 3 10 3-13 3 16 2-8h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'bg-remove': '<svg viewBox="0 0 24 24" fill="none"><path d="M4 4h3M4 4v3M20 4h-3M20 4v3M4 20h3M4 20v-3M20 20h-3M20 20v-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="10" r="2.6" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 17c.8-2 2.5-3.2 4.5-3.2s3.7 1.2 4.5 3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
            '3d': '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 7.5 12 12l8-4.5M12 12v9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
            'vfx': '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.4L18 9l-4.2 1.6L12 15l-1.8-4.4L6 9l4.2-1.6L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" fill="currentColor"/></svg>'
        };

        // 로고가 없는 툴 폴백 : 첫 글자 모노그램(툴별 고유 색) — 추후 실제 로고 교체 지점.
        function aiMonogram(name) {
            var m = String(name).replace(/[^0-9A-Za-z가-힣]/g, '');
            return (m.charAt(0) || '?').toUpperCase();
        }
        function aiHue(name) {
            var h = 0;
            for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) % 360; }
            return h;
        }

        Array.prototype.forEach.call(wraps, function (aiWrap) {
            var aiModal = document.getElementById(aiWrap.getAttribute('data-ai-modal') || 'modal-ai');
            if (!aiModal) { return; }

            var aiBtn = aiWrap.querySelector('.js-ai-btn');
            var aiBtnText = aiWrap.querySelector('.js-ai-btn-text');
            var aiChips = aiWrap.querySelector('.js-ai-chips');
            var aiList = aiModal.querySelector('.js-ai-modal-list');
            if (!aiBtn || !aiList || !aiChips) { return; }

            var aiName = aiWrap.getAttribute('data-ai-name') || '';
            var aiLabel = aiWrap.getAttribute('data-ai-label') || '사용한 AI 선택하기';
            var aiNoun = aiWrap.getAttribute('data-ai-noun') || '사용한 AI';
            var aiGroups = [];
            var aiSelected = [];
            try { aiGroups = JSON.parse(aiWrap.getAttribute('data-ai-groups') || '[]'); } catch (e) {}
            try { aiSelected = JSON.parse(aiWrap.getAttribute('data-ai-selected') || '[]'); } catch (e) {}

            // 모달 내용 구성 (카테고리 헤더 + 툴 핀[앞에 작은 아이콘])
            aiGroups.forEach(function (g) {
                var sec = document.createElement('div');
                sec.className = 'ai-group';
                var head = document.createElement('div');
                head.className = 'ai-group__head';
                head.innerHTML = '<span class="ai-group__icon">' + (AI_ICONS[g.icon] || '') + '</span>';
                head.appendChild(document.createTextNode(g.title));
                sec.appendChild(head);
                var pills = document.createElement('div');
                pills.className = 'ai-group__pills';
                (g.tools || []).forEach(function (t) {
                    var p = document.createElement('button');
                    p.type = 'button';
                    p.className = 'ai-tool-pill';
                    p.setAttribute('data-tool', t);
                    var ico = document.createElement('span');
                    ico.className = 'ai-tool-pill__ico';
                    var logo = AI_TOOL_LOGOS[t];
                    if (logo) {
                        // 실제 브랜드 로고 (흰 배경 칩 + 브랜드 컬러 글리프)
                        ico.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + logo.p + '" fill="' + logo.c + '"/></svg>';
                    } else {
                        // 로고 미확보 툴 : 첫 글자 모노그램 (툴별 고유 색)
                        ico.className += ' ai-tool-pill__ico--mono';
                        ico.textContent = aiMonogram(t);
                        ico.style.color = 'hsl(' + aiHue(t) + ', 62%, 42%)';
                    }
                    p.appendChild(ico);
                    p.appendChild(document.createTextNode(t));
                    p.addEventListener('click', function () { setAi(t, aiSelected.indexOf(t) < 0); });
                    pills.appendChild(p);
                });
                sec.appendChild(pills);
                aiList.appendChild(sec);
            });

            function syncCards() {
                Array.prototype.forEach.call(aiList.querySelectorAll('.ai-tool-pill'), function (c) {
                    c.classList.toggle('is-selected', aiSelected.indexOf(c.getAttribute('data-tool')) >= 0);
                });
                if (aiBtnText) { aiBtnText.textContent = aiSelected.length ? (aiNoun + ' ' + aiSelected.length + '개 선택됨') : aiLabel; }
            }
            function renderAiChips() {
                aiChips.innerHTML = '';
                aiSelected.forEach(function (t) {
                    var chip = document.createElement('span');
                    chip.className = 'upload-chip';
                    chip.appendChild(document.createTextNode(t + ' '));
                    var x = document.createElement('button');
                    x.type = 'button';
                    x.setAttribute('aria-label', t + ' 삭제');
                    x.innerHTML = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
                    x.addEventListener('click', function () { setAi(t, false); });
                    chip.appendChild(x);
                    // 폼 전송용 값 (name 이 지정된 화면에서만)
                    if (aiName) {
                        var hid = document.createElement('input');
                        hid.type = 'hidden';
                        hid.name = aiName;
                        hid.value = t;
                        chip.appendChild(hid);
                    }
                    aiChips.appendChild(chip);
                });
            }
            function setAi(t, on) {
                var idx = aiSelected.indexOf(t);
                if (on && idx < 0) { aiSelected.push(t); }
                else if (!on && idx >= 0) { aiSelected.splice(idx, 1); }
                syncCards();
                renderAiChips();
            }
            function openAi() { aiModal.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
            function closeAi() { aiModal.classList.remove('is-open'); document.body.style.overflow = ''; }
            aiBtn.addEventListener('click', function () { syncCards(); openAi(); });
            aiModal.querySelector('.js-ai-modal-close').addEventListener('click', closeAi);
            aiModal.querySelector('.js-ai-modal-ok').addEventListener('click', closeAi);
            aiModal.addEventListener('click', function (e) { if (e.target === aiModal) { closeAi(); } });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && aiModal.classList.contains('is-open')) { closeAi(); } });

            syncCards();
            renderAiChips();
        });
    }

    /**
     * 크리에이터 신청 (원페이지 신청서).
     * - 그룹(기본/채널/활동/약관)별 완료 여부 → 우측 체크리스트 + 진행률
     * - 주력 카테고리 최대 개수 제한(초과 선택 차단)
     * - 핸들 입력 → 채널 주소 미리보기
     * - 필수 4그룹이 모두 채워져야 "신청서 제출" 활성화
     * 실제 저장·검증은 서버(CreatorApplyController::store)에서 한 번 더 한다.
     */
    function initCreatorApply() {
        var form = document.querySelector('.js-capply');
        if (!form) { return; }

        var pct = form.querySelector('.js-capply-pct');
        var fill = form.querySelector('.js-capply-fill');
        var submit = form.querySelector('.js-capply-submit');
        var checks = form.querySelectorAll('[data-capply-check]');
        var cats = form.querySelector('.js-capply-cats');
        var handle = form.querySelector('.js-capply-handle');
        var handleUrl = form.querySelector('.js-capply-handle-url');

        // 그룹별 완료 조건
        function groupDone(key) {
            if (key === 'basic') {
                var email = form.querySelector('#ca-email');
                return !!(email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim()));
            }
            if (key === 'channel') {
                var ok = true;
                Array.prototype.forEach.call(form.querySelectorAll('[data-capply-group="channel"] .js-capply-required'), function (f) {
                    if (!f.value.trim()) { ok = false; }
                });
                return ok;
            }
            if (key === 'activity') {
                var catOn = form.querySelectorAll('.js-capply-cats input:checked').length > 0;
                var aiOn = form.querySelectorAll('.capply-ai .upload-chip').length > 0;
                var plan = form.querySelector('#ca-plan');
                return catOn && aiOn && !!(plan && plan.value);
            }
            if (key === 'terms') {
                var all = form.querySelectorAll('.js-capply-req-term');
                var on = form.querySelectorAll('.js-capply-req-term:checked');
                return all.length > 0 && all.length === on.length;
            }
            return false;
        }

        function sync() {
            var done = 0;
            Array.prototype.forEach.call(checks, function (li) {
                var ok = groupDone(li.getAttribute('data-capply-check'));
                li.classList.toggle('is-done', ok);
                if (ok) { done += 1; }
            });
            var rate = checks.length ? Math.round(done / checks.length * 100) : 0;
            if (pct) { pct.textContent = rate + '%'; }
            if (fill) { fill.style.width = rate + '%'; }
            if (submit) { submit.disabled = done !== checks.length; }
        }

        // 주력 카테고리 : 최대 개수 초과 시 선택 차단
        if (cats) {
            var max = parseInt(cats.getAttribute('data-max'), 10) || 2;
            cats.addEventListener('change', function (e) {
                var boxes = cats.querySelectorAll('input');
                var on = cats.querySelectorAll('input:checked');
                if (on.length > max && e.target.checked) {
                    e.target.checked = false;
                    on = cats.querySelectorAll('input:checked');
                }
                cats.classList.toggle('is-full', on.length >= max);
                if (boxes.length) { sync(); }
            });
            cats.classList.toggle('is-full', cats.querySelectorAll('input:checked').length >= max);
        }

        // 핸들 → 채널 주소 미리보기 (허용 문자만 남김)
        if (handle && handleUrl) {
            var baseUrl = 'vibuzz.kr/@';
            var updateUrl = function () {
                handle.value = handle.value.replace(/[^0-9A-Za-z_]/g, '');
                handleUrl.textContent = baseUrl + handle.value;
            };
            handle.addEventListener('input', updateUrl);
            updateUrl();
        }

        /* 제출 → 심사중 상태로 전환(진행 상황 화면 진입점이 열린다).
           실서비스에서는 서버가 신청 레코드를 만들고 상태를 내려준다. */
        form.addEventListener('submit', function () {
            try { localStorage.setItem('vibuzz-demo-applied', '1'); } catch (e) { /* 프라이빗 모드 - 무시 */ }
        });

        form.addEventListener('input', sync);
        form.addEventListener('change', sync);
        // AI 툴은 팝업에서 칩이 바뀌므로 DOM 변화를 관찰해 반영
        var chips = form.querySelector('.capply-ai .js-ai-chips');
        if (chips && window.MutationObserver) {
            new MutationObserver(sync).observe(chips, { childList: true });
        }
        sync();
    }

    /**
     * 1:1 문의 > 내 문의 내역 아코디언.
     * 행을 누르면 문의 본문과 답변을 펼치고, 다른 행은 접는다(FAQ와 동일한 동작).
     */
    function initMyInquiries() {
        var rows = document.querySelectorAll('.js-myq-toggle');
        if (!rows.length) { return; }

        Array.prototype.forEach.call(rows, function (row) {
            row.addEventListener('click', function () {
                var item = row.closest('.myq__item');
                var panel = item.querySelector('.myq__panel');
                var open = item.classList.contains('is-open');

                // 하나만 펼침
                Array.prototype.forEach.call(document.querySelectorAll('.myq__item.is-open'), function (o) {
                    o.classList.remove('is-open');
                    var p = o.querySelector('.myq__panel');
                    if (p) { p.hidden = true; }
                    var b = o.querySelector('.js-myq-toggle');
                    if (b) { b.setAttribute('aria-expanded', 'false'); }
                });

                if (!open) {
                    item.classList.add('is-open');
                    if (panel) { panel.hidden = false; }
                    row.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    /**
     * 마이페이지 대시보드 (통합 화면).
     * 모바일 라이브러리 메뉴의 "회원정보 변경" → 회원정보 카드만 보이는 화면으로 전환하고,
     * 카드의 뒤로가기(화살표)로 라이브러리에 복귀한다. 데스크톱은 #account 앵커 이동 그대로.
     */
    function initMypageDashboard() {
        var dash = document.querySelector('.mypage--library');
        if (!dash || !dash.querySelector('.mydash-account')) { return; }

        function setOpen(on) {
            dash.classList.toggle('is-account-open', on);
            if (on) { window.scrollTo(0, 0); }
        }
        Array.prototype.forEach.call(dash.querySelectorAll('.js-account-open'), function (b) {
            b.addEventListener('click', function (e) {
                if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
                    e.preventDefault();
                    setOpen(true);
                }
            });
        });
        var back = dash.querySelector('.js-account-back');
        if (back) { back.addEventListener('click', function () { setOpen(false); }); }
    }

    /**
     * 마이페이지 사이드바 드로어 (태블릿 768~1023).
     * 데스크톱은 좌측 고정 사이드바 그대로, 태블릿에서는 본문 위에 쌓이는 대신
     * 우측 상단 햄버거 버튼 → 우측 슬라이드 드로어로 연다. (마크업 주입 · 전 마이페이지 공통)
     * 모바일(≤767)은 기존 패턴(라이브러리 메뉴 / 뒤로가기) 유지.
     */
    function initMypageSideDrawer() {
        var mypage = document.querySelector('.mypage');
        if (!mypage || !mypage.querySelector('.mypage__side')) { return; }
        if (mypage.querySelector('.mypage-menu-btn')) { return; }

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mypage-menu-btn';
        btn.setAttribute('aria-label', '마이페이지 메뉴 열기');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

        var dim = document.createElement('div');
        dim.className = 'mypage-side-dim';
        dim.setAttribute('aria-hidden', 'true');

        function setOpen(on) {
            mypage.classList.toggle('side-open', on);
            btn.setAttribute('aria-expanded', String(on));
            document.body.style.overflow = on ? 'hidden' : '';
        }
        btn.addEventListener('click', function () { setOpen(!mypage.classList.contains('side-open')); });
        dim.addEventListener('click', function () { setOpen(false); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mypage.classList.contains('side-open')) { setOpen(false); }
        });
        /* 드로어 안 링크 이동 시 잠금 해제 */
        mypage.querySelector('.mypage__side').addEventListener('click', function (e) {
            if (e.target.closest('a')) { setOpen(false); }
        });

        /* 버튼은 GNB 우측(프로필 옆)에, 딤은 본문에 (GNB 없으면 본문 폴백) */
        var utils = document.querySelector('.gnb__utils');
        if (utils) { utils.appendChild(btn); } else { mypage.appendChild(btn); }
        mypage.appendChild(dim);
    }

    /**
     * 스크롤 자동 로딩 (시청 기록·즐겨찾기 전체보기).
     * .js-more 컨테이너의 .js-more-item[hidden] 을 data-more-batch 개수만큼씩,
     * 하단 센티널(.js-more-sentinel)이 뷰포트에 가까워질 때마다 자동 공개한다.
     * 남은 항목이 없으면 스피너를 숨긴다. 버튼 없이 스크롤만으로 이어진다.
     * 실서비스에서는 reveal() 자리에서 다음 페이지 API 를 호출하면 된다.
     */
    function initLoadMore() {
        var wrap = document.querySelector('.js-more');
        if (!wrap) { return; }

        var batch = parseInt(wrap.getAttribute('data-more-batch'), 10) || 8;
        var sentinel = document.querySelector('.js-more-sentinel');

        function hiddenItems() { return wrap.querySelectorAll('.js-more-item[hidden]'); }
        function sync() {
            if (sentinel) { sentinel.hidden = !hiddenItems().length; }
        }
        function reveal() {
            Array.prototype.slice.call(hiddenItems(), 0, batch).forEach(function (el) { el.hidden = false; });
            sync();
        }
        /* 공개 후에도 센티널이 여전히 화면 근처면 다음 묶음을 이어서 공개 (넓은 화면 채움) */
        function maybeReveal() {
            if (!sentinel || !hiddenItems().length) { return; }
            var r = sentinel.getBoundingClientRect();
            if (r.top < window.innerHeight + 300) {
                reveal();
                window.requestAnimationFrame(maybeReveal);
            }
        }

        if (sentinel && window.IntersectionObserver) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { if (en.isIntersecting) { maybeReveal(); } });
            }, { rootMargin: '300px 0px' });
            io.observe(sentinel);
        } else {
            /* IntersectionObserver 미지원 : 전부 공개 */
            while (hiddenItems().length) { reveal(); }
        }
        sync();
    }

    /**
     * 프리미엄 구독 신청 페이지.
     * - 혜택 아이콘 렌더 · 플랜 카드 선택 · 약관 동의 시 CTA 활성
     * - "프리미엄 시작하기" → 완료 모달 + 데모 프리미엄 상태(body.is-premium) ON
     *   (localStorage 를 함께 갱신해 다른 페이지에서도 유지. 실서비스는 PG 결제 → 서버 구독 생성)
     */
    function initPremium() {
        var page = document.querySelector('.prem');
        if (!page) { return; }

        /* 혜택 아이콘 (페이월과 같은 라인 스타일) */
        var ICONS = {
            crown: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 8 4 3 4-6 4 6 4-3-1.4 9.5H5.4L4 8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6.5 20.5h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
            bolt: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
            hd: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 10v4M7.5 12h2.6M10.1 10v4M13.4 10v4h1.8a1.6 1.6 0 0 0 1.6-1.6v-.8a1.6 1.6 0 0 0-1.6-1.6h-1.8Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            devices: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="5" width="13" height="10" rx="1.8" stroke="currentColor" stroke-width="1.6"/><rect x="16.5" y="9" width="5" height="10" rx="1.4" stroke="currentColor" stroke-width="1.6"/><path d="M6 18h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
        };
        Array.prototype.forEach.call(page.querySelectorAll('.prem-bene__icon[data-icon]'), function (s) {
            s.innerHTML = ICONS[s.getAttribute('data-icon')] || '';
        });

        /* 플랜 카드 선택 표시 */
        var plans = page.querySelectorAll('.prem-plan');
        Array.prototype.forEach.call(plans, function (card) {
            card.querySelector('input').addEventListener('change', function () {
                Array.prototype.forEach.call(plans, function (c) {
                    c.classList.toggle('is-on', c.querySelector('input').checked);
                });
            });
        });

        /* 약관 동의 → CTA 활성 */
        var agree = page.querySelector('.js-prem-agree');
        var cta = page.querySelector('.js-prem-cta');
        if (agree && cta) {
            agree.addEventListener('change', function () { cta.disabled = !agree.checked; });
        }

        /* 이미 구독 중이면 안내 배너 노출 */
        var current = page.querySelector('.js-prem-current');
        if (current && document.body.classList.contains('is-premium')) { current.hidden = false; }

        /* 구독 시작 → 완료 모달 + 데모 프리미엄 ON */
        var modal = document.querySelector('.js-prem-modal');
        if (cta && modal) {
            cta.addEventListener('click', function () {
                var yearly = page.querySelector('input[name="plan"][value="yearly"]');
                var next = modal.querySelector('.js-prem-next');
                if (next) { next.textContent = (yearly && yearly.checked) ? '2027-07-30' : '2026-08-30'; }

                /* 데모 상태 반영 (initAuthDemo 와 같은 저장 키) */
                try { localStorage.setItem('vibuzz-demo-premium', '1'); } catch (e) { /* 무시 */ }
                document.body.classList.add('is-premium');
                setPremCancel(false);
                syncPlanLabels();
                syncPremiumEntries();
                Array.prototype.forEach.call(document.querySelectorAll('.gnb__demo-row[data-demo="premium"]'), function (row) {
                    row.classList.add('is-on');
                    var lbl = row.querySelector('.js-demo-label');
                    if (lbl) { lbl.textContent = '프리미엄 구독중'; }
                    var tog = row.querySelector('.js-demo-toggle');
                    if (tog) { tog.setAttribute('aria-checked', 'true'); }
                });
                if (current) { current.hidden = false; }

                modal.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            });
            modal.addEventListener('click', function (e) {
                if (e.target === modal) { modal.classList.remove('is-open'); document.body.style.overflow = ''; }
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.classList.contains('is-open')) { modal.classList.remove('is-open'); document.body.style.overflow = ''; }
            });
        }
    }

    /**
     * TOP 10 랭킹 숫자용 Gothic A1 숫자 글리프 프리로드.
     * 200px 대형 아웃라인 숫자라 폰트가 늦게 적용되면 형태 변화가 눈에 띈다.
     * (본문 등 나머지 텍스트는 모두 Pretendard)
     */
    function preloadRankDigits() {
        if (!document.fonts || typeof document.fonts.load !== 'function') { return; }
        if (!document.querySelector('.rank-card__num')) { return; }

        document.fonts.load('700 200px "Gothic A1"', '0123456789').catch(function () {
            /* 로드 실패 시 폴백 폰트(Pretendard)로 표시 - 치명적이지 않음 */
        });
    }

    /**
     * 회원 탈퇴.
     * - 삭제 항목 아이콘 렌더
     * - 사유 선택 + 유의사항 전체 동의 + 비밀번호 입력이 모두 채워져야 "탈퇴하기" 활성
     * - 탈퇴하기 → 최종 확인 모달 → 확인 → 완료 모달 (실제 처리는 백엔드 연동 지점)
     */
    function initWithdraw() {
        var page = document.querySelector('.js-withdraw');
        if (!page) { return; }

        /* 삭제 항목 아이콘 */
        var ICONS = {
            history: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            bookmark: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.2l-6.5-3.7-6.5 3.7V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
            subscribe: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9.5" cy="8" r="3.3" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 19.5c0-2.9 2.7-5 6-5s6 2.1 6 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16 5.2a3.3 3.3 0 0 1 0 6.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
            comment: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-5 3.5V6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
        };
        Array.prototype.forEach.call(document.querySelectorAll('.wd-lose__icon[data-wd-icon]'), function (s) {
            s.innerHTML = ICONS[s.getAttribute('data-wd-icon')] || '';
        });

        var reasons = page.querySelectorAll('.js-wd-reasons input');
        var agrees = page.querySelectorAll('.js-wd-agree');
        var allBox = page.querySelector('.js-wd-all');
        var pw = page.querySelector('.js-wd-password');
        var submit = page.querySelector('.js-wd-submit');

        function reasonPicked() {
            for (var i = 0; i < reasons.length; i++) { if (reasons[i].checked) { return true; } }
            return false;
        }
        function allAgreed() {
            for (var i = 0; i < agrees.length; i++) { if (!agrees[i].checked) { return false; } }
            return agrees.length > 0;
        }
        /* 제출 버튼 활성 조건 : 사유 + 전체 동의 + 비밀번호 */
        function refresh() {
            submit.disabled = !(reasonPicked() && allAgreed() && pw.value.trim().length > 0);
        }

        /*
         * 주의 : 폼 전체에 change/input 을 한 번에 걸면 안 된다.
         * 체크박스는 input 이 change 보다 먼저 발생하므로, 전체 동의를 눌렀을 때
         * 개별 항목이 반영되기 전에 allBox 가 다시 꺼져 버린다.
         * → 개별 항목 ↔ 전체 동의를 각각 명시적으로 연결한다.
         */
        function syncAllBox() {
            if (allBox) { allBox.checked = allAgreed(); }
            refresh();
        }
        Array.prototype.forEach.call(agrees, function (a) { a.addEventListener('change', syncAllBox); });
        if (allBox) {
            allBox.addEventListener('change', function () {
                Array.prototype.forEach.call(agrees, function (a) { a.checked = allBox.checked; });
                refresh();
            });
        }
        Array.prototype.forEach.call(reasons, function (r) { r.addEventListener('change', refresh); });
        if (pw) { pw.addEventListener('input', refresh); }

        /* 탈퇴하기 → 최종 확인 → 완료 */
        var confirmModal = document.querySelector('.js-wd-modal');
        var doneModal = document.querySelector('.js-wd-done');
        function open(m) { m.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
        function close(m) { m.classList.remove('is-open'); document.body.style.overflow = ''; }

        if (submit && confirmModal) {
            submit.addEventListener('click', function () { if (!submit.disabled) { open(confirmModal); } });
            var cancel = confirmModal.querySelector('.js-wd-cancel');
            if (cancel) { cancel.addEventListener('click', function () { close(confirmModal); }); }
            confirmModal.addEventListener('click', function (e) { if (e.target === confirmModal) { close(confirmModal); } });

            var ok = confirmModal.querySelector('.js-wd-confirm');
            if (ok && doneModal) {
                ok.addEventListener('click', function () {
                    // TODO: 서버에 탈퇴 요청 후 세션 종료
                    close(confirmModal);
                    open(doneModal);
                });
            }
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && confirmModal.classList.contains('is-open')) { close(confirmModal); }
            });
        }

        refresh();
    }

    /**
     * 아이디 찾기 / 비밀번호 재설정.
     * 탭 전환 + 인증번호 발송(타이머) + 단계 이동. 실제 발송·검증은 백엔드 연동 지점.
     */
    function initAccountFind() {
        var page = document.querySelector('.js-find');
        if (!page) { return; }

        /* 탭 */
        function showPanel(key) {
            Array.prototype.forEach.call(page.querySelectorAll('.find__tab'), function (t) {
                var on = t.getAttribute('data-find-tab') === key;
                t.classList.toggle('is-active', on);
                t.setAttribute('aria-selected', String(on));
            });
            Array.prototype.forEach.call(page.querySelectorAll('[data-find-panel]'), function (p) {
                p.hidden = p.getAttribute('data-find-panel') !== key;
            });
        }
        Array.prototype.forEach.call(page.querySelectorAll('.find__tab'), function (t) {
            t.addEventListener('click', function () { showPanel(t.getAttribute('data-find-tab')); });
        });
        if (location.hash === '#pw') { showPanel('pw'); }

        /* 패널별 : 인증번호 발송 → 코드 입력 → 다음 */
        Array.prototype.forEach.call(page.querySelectorAll('[data-find-panel]'), function (panel) {
            var send = panel.querySelector('.js-find-send');
            var codeBox = panel.querySelector('.js-find-code');
            var codeInput = panel.querySelector('.js-find-code-input');
            var timerEl = panel.querySelector('.js-find-timer');
            var next = panel.querySelector('.js-find-next');
            var contact = panel.querySelector('.js-find-contact');
            var timer = null;

            /*
             * 인증 방법(휴대폰 / 이메일) 전환 → 아래 입력 필드를 함께 바꾼다.
             * 라벨은 for 속성으로 찾으므로 마크업에 별도 훅이 필요 없다.
             */
            var methods = panel.querySelectorAll('input[name$="-method"]');
            var contactLabel = contact ? panel.querySelector('label[for="' + contact.id + '"]') : null;
            var FIELD = {
                phone: { label: '휴대폰 번호', type: 'tel', ph: '“-” 없이 입력' },
                email: { label: '이메일 주소', type: 'email', ph: 'example@vibuzz.kr' }
            };
            function applyMethod(key) {
                var f = FIELD[key] || FIELD.phone;
                if (contactLabel) { contactLabel.textContent = f.label; }
                if (contact) {
                    contact.type = f.type;
                    contact.placeholder = f.ph;
                    contact.value = '';
                }
                /* 대상이 바뀌었으므로 진행 중이던 인증은 초기화 */
                window.clearInterval(timer);
                if (codeBox) { codeBox.hidden = true; }
                if (codeInput) { codeInput.value = ''; }
                if (timerEl) { timerEl.textContent = '03:00'; }
                if (send) { send.textContent = '인증번호 받기'; }
                if (next) { next.disabled = true; }
            }
            Array.prototype.forEach.call(methods, function (m) {
                m.addEventListener('change', function () { if (m.checked) { applyMethod(m.value); } });
            });

            function startTimer() {
                var left = 180;
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    left -= 1;
                    if (left <= 0) { window.clearInterval(timer); left = 0; }
                    var m = Math.floor(left / 60), s = left % 60;
                    if (timerEl) { timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s; }
                }, 1000);
            }
            if (send) {
                send.addEventListener('click', function () {
                    if (contact && !contact.value.trim()) { contact.focus(); return; }
                    if (codeBox) { codeBox.hidden = false; }
                    send.textContent = '재발송';
                    startTimer();
                    if (codeInput) { codeInput.focus(); }
                });
            }
            if (codeInput && next) {
                codeInput.addEventListener('input', function () {
                    codeInput.value = codeInput.value.replace(/[^0-9]/g, '');
                    next.disabled = codeInput.value.length < 6;
                });
            }

            /* 단계 이동 */
            var steps = panel.querySelectorAll('.js-find-step');
            function goStep(n) {
                window.clearInterval(timer);
                Array.prototype.forEach.call(steps, function (st) {
                    st.hidden = st.getAttribute('data-step') !== String(n);
                });
                window.scrollTo(0, 0);
            }
            if (next) { next.addEventListener('click', function () { if (!next.disabled) { goStep(2); } }); }

            /* 비밀번호 재설정 : 새 비밀번호 입력 → 완료 */
            var pw = panel.querySelector('.js-find-pw');
            var pw2 = panel.querySelector('.js-find-pw2');
            var err = panel.querySelector('.js-find-pw-error');
            var reset = panel.querySelector('.js-find-reset');
            if (pw && pw2 && reset) {
                var checkPw = function () {
                    var ok = pw.value.length >= 8 && pw.value === pw2.value;
                    var mismatch = pw2.value.length > 0 && pw.value !== pw2.value;
                    if (err) { err.hidden = !mismatch; }
                    reset.disabled = !ok;
                };
                pw.addEventListener('input', checkPw);
                pw2.addEventListener('input', checkPw);
                reset.addEventListener('click', function () { if (!reset.disabled) { goStep(3); } });
            }
        });

        /* 아이디 찾기 결과 → 비밀번호 재설정 탭으로 */
        var toPw = page.querySelector('.js-find-topw');
        if (toPw) { toPw.addEventListener('click', function () { showPanel('pw'); window.scrollTo(0, 0); }); }
    }

    /**
     * 알림함 : 탭 필터 + 읽음 처리.
     * 실서비스에서는 읽음 처리 API 호출 후 상태를 갱신한다.
     */
    function initNotifications() {
        var list = document.querySelector('.js-noti-list');
        if (!list) { return; }

        /* 알림 유형 아이콘 */
        var ICONS = {
            upload: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.8" y="7" width="13" height="10" rx="2.4" stroke="currentColor" stroke-width="1.7"/><path d="M15.8 11.2 21 8.6v6.8l-5.2-2.6" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
            comment: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-5 3.5V6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
            heart: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
            notice: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v4a1 1 0 0 0 1 1h3l8 4.5V5.5L8 10H5a1 1 0 0 0-1 1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
            check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            point: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.4" stroke="currentColor" stroke-width="1.7"/><path d="M10.2 16V8.4h2.6a2.4 2.4 0 0 1 0 4.8h-2.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
        Array.prototype.forEach.call(list.querySelectorAll('.noti__icon[data-noti-icon]'), function (s) {
            s.innerHTML = ICONS[s.getAttribute('data-noti-icon')] || ICONS.notice;
        });

        /* 탭 필터 */
        var empty = document.querySelector('.js-noti-empty');
        Array.prototype.forEach.call(document.querySelectorAll('.noti__tab'), function (tab) {
            tab.addEventListener('click', function () {
                var key = tab.getAttribute('data-noti-tab');
                Array.prototype.forEach.call(document.querySelectorAll('.noti__tab'), function (t) {
                    var on = t === tab;
                    t.classList.toggle('is-active', on);
                    t.setAttribute('aria-selected', String(on));
                });
                var shown = 0;
                Array.prototype.forEach.call(list.querySelectorAll('.noti__item'), function (li) {
                    var ok = key === 'all' || li.getAttribute('data-noti-group') === key;
                    li.hidden = !ok;
                    if (ok) { shown += 1; }
                });
                list.hidden = shown === 0;
                if (empty) { empty.hidden = shown !== 0; }
            });
        });

        /* 모두 읽음 */
        var readAll = document.querySelector('.js-noti-read-all');
        if (readAll) {
            readAll.addEventListener('click', function () {
                Array.prototype.forEach.call(list.querySelectorAll('.noti__item.is-unread'), function (li) {
                    li.classList.remove('is-unread');
                    var dot = li.querySelector('.noti__dot');
                    if (dot) { dot.remove(); }
                });
                var badge = document.querySelector('.noti__unread');
                if (badge) { badge.remove(); }
                var bellDot = document.querySelector('.gnb__bell-dot');
                if (bellDot) { bellDot.remove(); }
            });
        }
    }

    /* ---------- 프리미엄 구독 상태 ----------
       해지해도 남은 이용 기간 동안 혜택이 유지되므로(약관 기준), 즉시 해지가 아니라
       "해지 예약" 상태를 따로 둔다. 실서비스에서는 서버의 구독 상태(cancel_at_period_end)로 대체. */
    var PREM_CANCEL_KEY = 'vibuzz-demo-premium-cancel';
    var PREM_END = '2026-08-02';                 /* 데모 : 남은 이용 기간 만료일 */
    function isPremium() { return document.body.classList.contains('is-premium'); }
    function premCancelScheduled() {
        try { return localStorage.getItem(PREM_CANCEL_KEY) === '1'; } catch (e) { return false; }
    }
    function setPremCancel(on) {
        try { localStorage.setItem(PREM_CANCEL_KEY, on ? '1' : '0'); } catch (e) { /* 프라이빗 모드 - 무시 */ }
    }
    function syncPlanLabels() {
        var txt = !isPremium() ? 'Free' : (premCancelScheduled() ? 'Premium · 해지 예약' : 'Premium');
        Array.prototype.forEach.call(document.querySelectorAll('.js-plan-label'), function (el) {
            el.textContent = txt;
        });
    }

    /**
     * 프리미엄 구독 해지 (진입점 + 확인 팝업).
     * 진입점은 페이지 마크업을 고치지 않고 JS 로 붙인다.
     *   프리미엄 페이지 : 구독중 배너 안 "구독 해지"
     *   마이페이지      : 회원정보 "구독 내용" 행 옆 "해지" / "해지 취소" / "구독하기"
     */
    var premCancelModal = null;
    var PREM_LOSE = ['프리미엄 전용 콘텐츠', '광고 없이 시청', '1080P 고화질 · 여러 기기 동시 시청', '신작 먼저보기'];
    var PREM_REASONS = ['가격이 부담돼요', '볼 만한 콘텐츠가 부족해요', '자주 이용하지 않아요', '다른 서비스를 이용해요', '잠시 쉬어가려고요', '기타'];
    /* 텍스트는 항상 textContent 로 넣는 작은 생성 헬퍼 */
    function pel(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) { n.className = cls; }
        if (text !== undefined && text !== null) { n.textContent = String(text); }
        return n;
    }

    function buildPremCancelModal() {
        if (premCancelModal) { return premCancelModal; }
        var m = document.createElement('div');
        m.className = 'modal js-premc-modal';
        m.id = 'modal-prem-cancel';
        m.setAttribute('role', 'dialog');
        m.setAttribute('aria-modal', 'true');
        m.innerHTML =
            '<div class="modal__box modal__box--notice">' +
                '<div class="js-premc-form">' +
                    '<div class="modal__head">' +
                        '<h2 class="modal__title">프리미엄 구독을 해지할까요?</h2>' +
                        '<button type="button" class="modal__close js-premc-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
                    '</div>' +
                    '<p class="premc__keep">해지해도 <strong>' + PREM_END + '</strong> 까지는 프리미엄 혜택을 그대로 이용할 수 있어요. 그 이후 자동으로 일반 회원이 됩니다.</p>' +
                    '<span class="report__label">해지하면 사라지는 혜택</span>' +
                    '<ul class="premc__lose"></ul>' +
                    '<span class="report__label">해지 사유<span class="req">*</span></span>' +
                    '<div class="report__reasons js-premc-reasons" role="radiogroup" aria-label="해지 사유"></div>' +
                    '<span class="report__label">더 하고 싶은 말</span>' +
                    '<textarea class="report__detail js-premc-detail" maxlength="300" placeholder="서비스 개선에 참고할게요. (선택)"></textarea>' +
                    '<div class="modal__actions modal__actions--split">' +
                        '<button type="button" class="btn btn--primary js-premc-close">구독 유지</button>' +
                        '<button type="button" class="btn btn--danger js-premc-submit" disabled>해지하기</button>' +
                    '</div>' +
                '</div>' +
                '<div class="report__done js-premc-done" hidden>' +
                    '<span class="report__done-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
                    '<p class="report__done-title">해지가 예약되었습니다</p>' +
                    '<p class="report__done-desc"><strong>' + PREM_END + '</strong> 까지 프리미엄 혜택이 유지되며,<br>그 전까지는 언제든 해지를 취소할 수 있어요.</p>' +
                    '<div class="modal__actions"><button type="button" class="btn btn--primary js-premc-close">확인</button></div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(m);
        premCancelModal = m;

        var loseList = m.querySelector('.premc__lose');
        PREM_LOSE.forEach(function (t) { loseList.appendChild(pel('li', null, t)); });

        var reasonBox = m.querySelector('.js-premc-reasons');
        var submit = m.querySelector('.js-premc-submit');
        PREM_REASONS.forEach(function (r) {
            var lb = pel('label', 'report__reason');
            var input = document.createElement('input');
            input.type = 'radio';
            input.name = 'premc-reason';
            input.value = r;
            input.addEventListener('change', function () { submit.disabled = false; });
            var radio = pel('span', 'report__radio');
            lb.appendChild(input);
            lb.appendChild(radio);
            lb.appendChild(pel('span', 'report__reason-text', r));
            reasonBox.appendChild(lb);
        });

        function close() { m.classList.remove('is-open'); document.body.style.overflow = ''; }
        Array.prototype.forEach.call(m.querySelectorAll('.js-premc-close'), function (b) { b.addEventListener('click', close); });
        m.addEventListener('click', function (e) { if (e.target === m) { close(); } });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && m.classList.contains('is-open')) { close(); }
        });
        submit.addEventListener('click', function () {
            /* 실서비스 연동 지점 : 구독 해지 예약 API 호출 */
            setPremCancel(true);
            syncPlanLabels();
            syncPremiumEntries();
            m.querySelector('.js-premc-form').hidden = true;
            m.querySelector('.js-premc-done').hidden = false;
        });
        return m;
    }
    function openPremCancel() {
        var m = buildPremCancelModal();
        var form = m.querySelector('.js-premc-form');
        var submit = m.querySelector('.js-premc-submit');
        Array.prototype.forEach.call(m.querySelectorAll('.js-premc-reasons input'), function (i) { i.checked = false; });
        m.querySelector('.js-premc-detail').value = '';
        submit.disabled = true;
        form.hidden = false;
        m.querySelector('.js-premc-done').hidden = true;
        m.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    /* 진입점 버튼 주입 · 상태에 맞춰 문구 갱신 */
    function syncPremiumEntries() {
        /* (1) 프리미엄 페이지 : 구독중 배너 */
        var banner = document.querySelector('.js-prem-current');
        if (banner) {
            var scheduled = premCancelScheduled();
            banner.hidden = !isPremium();
            var msg = banner.querySelector('.js-premc-msg');
            if (!msg) {
                banner.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                msg = pel('span', 'js-premc-msg');
                banner.appendChild(msg);
                var act = pel('button', 'premc-btn js-premc-open');
                act.type = 'button';
                banner.appendChild(act);
                act.addEventListener('click', function () { premEntryAction(); });
            }
            msg.innerHTML = '';
            if (scheduled) {
                msg.appendChild(document.createTextNode('해지가 예약되어 있습니다. '));
                var s1 = document.createElement('strong');
                s1.textContent = PREM_END;
                msg.appendChild(s1);
                msg.appendChild(document.createTextNode(' 까지 이용할 수 있어요.'));
            } else {
                msg.appendChild(document.createTextNode('이미 프리미엄 구독 중입니다. 다음 결제일은 '));
                var s2 = document.createElement('strong');
                s2.textContent = PREM_END;
                msg.appendChild(s2);
                msg.appendChild(document.createTextNode(' 입니다.'));
            }
            var btn = banner.querySelector('.js-premc-open');
            if (btn) {
                btn.textContent = scheduled ? '해지 취소' : '구독 해지';
                btn.classList.toggle('premc-btn--keep', scheduled);
            }
        }

        /* (2) 마이페이지 회원정보 : "구독 내용" 행을 구독 카드로 구성한다.
           .js-plan-label 은 다른 코드도 참조하므로 지우지 않고 카드 안으로 옮긴다. */
        var plan = document.querySelector('.mypage__field--plain .mypage__field-plan');
        if (plan) {
            var row = plan.closest('.mypage__field--plain');
            var card = row.querySelector('.subcard');
            if (!card) {
                card = pel('div', 'subcard');
                var main = pel('div', 'subcard__main');
                var badge = pel('span', 'subcard__badge');
                main.appendChild(badge);
                row.insertBefore(card, plan);
                main.appendChild(plan);          /* 기존 라벨 노드를 그대로 재사용 */
                card.appendChild(main);
                card.appendChild(pel('p', 'subcard__meta'));
                var act = pel('button', 'subcard__action js-premc-open');
                act.type = 'button';
                act.addEventListener('click', function () { premEntryAction(); });
                card.appendChild(act);
            }
            var scheduled2 = premCancelScheduled();
            var badgeEl = card.querySelector('.subcard__badge');
            var metaEl = card.querySelector('.subcard__meta');
            var actEl = card.querySelector('.subcard__action');

            card.classList.toggle('is-premium', isPremium());
            card.classList.toggle('is-ending', isPremium() && scheduled2);
            badgeEl.textContent = isPremium() ? 'PREMIUM' : 'FREE';

            if (!isPremium()) {
                metaEl.textContent = '무료로 이용 중이에요. 프리미엄으로 전용 콘텐츠를 열어보세요.';
                actEl.textContent = '구독하기';
            } else if (scheduled2) {
                metaEl.textContent = PREM_END + ' 이후 자동으로 일반 회원이 됩니다.';
                actEl.textContent = '해지 취소';
            } else {
                metaEl.textContent = '다음 결제일 ' + PREM_END + ' · 월 14,900원';
                actEl.textContent = '구독 해지';
            }
            actEl.className = 'subcard__action js-premc-open' +
                (!isPremium() ? ' subcard__action--go' : (scheduled2 ? ' subcard__action--keep' : ' subcard__action--cancel'));
        }
    }
    /* 진입점 공통 동작 : 미구독=구독 페이지로, 구독중=해지 팝업, 해지 예약=즉시 철회 */
    function premEntryAction() {
        if (!isPremium()) {
            /* 프리뷰(preview-premium.html)와 블레이드(/premium) 경로가 달라 페이지의 기존 링크를 재사용한다 */
            var link = document.querySelector('.mypage__subscribe, .mydash-card[href*="premium"]');
            location.href = link ? link.getAttribute('href') : 'preview-premium.html';
            return;
        }
        if (premCancelScheduled()) {
            setPremCancel(false);
            syncPlanLabels();
            syncPremiumEntries();
            return;
        }
        openPremCancel();
    }
    function initPremiumCancel() {
        syncPlanLabels();
        syncPremiumEntries();
    }

    /**
     * 업로드 화면 : 승인중(데뷔) 단계면 몇 편을 더 올려야 하는지 알려준다.
     * 편수는 스튜디오의 데뷔 진행 카드와 같은 기준(3편)을 쓴다.
     */
    var DEBUT_TOTAL = 3;
    var DEBUT_DONE = 1;      /* 시안 값 · 실서비스에서는 서버가 내려준다 */
    function initUploadDebut() {
        var page = document.querySelector('.upload');
        if (!page || page.querySelector('.upload__debut')) { return; }
        var title = page.querySelector('.upload__title');
        if (!title) { return; }

        var left = Math.max(DEBUT_TOTAL - DEBUT_DONE, 0);
        var box = pel('div', 'upload__debut');
        box.appendChild(pel('span', 'upload__debut-badge', '승인중'));

        var text = pel('p', 'upload__debut-text');
        text.appendChild(document.createTextNode('데뷔 영상을 '));
        var s = document.createElement('strong');
        s.textContent = left + '편';
        text.appendChild(s);
        text.appendChild(document.createTextNode(' 더 올리면 최종 검토가 시작돼요. 총 ' + DEBUT_TOTAL + '편이 필요합니다.'));
        box.appendChild(text);

        var track = pel('span', 'upload__debut-track');
        var fill = pel('span', 'upload__debut-fill');
        fill.style.width = Math.round(DEBUT_DONE / DEBUT_TOTAL * 100) + '%';
        track.appendChild(fill);
        box.appendChild(track);
        box.appendChild(pel('span', 'upload__debut-count', DEBUT_DONE + '/' + DEBUT_TOTAL));

        title.insertAdjacentElement('afterend', box);
    }

    /**
     * 크리에이터 스튜디오 : 승인 단계에 맞춰 화면을 맞춘다.
     * 정식 승인 전에는 구독자·조회수·수익 같은 아직 존재할 수 없는 수치를 감추고(CSS),
     * 배지와 채널 메타를 단계에 맞는 문구로 바꾼다.
     *   승인 대기(is-applied) : 심사 안내만 · 배지 "승인 대기"
     *   승인중(is-debut)      : 데뷔 영상 안내 · 배지 "승인중"
     *   크리에이터(is-creator): 지표 · 성과 패널 전체 노출
     */
    function initStudioStage() {
        var body = document.body;
        if (!body.classList.contains('is-applied') && !body.classList.contains('is-debut') && !body.classList.contains('is-creator')) { return; }
        var stage = body.classList.contains('is-creator') ? 'creator'
            : (body.classList.contains('is-debut') ? 'debut' : 'applied');

        /* 스튜디오 하위 메뉴 게이트 — 사이드바는 마이페이지 전 화면이 공유하므로 먼저 처리한다.
           승인 대기 = 내 채널 관리만 / 승인중 = + 콘텐츠 관리 / 크리에이터 = 전부 */
        var ALLOW = {
            applied: ['내 채널 관리'],
            debut: ['내 채널 관리', '콘텐츠 관리'],
            creator: null            /* null = 전부 노출 */
        };
        var allow = ALLOW[stage];
        Array.prototype.forEach.call(document.querySelectorAll('.mypage__side-sub a'), function (a) {
            a.hidden = !!allow && allow.indexOf(a.textContent.trim()) < 0;
        });

        /* 메뉴에서 감춘 화면은 주소로 직접 들어와도 막는다(성인·프리미엄 게이트와 같은 방식) */
        var PAGE_MENU = [
            { re: /studio-revenue|\/studio\/revenue/, menu: '수익 관리' },
            { re: /studio-comments|\/studio\/comments/, menu: '댓글 관리' },
            { re: /studio-content|\/studio\/content/, menu: '콘텐츠 관리' }
        ];
        if (allow) {
            for (var i = 0; i < PAGE_MENU.length; i++) {
                if (PAGE_MENU[i].re.test(location.pathname) && allow.indexOf(PAGE_MENU[i].menu) < 0) {
                    location.replace(/\.html$/.test(location.pathname) ? 'preview-studio.html' : '/studio');
                    return;
                }
            }
        }

        var host = document.querySelector('.mypage__content--studio');
        if (!host) { return; }

        /* 채널 프로필 배지 */
        var badge = host.querySelector('.studio__creator-badge');
        if (badge) {
            var BADGE = { creator: '크리에이터', debut: '승인중', applied: '승인 대기' };
            badge.textContent = BADGE[stage];
            badge.className = 'studio__creator-badge' +
                (stage === 'debut' ? ' studio__creator-badge--review' : (stage === 'applied' ? ' studio__creator-badge--wait' : ''));
        }

        /* 채널 메타 · 액션 : 채널이 공개되기 전에는 구독자/영상 수와 "채널 보기"가 성립하지 않는다 */
        var meta = host.querySelector('.studio__channel-meta');
        if (meta) {
            if (!meta.getAttribute('data-full')) { meta.setAttribute('data-full', meta.textContent); }
            var handle = (meta.getAttribute('data-full') || '').split('·')[0].trim();
            meta.textContent = stage === 'creator' ? meta.getAttribute('data-full')
                : handle + ' · ' + (stage === 'debut' ? '공개 준비 중' : '심사 대기 중');
        }
        Array.prototype.forEach.call(host.querySelectorAll('.studio__channel-actions .btn'), function (b) {
            if (/채널 보기/.test(b.textContent)) { b.hidden = stage !== 'creator'; }
        });

        /* 승인 대기 안내 블록 (없으면 만들어 채널 프로필 앞에 둔다) */
        if (!host.querySelector('.studio__stage')) {
            var box = pel('section', 'studio__stage');
            box.setAttribute('aria-label', '심사 진행 안내');
            var info = pel('div', 'studio__stage-info');
            info.appendChild(pel('span', 'studio__stage-badge', '승인 대기'));
            info.appendChild(pel('h3', 'studio__stage-title', '서류 · 계정 심사가 진행 중이에요'));
            info.appendChild(pel('p', 'studio__stage-desc', '심사가 끝나면 데뷔 영상을 올릴 수 있어요. 결과는 3영업일 이내에 이메일과 알림으로 안내드립니다.'));
            box.appendChild(info);
            var go = pel('a', 'btn btn--primary studio__stage-btn', '진행 상황 보기');
            go.href = /\.html$/.test(location.pathname) ? 'preview-creator-applied.html' : '/creator/applied';
            box.appendChild(go);
            /* 항상 화면 맨 위(제목 바로 아래)에 둔다.
               채널 편집처럼 .studio__channel 이 없는 화면에서 맨 아래로 밀리지 않도록 제목을 기준으로 잡는다. */
            var title = host.querySelector('.studio__title');
            if (title) { title.insertAdjacentElement('afterend', box); }
            else { host.insertBefore(box, host.firstChild); }
        }
    }

    /**
     * 신고 (회원 · 콘텐츠 · 댓글 공용 모달).
     * 신고 버튼/메뉴에 data-report-type(member|content|comment), data-report-target 를 달면 열린다.
     * 모달 마크업은 JS 로 주입하므로 페이지별 마크업 수정이 필요 없다.
     */
    function initReport() {
        if (document.querySelector('.js-report-modal')) { return; }

        var REASONS = {
            member: ['욕설·비방·혐오 표현', '스팸·광고 도배', '사칭·명의 도용', '개인정보 노출', '기타'],
            creator: ['타인 사칭·명의 도용', '저작권·초상권 침해', '유해·불법 콘텐츠 반복 게시', '조회수·구독 조작 등 어뷰징', '욕설·비방·혐오 표현', '기타'],
            content: ['저작권 침해', '선정적·불쾌한 콘텐츠', '폭력적·위험한 콘텐츠', '허위 정보', '스팸·광고', '기타'],
            comment: ['욕설·비방', '스팸·광고', '스포일러', '개인정보 노출', '기타']
        };
        var TITLES = { member: '회원 신고', creator: '크리에이터 신고', content: '콘텐츠 신고', comment: '댓글 신고' };

        var modal = document.createElement('div');
        modal.className = 'modal js-report-modal';
        modal.id = 'modal-report';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML =
            '<div class="modal__box">' +
                '<div class="js-report-form">' +
                    '<div class="modal__head">' +
                        '<h2 class="modal__title js-report-title">신고</h2>' +
                        '<button type="button" class="modal__close js-report-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
                    '</div>' +
                    '<p class="report__target js-report-target"></p>' +
                    '<span class="report__label">신고 사유<span class="req">*</span></span>' +
                    '<div class="report__reasons js-report-reasons" role="radiogroup" aria-label="신고 사유"></div>' +
                    '<span class="report__label">상세 내용</span>' +
                    '<textarea class="report__detail js-report-detail" maxlength="500" placeholder="구체적인 상황을 적어주시면 처리에 도움이 됩니다. (선택)"></textarea>' +
                    '<p class="report__notice">허위 신고가 반복되면 서비스 이용이 제한될 수 있습니다. 접수된 신고는 운영정책에 따라 검토 후 처리됩니다.</p>' +
                    '<div class="modal__actions modal__actions--split">' +
                        '<button type="button" class="btn btn--ghost js-report-close">취소</button>' +
                        '<button type="button" class="btn btn--primary js-report-submit" disabled>신고하기</button>' +
                    '</div>' +
                '</div>' +
                '<div class="report__done js-report-done" hidden>' +
                    '<span class="report__done-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
                    '<p class="report__done-title">신고가 접수되었습니다</p>' +
                    '<p class="report__done-desc">검토 후 운영정책에 따라 처리하며,<br>결과는 알림으로 안내드립니다.</p>' +
                    '<p class="report__done-hint js-report-blockhint" hidden>이 사용자를 더 보고 싶지 않다면 차단할 수 있어요.</p>' +
                    '<div class="modal__actions modal__actions--split">' +
                        '<button type="button" class="btn btn--ghost js-report-block" hidden>차단하기</button>' +
                        '<button type="button" class="btn btn--primary js-report-close">확인</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        var titleEl = modal.querySelector('.js-report-title');
        var targetEl = modal.querySelector('.js-report-target');
        var reasonBox = modal.querySelector('.js-report-reasons');
        var detail = modal.querySelector('.js-report-detail');
        var submit = modal.querySelector('.js-report-submit');
        var form = modal.querySelector('.js-report-form');
        var done = modal.querySelector('.js-report-done');

        var blockWho = '';
        function open(type, target, who) {
            var kind = REASONS[type] ? type : 'content';
            blockWho = who || '';
            titleEl.textContent = TITLES[kind];
            targetEl.innerHTML = '';
            targetEl.appendChild(document.createTextNode('신고 대상'));
            var strong = document.createElement('strong');
            strong.textContent = target || '(대상 정보 없음)';
            targetEl.appendChild(strong);

            reasonBox.innerHTML = '';
            REASONS[kind].forEach(function (r, i) {
                var lb = document.createElement('label');
                lb.className = 'report__reason';
                var input = document.createElement('input');
                input.type = 'radio';
                input.name = 'report-reason';
                input.value = r;
                input.addEventListener('change', function () { submit.disabled = false; });
                var radio = document.createElement('span');
                radio.className = 'report__radio';
                var text = document.createElement('span');
                text.className = 'report__reason-text';
                text.textContent = r;
                lb.appendChild(input);
                lb.appendChild(radio);
                lb.appendChild(text);
                reasonBox.appendChild(lb);
            });

            detail.value = '';
            submit.disabled = true;
            form.hidden = false;
            done.hidden = true;
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
        function close() { modal.classList.remove('is-open'); document.body.style.overflow = ''; }

        Array.prototype.forEach.call(modal.querySelectorAll('.js-report-close'), function (b) { b.addEventListener('click', close); });
        modal.addEventListener('click', function (e) { if (e.target === modal) { close(); } });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) { close(); }
        });
        var blockBtn = modal.querySelector('.js-report-block');
        var blockHint = modal.querySelector('.js-report-blockhint');
        submit.addEventListener('click', function () {
            // TODO: 신고 접수 API 호출
            form.hidden = true;
            done.hidden = false;
            /* 사람을 대상으로 한 신고에만 차단을 함께 제안한다 */
            var offer = !!blockWho && !isBlocked(blockWho);
            if (blockBtn) { blockBtn.hidden = !offer; }
            if (blockHint) { blockHint.hidden = !offer; }
        });
        if (blockBtn) {
            blockBtn.addEventListener('click', function () {
                setBlocked(blockWho, true);
                close();
            });
        }

        /* 신고 버튼 · 댓글 메뉴의 "신고하기" 를 이벤트 위임으로 처리 */
        document.addEventListener('click', function (e) {
            var t = e.target.closest ? e.target.closest('[data-report-type]') : null;
            if (t) {
                e.preventDefault();
                var rt = t.getAttribute('data-report-type');
                var rg = t.getAttribute('data-report-target');
                open(rt, rg, (rt === 'creator' || rt === 'member') ? rg : '');
                return;
            }
            /* 기존 댓글 메뉴 : 텍스트가 "신고하기" 인 버튼 */
            var btn = e.target.closest ? e.target.closest('.comment__menu button, .comment__menu a') : null;
            if (btn && btn.textContent.trim() === '신고하기') {
                e.preventDefault();
                var c = btn.closest('.comment');
                var who = c ? (c.querySelector('.comment__name') || {}).textContent : '';
                open('comment', (who || '').trim() + '님의 댓글', (who || '').trim());
            }
        });
    }

    /**
     * 채널 탭 (홈 · 동영상 · 재생목록 · 정보).
     * 서버 라우팅 없이 한 페이지 안에서 섹션 표시/숨김만 전환한다.
     * 탭은 data-ch-tab 으로 구분하고, 없으면 순서(홈·동영상·재생목록·정보)로 대체한다.
     */
    function initChannelTabs() {
        var tabsBox = document.querySelector('.channel__tabs');
        if (!tabsBox) { return; }
        var tabs = tabsBox.querySelectorAll('.cs-tab');
        if (!tabs.length) { return; }
        var root = tabsBox.closest('.channel') || document;
        var ORDER = ['home', 'videos', 'playlists', 'info'];

        /* 섹션마다 "어느 탭에서 보일지" 를 매긴다 */
        var panels = [];
        function add(node, keys) { if (node) { panels.push({ node: node, keys: keys }); } }
        add(root.querySelector('.channel__featured'), ['home']);
        Array.prototype.forEach.call(root.querySelectorAll('.section--poster'), function (s) {
            add(s, ['home', 'videos']);
        });
        var playlists = root.querySelector('.channel__playlists');
        add(playlists ? playlists.closest('.section') : null, ['home', 'playlists']);
        add(root.querySelector('#channel-info'), ['home', 'info']);
        if (!panels.length) { return; }

        function keyOf(tab, i) { return tab.getAttribute('data-ch-tab') || ORDER[i] || 'home'; }
        function show(key) {
            Array.prototype.forEach.call(tabs, function (t, i) {
                var on = keyOf(t, i) === key;
                t.classList.toggle('is-active', on);
                t.setAttribute('aria-selected', String(on));
            });
            panels.forEach(function (p) { p.node.hidden = p.keys.indexOf(key) < 0; });
        }
        Array.prototype.forEach.call(tabs, function (t, i) {
            t.addEventListener('click', function () { show(keyOf(t, i)); });
        });

        /* 태그라인의 "더보기" 는 채널 정보로 보낸다 */
        var more = root.querySelector('.channel__more');
        if (more) { more.addEventListener('click', function () { show('info'); }); }

        var active = tabsBox.querySelector('.cs-tab.is-active');
        show(active ? keyOf(active, Array.prototype.indexOf.call(tabs, active)) : 'home');
    }

    /**
     * 신고 진입점 주입 (콘텐츠 · 크리에이터).
     * 페이지마다 마크업을 고치지 않고 액션 줄 · 채널 줄 · 숏폼 레일에 진입점을 만든다.
     * 팝업 자체는 initReport() 가 만든 공용 모달이 data-report-type 위임으로 연다.
     *
     *   콘텐츠 상세 · 시청 · 라이브 : 액션 줄 끝 "신고하기" 버튼
     *   시청 · 라이브             : 채널 줄 더보기(⋯) → 크리에이터 신고
     *   채널                      : 구독 줄 더보기(⋯) → 크리에이터 신고
     *   숏폼 플레이어             : 레일에 이미 있는 더보기 버튼 → 콘텐츠·크리에이터 신고
     */
    /* ---------- 사용자 차단 ----------
       신고가 "운영자에게 알리는 것"이라면 차단은 "내 화면에서 지우는 것"이다.
       차단하면 그 사용자의 댓글이 내 화면에서 가려지고, 언제든 목록에서 해제할 수 있다.
       실서비스에서는 계정별 차단 목록 API 로 대체한다. */
    var BLOCK_KEY = 'vibuzz-blocked';
    function readBlocked() {
        var arr;
        try {
            var raw = localStorage.getItem(BLOCK_KEY);
            arr = raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
        if (Object.prototype.toString.call(arr) !== '[object Array]') { return []; }
        var seen = {};
        var out = [];
        arr.forEach(function (v) {
            if (typeof v !== 'string') { return; }
            var name = v.trim();
            if (!name || seen[name]) { return; }
            seen[name] = true;
            out.push(name);
        });
        return out;
    }
    function writeBlocked(list) {
        try { localStorage.setItem(BLOCK_KEY, JSON.stringify(list)); } catch (e) { /* 프라이빗 모드 - 무시 */ }
    }
    function isBlocked(name) { return readBlocked().indexOf((name || '').trim()) >= 0; }
    function setBlocked(name, on) {
        var who = (name || '').trim();
        if (!who) { return; }
        var list = readBlocked();
        var i = list.indexOf(who);
        if (on && i < 0) { list.push(who); }
        if (!on && i >= 0) { list.splice(i, 1); }
        writeBlocked(list);
        applyBlocked();
    }

    /* 차단한 사용자의 댓글을 가린다. 완전히 지우지 않고 "보기"로 펼 수 있게 남긴다. */
    function applyBlocked() {
        var list = readBlocked();
        Array.prototype.forEach.call(document.querySelectorAll('.comment'), function (c) {
            var nameEl = c.querySelector('.comment__name');
            var who = nameEl ? nameEl.textContent.trim() : '';
            var hit = who && list.indexOf(who) >= 0;
            c.classList.toggle('is-blocked', !!hit);
            if (!hit) {
                var vail = c.querySelector('.comment__blocked');
                if (vail) { c.removeChild(vail); }
                c.classList.remove('is-revealed');
                return;
            }
            if (c.querySelector('.comment__blocked')) { return; }
            var veil = pel('div', 'comment__blocked');
            veil.appendChild(pel('span', null, '차단한 사용자의 댓글입니다'));
            var show = pel('button', 'comment__blocked-show', '보기');
            show.type = 'button';
            show.addEventListener('click', function () { c.classList.toggle('is-revealed'); show.textContent = c.classList.contains('is-revealed') ? '숨기기' : '보기'; });
            veil.appendChild(show);
            c.insertBefore(veil, c.firstChild);
        });
        syncBlockLabels();
    }

    /* 차단/해제 버튼 문구를 현재 상태에 맞춘다 */
    function syncBlockLabels() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-block-target]'), function (b) {
            var on = isBlocked(b.getAttribute('data-block-target'));
            b.textContent = on ? (b.getAttribute('data-block-off') || '차단 해제') : (b.getAttribute('data-block-on') || '차단하기');
            b.classList.toggle('is-on', on);
        });
    }

    /* 차단 확인 : 실수로 눌러 대화가 끊기지 않도록 한 번 되묻는다 */
    function askBlock(name, avatar) {
        if (isBlocked(name)) { setBlocked(name, false); return; }
        openConfirm({
            title: '이 사용자를 차단할까요?',
            target: name,
            avatar: avatar || '',
            desc: '차단하면 이 사용자의 댓글이 내 화면에서 가려집니다. 상대에게는 차단 사실이 알려지지 않아요.',
            cancel: '취소',
            ok: '차단하기',
            danger: true,
            onOk: function () { setBlocked(name, true); }
        });
    }

    /* 차단 목록 (마이페이지에서 열람 · 해제) */
    var blockListModal = null;
    function openBlockList() {
        if (!blockListModal) {
            var m = document.createElement('div');
            m.className = 'modal js-blocklist-modal';
            m.setAttribute('role', 'dialog');
            m.setAttribute('aria-modal', 'true');
            m.innerHTML =
                '<div class="modal__box">' +
                    '<div class="modal__head">' +
                        '<h2 class="modal__title">차단한 사용자</h2>' +
                        '<button type="button" class="modal__close js-blocklist-close" aria-label="닫기"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
                    '</div>' +
                    '<div class="blocklist js-blocklist"></div>' +
                    '<div class="modal__actions"><button type="button" class="btn btn--primary js-blocklist-close">확인</button></div>' +
                '</div>';
            document.body.appendChild(m);
            blockListModal = m;
            Array.prototype.forEach.call(m.querySelectorAll('.js-blocklist-close'), function (b) {
                b.addEventListener('click', function () { m.classList.remove('is-open'); document.body.style.overflow = ''; });
            });
            m.addEventListener('click', function (e) { if (e.target === m) { m.classList.remove('is-open'); document.body.style.overflow = ''; } });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && m.classList.contains('is-open')) { m.classList.remove('is-open'); document.body.style.overflow = ''; }
            });
        }
        renderBlockList();
        blockListModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }
    function renderBlockList() {
        if (!blockListModal) { return; }
        var box = blockListModal.querySelector('.js-blocklist');
        var list = readBlocked();
        box.innerHTML = '';
        if (!list.length) {
            box.appendChild(pel('p', 'blocklist__empty', '차단한 사용자가 없습니다. 댓글이나 채널의 더보기 메뉴에서 차단할 수 있어요.'));
            return;
        }
        list.forEach(function (name) {
            var row = pel('div', 'blocklist__row');
            row.appendChild(pel('span', 'blocklist__name', name));
            var off = pel('button', 'blocklist__off', '차단 해제');
            off.type = 'button';
            off.addEventListener('click', function () { setBlocked(name, false); renderBlockList(); });
            row.appendChild(off);
            box.appendChild(row);
        });
    }

    /**
     * 차단 진입점 주입.
     *   댓글 더보기 메뉴 → "차단하기"
     *   채널·크리에이터 더보기 메뉴 → "크리에이터 차단" (initReportEntries 에서 함께 구성)
     *   마이페이지 회원정보 → "차단한 사용자" 목록
     */
    function initBlock() {
        /* 댓글 메뉴에 차단 항목 추가 */
        Array.prototype.forEach.call(document.querySelectorAll('.comment__menu'), function (menu) {
            if (menu.querySelector('[data-block-target]')) { return; }
            var reportBtn = menu.querySelector('.comment__menu-item--report');
            if (!reportBtn) { return; }          /* 내 댓글(수정·삭제)에는 붙이지 않는다 */
            var c = menu.closest('.comment');
            var nameEl = c ? c.querySelector('.comment__name') : null;
            var who = nameEl ? nameEl.textContent.trim() : '';
            if (!who) { return; }
            var b = pel('button', 'comment__menu-item comment__menu-item--block');
            b.type = 'button';
            b.setAttribute('role', 'menuitem');
            b.setAttribute('data-block-target', who);
            b.setAttribute('data-block-on', '차단하기');
            b.setAttribute('data-block-off', '차단 해제');
            b.addEventListener('click', function (e) {
                e.preventDefault();
                var av = c ? c.querySelector('.comment__avatar img') : null;
                askBlock(who, av ? av.getAttribute('src') : '');
            });
            reportBtn.insertAdjacentElement('afterend', b);
        });

        /* 마이페이지 회원정보 : 차단 목록 진입점 */
        var withdraw = document.querySelector('.mydash-withdraw');
        if (withdraw && !document.querySelector('.js-blocklist-open')) {
            var row = pel('p', 'mydash-blocked');
            row.appendChild(document.createTextNode('불편한 사용자가 있나요? '));
            var open = pel('button', 'mydash-blocked__link js-blocklist-open', '차단한 사용자 관리');
            open.type = 'button';
            open.addEventListener('click', openBlockList);
            row.appendChild(open);
            withdraw.insertAdjacentElement('beforebegin', row);
        }

        applyBlocked();
    }

    function initReportEntries() {
        var FLAG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.6 21V4h8.9l-.8 2.8h5.7l-1.1 4.2h-5.4l.7 3.1H5.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        var DOTS = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5.2" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="18.8" r="1.7" fill="currentColor"/></svg>';

        function txt(node) { return node ? (node.textContent || '').trim() : ''; }
        /* 신고 대상 문구 : 콘텐츠는 제목, 크리에이터는 채널명 */
        function contentTarget(scope) {
            return txt((scope || document).querySelector('.hero--detail .hero__title, .watch__title, .player__title')) || '이 콘텐츠';
        }
        function creatorTarget(scope) {
            return txt((scope || document).querySelector('.player__channel-name, .channel__name')) || '이 크리에이터';
        }

        /* 열려 있는 메뉴는 하나만 유지한다 */
        var menus = [];
        function closeMenus(except) {
            menus.forEach(function (m) {
                if (m === except) { return; }
                m.wrap.classList.remove('is-open');
                m.btn.setAttribute('aria-expanded', 'false');
            });
        }
        document.addEventListener('click', function () { closeMenus(null); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenus(null); } });

        function buildList(items) {
            var list = document.createElement('div');
            list.className = 'more-menu__list';
            list.setAttribute('role', 'menu');
            items.forEach(function (it) {
                var node;
                if (it.href) {
                    node = document.createElement('a');
                    node.href = it.href;
                } else if (it.block) {
                    node = document.createElement('button');
                    node.type = 'button';
                    node.setAttribute('data-block-target', it.block);
                    node.setAttribute('data-block-on', it.label);
                    node.setAttribute('data-block-off', '차단 해제');
                    node.addEventListener('click', function () { askBlock(it.block, ''); });
                } else {
                    node = document.createElement('button');
                    node.type = 'button';
                    node.setAttribute('data-report-type', it.type);
                    node.setAttribute('data-report-target', it.target);
                }
                node.className = 'more-menu__item' + (it.danger ? ' more-menu__item--danger' : '');
                node.setAttribute('role', 'menuitem');
                if (!it.block) { node.textContent = it.label; }
                list.appendChild(node);
            });
            return list;
        }
        function bindMenu(wrap, btn) {
            var entry = { wrap: wrap, btn: btn };
            menus.push(entry);
            btn.setAttribute('aria-haspopup', 'true');
            btn.setAttribute('aria-expanded', 'false');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var on = !wrap.classList.contains('is-open');
                closeMenus(entry);
                wrap.classList.toggle('is-open', on);
                btn.setAttribute('aria-expanded', String(on));
            });
        }
        /* 새 더보기 버튼을 만들어 붙인다 */
        function newMenu(items, aria) {
            var wrap = document.createElement('div');
            wrap.className = 'more-menu more-menu--inline';
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'more-menu__btn';
            btn.setAttribute('aria-label', aria);
            btn.innerHTML = DOTS;
            wrap.appendChild(btn);
            wrap.appendChild(buildList(items));
            bindMenu(wrap, btn);
            return wrap;
        }
        /* 이미 마크업에 있는 버튼을 트리거로 삼는다 (숏폼 레일 더보기) */
        function adoptMenu(host, trigger, items) {
            host.classList.add('more-menu', 'more-menu--adopt');
            host.appendChild(buildList(items));
            bindMenu(host, trigger);
        }

        /* (1) 콘텐츠 상세 · 시청 · 라이브 : 액션 줄 끝 신고 버튼 */
        Array.prototype.forEach.call(document.querySelectorAll('.hero--detail .hero__actions, .watch__actions'), function (row) {
            if (row.querySelector('[data-report-type]')) { return; }
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn--ghost btn--icon report-entry';
            b.setAttribute('data-report-type', 'content');
            b.setAttribute('data-report-target', contentTarget());
            b.appendChild(document.createTextNode('신고'));
            b.insertAdjacentHTML('beforeend', FLAG);
            row.appendChild(b);
        });

        /* (2) 채널 페이지 : 구독 줄 더보기 → 크리에이터 신고
           크리에이터 신고는 채널 페이지 한 곳으로 모은다(시청·숏폼 화면에는 두지 않는다). */
        var chActions = document.querySelector('.channel__actions');
        if (chActions && !chActions.querySelector('.more-menu')) {
            chActions.appendChild(newMenu([
                { label: '채널 공유', href: '#' },
                { label: '크리에이터 신고', type: 'creator', target: creatorTarget(), danger: true },
                { label: '크리에이터 차단', block: creatorTarget(), danger: true }
            ], '채널 옵션'));
        }

        /* (3) 숏폼 플레이어 : 슬라이드마다 레일 더보기에 메뉴 연결 */
        Array.prototype.forEach.call(document.querySelectorAll('.player__slide'), function (slide) {
            var trigger = slide.querySelector('.player__rail-btn--more');
            if (!trigger) { return; }
            var host = trigger.parentNode;
            if (!host || host.classList.contains('more-menu')) { return; }
            var link = slide.querySelector('.player__channel-name');
            adoptMenu(host, trigger, [
                { label: '콘텐츠 신고', type: 'content', target: contentTarget(slide), danger: true },
                { label: '크리에이터 차단', block: creatorTarget(slide), danger: true },
                { label: '채널 방문', href: (link && link.getAttribute('href')) || 'preview-channel.html' }
            ]);
        });
    }

    function init() {
        var lists = document.querySelectorAll('[data-scroll-x]');

        Array.prototype.forEach.call(lists, initDragScroll);
        preloadRankDigits();
        initPosterBanner();
        initMobileDock();
        initMobileGnbLabels();
        initUploadFlow();
        initAiPicker();
        initCreatorApply();
        initStickyGnb();
        initRailMoreVisibility();
        initListPageTitle();
        initFavorites();
        initPasswordToggles();
        initTermsAgree();
        initCodeTimer();
        initPhoneFormat();
        initAuthFlow();
        initHeroSwiper();
        initPlayerVideo();
        initPlayerComments();
        initPlayerFeed();
        initWatchVideo();
        initWatchSeason();
        initCommentMenu();
        initCommentReply();
        initAuthDemo();
        initFaq();
        initMyInquiries();
        initMypageDashboard();
        initMypageSideDrawer();
        initLoadMore();
        initPremium();
        initPremiumCancel();
        initStudioStage();
        initUploadDebut();
        initWithdraw();
        initAccountFind();
        initNotifications();
        initChannelTabs();
        initReport();
        initReportEntries();
        initBlock();
        initAvatarModal();
        initMypageStudioNav();
        initMypageBack();
        initAiToolLogos();
        initChannelSubscribe();
        initFollow();
        initStudioComments();
        initContentGates();
        initCreatorAvatarLinks();
        initTastePicker();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
