/**
 * AIVEON 메인 - 공통 스크립트
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
     * TOP6 랭킹 숫자용 Gothic A1 숫자 글리프 프리로드.
     * Google Fonts는 unicode-range 슬라이스 단위로 폰트를 나눠 제공하는데,
     * 숫자 슬라이스 로드가 지연되면 랭킹 숫자가 폴백 폰트로 그려지므로 명시적으로 로드한다.
     */
    function preloadRankDigits() {
        if (!document.fonts || typeof document.fonts.load !== 'function') { return; }

        document.fonts.load('700 200px "Gothic A1"', '0123456789').catch(function () {
            /* 로드 실패 시 폴백 폰트로 표시 - 치명적이지 않음 */
        });
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

        syncPlayState();
        syncTime();
        syncVolumeUI();
        scheduleHide(); // 자동재생 시작 시 유휴 타이머 가동
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
        var KEY = 'aiveon-demo-auth';
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

        // 마이페이지 링크 : 정적 프리뷰(.html)면 preview-mypage.html, 실앱이면 /mypage
        var mypageUrl = /\.html$/.test(location.pathname) ? 'preview-mypage.html' : '/mypage';
        var studioUrl = /\.html$/.test(location.pathname) ? 'preview-studio.html' : '/studio';
        var csUrl = /\.html$/.test(location.pathname) ? 'preview-faq.html' : '/mypage/faq'; // 고객센터 = 자주하는 질문(고객센터) 페이지

        // 데모 상태 3종 : 로그인 / 성인인증 / 프리미엄 구독. 각각 body 클래스 + localStorage 로 유지.
        // 인증·구독 여부를 미리보기로 확인하기 위한 토글(로그인 상태와 동일 방식). 실서비스에선 서버 상태로 대체.
        var STATES = [
            { key: 'auth',    cls: 'is-authed',  on: '로그인 상태',     off: '비로그인 상태' },
            { key: 'adult',   cls: 'is-adult',   on: '성인인증 완료',   off: '성인인증 전' },
            { key: 'premium', cls: 'is-premium', on: '프리미엄 구독중', off: '프리미엄 미구독' }
        ];
        var demo = { auth: false, adult: false, premium: false };
        STATES.forEach(function (s) { try { demo[s.key] = localStorage.getItem('aiveon-demo-' + s.key) === '1'; } catch (e) {} });

        function demoRowHtml(s) {
            return '<div class="gnb__demo-row" data-demo="' + s.key + '">' +
                    '<span class="gnb__demo-info"><span class="authbar__dot"></span><span class="gnb__demo-state js-demo-label">' + (demo[s.key] ? s.on : s.off) + '</span></span>' +
                    '<button type="button" class="authbar__toggle js-demo-toggle" data-demo="' + s.key + '" role="switch" aria-checked="' + demo[s.key] + '" aria-label="' + s.on + ' 전환"><span class="authbar__knob"></span></button>' +
                '</div>';
        }
        // 로그인 후 메뉴 : 3종 토글 그룹 / 게스트 팝업 : 로그인 토글만
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
                    '<li><a href="' + studioUrl + '" class="gnb__usermenu-item" role="menuitem">' + ICON.swap + '크리에이터 스튜디오</a></li>' +
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
            // 프리미엄 상태를 메뉴 헤드 플랜 라벨에 반영 (구독중=Premium / 미구독=Free)
            Array.prototype.forEach.call(document.querySelectorAll('.js-plan-label'), function (el) {
                el.textContent = demo.premium ? 'Premium' : 'Free';
            });
        }
        apply();

        function setState(key, val) {
            demo[key] = val;
            try { localStorage.setItem('aiveon-demo-' + key, val ? '1' : '0'); } catch (e) {}
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
            { key: 'favorites', label: '즐겨찾기', href: link('/mypage/favorites', 'preview-favorites.html'), icon: ICON.favorites },
            { key: 'mypage', label: '마이페이지', href: link('/mypage', 'preview-mypage.html'), icon: ICON.mypage }
        ];

        // 현재 경로 기준 활성 탭 판정 (그 외 브라우즈 페이지는 모두 '홈')
        var path = location.pathname;
        var active = /upload/.test(path) ? 'upload'
            : /search/.test(path) ? 'search'
            : /favorite/.test(path) ? 'favorites'
            : /(mypage|faq)/.test(path) ? 'mypage'
            : 'home';

        var nav = document.createElement('nav');
        nav.className = 'mobile-dock';
        nav.setAttribute('aria-label', '하단 메뉴');
        nav.innerHTML = ITEMS.map(function (it) {
            var on = it.key === active;
            return '<a href="' + it.href + '" class="mobile-dock__item' + (on ? ' is-active' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
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

        // 사용한 AI 선택 팝업 (카테고리별 툴, 복수 선택 → 하단 칩) — AI_영상제작_툴_목록_2026
        var aiWrap = document.querySelector('.js-upload-ai');
        var aiModal = document.getElementById('modal-ai');
        if (aiWrap && aiModal) {
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
            var aiGroups = [];
            try { aiGroups = JSON.parse(aiWrap.getAttribute('data-ai-groups') || '[]'); } catch (e) {}
            var aiBtn = aiWrap.querySelector('.js-ai-btn');
            var aiBtnText = aiWrap.querySelector('.js-ai-btn-text');
            var aiChips = aiWrap.querySelector('.js-ai-chips');
            var aiList = aiModal.querySelector('.js-ai-modal-list');
            var aiSelected = [];

            // 모달 내용 구성 (카테고리 헤더 + 툴 핀). 처음엔 아무것도 선택 안 됨.
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
                    p.textContent = t;
                    p.addEventListener('click', function () { setAi(t, aiSelected.indexOf(t) < 0); });
                    pills.appendChild(p);
                });
                sec.appendChild(pills);
                aiList.appendChild(sec);
            });

            function syncPills() {
                Array.prototype.forEach.call(aiList.querySelectorAll('.ai-tool-pill'), function (p) {
                    p.classList.toggle('is-selected', aiSelected.indexOf(p.getAttribute('data-tool')) >= 0);
                });
                aiBtnText.textContent = aiSelected.length ? ('사용한 AI ' + aiSelected.length + '개 선택됨') : '사용한 AI 선택하기';
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
                    aiChips.appendChild(chip);
                });
            }
            function setAi(t, on) {
                var idx = aiSelected.indexOf(t);
                if (on && idx < 0) { aiSelected.push(t); }
                else if (!on && idx >= 0) { aiSelected.splice(idx, 1); }
                syncPills();
                renderAiChips();
            }
            function openAi() { aiModal.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
            function closeAi() { aiModal.classList.remove('is-open'); document.body.style.overflow = ''; }
            aiBtn.addEventListener('click', function () { syncPills(); openAi(); });
            aiModal.querySelector('.js-ai-modal-close').addEventListener('click', closeAi);
            aiModal.querySelector('.js-ai-modal-ok').addEventListener('click', closeAi);
            aiModal.addEventListener('click', function (e) { if (e.target === aiModal) { closeAi(); } });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && aiModal.classList.contains('is-open')) { closeAi(); } });
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

    function init() {
        var lists = document.querySelectorAll('[data-scroll-x]');

        Array.prototype.forEach.call(lists, initDragScroll);
        preloadRankDigits();
        initPosterBanner();
        initMobileDock();
        initMobileGnbLabels();
        initUploadFlow();
        initStickyGnb();
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
        initAvatarModal();
        initMypageStudioNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
