{{-- Footer : 브랜드 + 링크 컬럼(회사/약관·정책/고객지원) + 카피라이트 (Figma 466:3603) --}}
@php
    /* 컨트롤러가 $footerCols를 넘기지 않아도 기본 링크가 나오도록 폴백 */
    $footerCols = $footerCols ?? [
        '회사' => [
            ['label' => '회사소개', 'url' => '#'],
            ['label' => '채용', 'url' => '#'],
            ['label' => '뉴스룸', 'url' => '#'],
        ],
        '약관·정책' => [
            ['label' => '이용약관', 'url' => '#'],
            ['label' => '개인정보처리방침', 'url' => '#'],
            ['label' => '정산정책', 'url' => '#'],
        ],
        '고객지원' => [
            ['label' => '고객센터', 'url' => '#'],
            ['label' => '크리에이터 지원센터', 'url' => '#'],
            ['label' => '공지사항', 'url' => '#'],
        ],
    ];
@endphp
<footer class="footer">
    <div class="footer__cols">
        <div class="footer__brand">
            <p class="footer__logo">AIVEON</p>
            <p class="footer__tagline">AI 영상 콘텐츠 플랫폼</p>
        </div>

        @foreach ($footerCols as $title => $links)
            <nav class="footer__col" aria-label="{{ $title }}">
                <h3 class="footer__col-title">{{ $title }}</h3>
                <ul>
                    @foreach ($links as $link)
                        <li><a href="{{ $link['url'] ?? '#' }}">{{ $link['label'] ?? '' }}</a></li>
                    @endforeach
                </ul>
            </nav>
        @endforeach
    </div>

    <p class="footer__copy">&copy; 2026 AIVEON. All rights reserved.</p>
</footer>
