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
     * 진행바 시킹/레일 버튼/링크 위에서 시작한 제스처는 스와이프로 보지 않으며,
     * 댓글이 열려 있으면 스와이프를 막는다.
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

        function commentsOpen() {
            return !!player && player.classList.contains('is-comments');
        }

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
            index = Math.max(0, Math.min(slides.length - 1, i));
            feed.style.transform = 'translateY(' + (-index * 100) + '%)';
            setActive(index);
        }

        function onDown(e) {
            // 새 포인터 시작 시 직전 스와이프 잔여 플래그를 즉시 해제한다.
            // (버튼/링크 등 IGNORE 대상은 아래에서 조기 return 하므로 여기서 먼저 리셋해야
            //  스와이프 직후의 버튼 탭 클릭이 잘못 차단되지 않는다.)
            didSwipe = false;
            if (e.pointerType === 'mouse' && e.button !== 0) { return; }
            if (commentsOpen()) { return; }
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
            var threshold = Math.min(140, height * 0.15);
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

        // 데스크톱 휠로도 이동 (연속 입력 쿨다운)
        var wheelLock = false;
        feed.addEventListener('wheel', function (e) {
            if (commentsOpen() || Math.abs(e.deltaY) < 20) { return; }
            e.preventDefault();
            if (wheelLock) { return; }
            wheelLock = true;
            setTimeout(function () { wheelLock = false; }, 550);
            if (e.deltaY > 0) { goTo(index + 1); } else { goTo(index - 1); }
        }, { passive: false });

        goTo(0);
    }

    /**
     * 고정 GNB: 페이지를 조금이라도 내리면 .is-scrolled 를 붙여
     * 투명 헤더 -> 프로스티드 글래스 배경으로 전환한다.
     */
    function initStickyGnb() {
        var gnb = document.querySelector('.gnb');
        if (!gnb) { return; }

        var THRESHOLD = 8; // px
        var isScrolled = false;

        // class 토글은 상태가 바뀔 때만 수행 (스크롤마다 DOM 변경 방지)
        function update() {
            var next = window.pageYOffset > THRESHOLD;
            if (next !== isScrolled) {
                isScrolled = next;
                gnb.classList.toggle('is-scrolled', next);
            }
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
            logout: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9 8.5 5.5 12 9 15.5M5.5 12H16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
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

        // 로그인 후 유저 메뉴 주입 (마크업에 이미 있으면 건너뜀)
        if (wrap && !wrap.querySelector('.gnb__usermenu')) {
            var menu = document.createElement('div');
            menu.className = 'gnb__usermenu';
            menu.setAttribute('role', 'menu');
            menu.setAttribute('aria-label', '계정 메뉴');
            menu.innerHTML =
                '<div class="gnb__usermenu-head">' +
                    '<img class="gnb__usermenu-avatar" src="' + duckSrc + '" alt="">' +
                    '<div class="gnb__usermenu-id"><strong class="gnb__usermenu-name">synergy kim</strong><span class="gnb__usermenu-plan">Premium</span></div>' +
                '</div>' +
                '<ul class="gnb__usermenu-list">' +
                    '<li><a href="' + mypageUrl + '" class="gnb__usermenu-item" role="menuitem">' + ICON.user + '마이페이지</a></li>' +
                    '<li><a href="#" class="gnb__usermenu-item" role="menuitem">' + ICON.swap + '크리에이터 전환</a></li>' +
                    '<li><a href="#" class="gnb__usermenu-item" role="menuitem">' + ICON.help + '고객센터</a></li>' +
                    '<li><button type="button" class="gnb__usermenu-item js-demo-logout" role="menuitem">' + ICON.logout + '로그아웃</button></li>' +
                '</ul>';
            wrap.appendChild(menu);
        }

        // 우측 하단 토글바 주입
        var bar = document.createElement('div');
        bar.className = 'authbar';
        bar.setAttribute('aria-label', '로그인 상태 미리보기 토글');
        bar.innerHTML =
            '<span class="authbar__info"><span class="authbar__dot"></span>' +
            '<span class="authbar__text"><span class="authbar__state"></span><span class="authbar__caption">미리보기 · 로그인 전환</span></span></span>' +
            '<button type="button" class="authbar__toggle js-auth-toggle" role="switch" aria-checked="false" aria-label="로그인 상태 전환"><span class="authbar__knob"></span></button>';
        body.appendChild(bar);
        var stateEl = bar.querySelector('.authbar__state');
        var toggleEl = bar.querySelector('.js-auth-toggle');

        function apply(authed) {
            body.classList.toggle('is-authed', authed);
            if (avatarImg) { avatarImg.setAttribute('src', authed ? duckSrc : guestSrc); }
            stateEl.textContent = authed ? '로그인 상태' : '비로그인 상태';
            toggleEl.setAttribute('aria-checked', String(authed));
        }

        var authed = false;
        try { authed = localStorage.getItem(KEY) === '1'; } catch (e) {}
        apply(authed);

        function setState(next) {
            authed = next;
            try { localStorage.setItem(KEY, next ? '1' : '0'); } catch (e) {}
            apply(next);
            if (wrap) { wrap.classList.remove('is-open'); }
        }

        toggleEl.addEventListener('click', function () { setState(!authed); });

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
                if (e.target.closest('.js-demo-logout')) { e.preventDefault(); setState(false); }
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

    function init() {
        var lists = document.querySelectorAll('[data-scroll-x]');

        Array.prototype.forEach.call(lists, initDragScroll);
        preloadRankDigits();
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
        initAuthDemo();
        initFaq();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
