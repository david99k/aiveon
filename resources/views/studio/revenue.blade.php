@extends('layouts.app')

@section('title', '수익 관리 · VIBUZZ')

{{-- 마이페이지 셸 재사용 : 사이드바가 푸터까지 이어지도록 --}}
@section('body-class', 'is-mypage')

@php
    /* 아이콘 : 화면 표현이라 컨트롤러가 아닌 뷰에 둔다. 선 굵기는 서비스 다른 화면과 맞춘다. */
    $ico = [
        'point' => '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M10 16V8.6h2.6a2.2 2.2 0 0 1 0 4.4H10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
        'clock' => '<circle cx="12" cy="12" r="8.4" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.6v4.7l3.1 1.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
        'chart' => '<path d="M5 19V11M12 19V5M19 19v-5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
        'eye' => '<path d="M2.6 12S6 6.4 12 6.4 21.4 12 21.4 12 18 17.6 12 17.6 2.6 12 2.6 12Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.7"/>',
        'pool' => '<path d="M8 5h8v2.6a4 4 0 0 1-8 0V5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M16 6h2.4a2 2 0 0 1 0 4H16M8 6H5.6a2 2 0 0 0 0 4H8M12 11.6V15m-3 4h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
        'play' => '<circle cx="12" cy="12" r="8.6" stroke="currentColor" stroke-width="1.7"/><path d="m10.3 8.9 5 3.1-5 3.1V8.9Z" fill="currentColor"/>',
        'star' => '<path d="m12 4.6 2.3 4.9 5.2.7-3.8 3.7.9 5.3-4.6-2.5-4.6 2.5.9-5.3-3.8-3.7 5.2-.7L12 4.6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
        'users' => '<circle cx="9.5" cy="8.6" r="3.1" stroke="currentColor" stroke-width="1.7"/><path d="M3.6 19c0-3 2.6-4.8 5.9-4.8s5.9 1.8 5.9 4.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16.4 6.4a2.9 2.9 0 0 1 0 5.6M17.6 14.6c1.8.5 2.9 1.8 2.9 3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
        'pie' => '<path d="M12 3.6v8.4h8.4A8.4 8.4 0 0 0 12 3.6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M20 15.2A8.4 8.4 0 1 1 8.8 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
        'repeat' => '<path d="M4.6 9.6A7.4 7.4 0 0 1 17.4 7M19.4 14.4A7.4 7.4 0 0 1 6.6 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4.4 5.6v4h4M19.6 18.4v-4h-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
        'shield' => '<path d="M12 3.6 19 6v5.4c0 4-2.9 7.4-7 8.9-4.1-1.5-7-4.9-7-8.9V6l7-2.4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9.1 12.1 2 2 3.8-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
        'arrow' => '<path d="M5 12h13M13 6.6 18.4 12 13 17.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    ];
    $svg = fn (string $k) => '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' . ($ico[$k] ?? $ico['chart']) . '</svg>';

    /* 도넛 : 비율만큼 원호를 잘라 이어 붙인다 */
    $dSize = 152; $dTh = 18;
    $dR = ($dSize - $dTh) / 2;
    $dC = 2 * M_PI * $dR;

    /* 추이 : 좌표를 여기서 한 번만 계산한다 */
    $cW = 660; $cH = 260; $pL = 52; $pR = 22; $pT = 30; $pB = 38;
    $iw = $cW - $pL - $pR; $ih = $cH - $pT - $pB;
    $n = count($trend['labels']);
    $X = fn (int $i) => round($pL + ($iw / ($n - 1)) * $i, 1);
    $Y = fn (int|float $v) => round($pT + $ih - ($v / $trend['top']) * $ih, 1);
@endphp

@section('content')
    <section class="mypage">
        {{-- 좌측 : 마이페이지 사이드바 (크리에이터 스튜디오 아코디언 펼침 + 수익 관리 활성) --}}
        @include('partials.mypage-sidebar', ['studioSub' => 'revenue'])

        {{-- 우측 : 적립 수익을 포인트로 보여준다. 출금 없이 제휴 스토어에서 사용한다. --}}
        <div class="mypage__content mypage__content--studio">
            <div class="rev-head">
                <div>
                    <h2 class="studio__title">수익 관리</h2>
                    <p class="studio__lead">적립된 수익을 포인트로 확인하고, 제휴 스토어에서 사용하세요.</p>
                </div>
                <span class="rev-stamp">정산 기준일 <b>{{ $stamp }}</b></span>
            </div>

            {{-- 지표 카드 --}}
            <div class="rev-cards">
                @foreach ($cards as $c)
                    <div class="rev-card">
                        <div class="rev-card__top">
                            <span class="rev-card__ico">{!! $svg($c['ico']) !!}</span>
                            <span class="rev-card__label">{{ $c['label'] }}</span>
                        </div>
                        <strong class="rev-card__value">{{ $c['value'] }}<span class="rev-card__unit">{{ $c['unit'] }}</span></strong>
                        @if (!empty($c['note']))
                            <span @class(['rev-card__note', 'rev-card__note--accent' => !empty($c['accent'])])>{{ $c['note'] }}</span>
                        @endif
                    </div>
                @endforeach
            </div>

            <div class="rev-grid">
                {{-- 보유 포인트 : 이 화면에서 가장 먼저 읽혀야 하는 값 --}}
                <div class="rev-point">
                    <div class="rev-point__body">
                        <p class="rev-point__label">{{ $hero['label'] }}</p>
                        <strong class="rev-point__amount">{{ $hero['amount'] }}<span class="rev-point__unit">{{ $hero['unit'] }}</span></strong>
                        <p class="rev-point__desc">{{ $hero['desc'] }}</p>
                        <div class="rev-point__stats">
                            @foreach ($hero['stats'] as $s)
                                <span class="rev-point__stat"><span>{{ $s['label'] }}</span><b>{{ $s['value'] }}</b></span>
                            @endforeach
                        </div>
                    </div>
                    <a href="{{ $pointUrl }}" class="rev-point__btn" target="_blank" rel="noopener">{{ $hero['btn'] }}{!! $svg('arrow') !!}</a>
                </div>

                {{-- 수익 구성 --}}
                <div class="rev-panel">
                    <div class="rev-panel__head">
                        <h3 class="rev-panel__title">수익 구성</h3>
                        <span class="rev-panel__hint">이번 달 기준</span>
                    </div>
                    <div class="rev-mix">
                        <div class="rev-mix__fig">
                            <svg viewBox="0 0 {{ $dSize }} {{ $dSize }}" role="img" aria-label="수익 구성 비율">
                                <circle cx="{{ $dSize / 2 }}" cy="{{ $dSize / 2 }}" r="{{ round($dR, 1) }}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="{{ $dTh }}"/>
                                @php $acc = 0; @endphp
                                @foreach ($mix as $m)
                                    @php $len = $m['pct'] / 100 * $dC; @endphp
                                    <circle cx="{{ $dSize / 2 }}" cy="{{ $dSize / 2 }}" r="{{ round($dR, 1) }}" fill="none"
                                            stroke="{{ $m['color'] }}" stroke-width="{{ $dTh }}"
                                            stroke-dasharray="{{ round($len, 2) }} {{ round($dC - $len, 2) }}"
                                            stroke-dashoffset="{{ round(-$acc, 2) }}"
                                            transform="rotate(-90 {{ $dSize / 2 }} {{ $dSize / 2 }})"/>
                                    @php $acc += $len; @endphp
                                @endforeach
                            </svg>
                            <span class="rev-mix__mid"><span>이번 달 수익</span><b>{{ $mixTotal }}</b></span>
                        </div>
                        <ul class="rev-comp">
                            @foreach ($mix as $m)
                                <li class="rev-comp__row">
                                    <span class="rev-comp__key"><span class="rev-comp__dot" style="background-color: {{ $m['color'] }}"></span>{{ $m['label'] }}</span>
                                    <span class="rev-comp__track"><span class="rev-comp__bar" style="width: {{ $m['pct'] }}%; background-color: {{ $m['color'] }}"></span></span>
                                    <span class="rev-comp__pct">{{ $m['pct'] }}%</span>
                                    <span class="rev-comp__amt">{{ $m['amount'] }}</span>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                    <p class="rev-foot">* 금액은 반올림한 값입니다.</p>
                </div>
            </div>

            <div class="rev-grid2">
                {{-- 월별 수익 추이 : 총 수익(실선) + SVOD 수익(점선) --}}
                <div class="rev-panel">
                    <div class="rev-panel__head">
                        <h3 class="rev-panel__title">월별 수익 추이</h3>
                        <span class="rev-keys">
                            <span class="rev-key"><i></i>총 수익</span>
                            <span class="rev-key"><i class="is-dash"></i>SVOD 수익</span>
                        </span>
                        <span class="rev-panel__hint">최근 {{ $n }}개월 · 단위 {{ $trend['unit'] }}</span>
                    </div>
                    <svg class="rev-chart" viewBox="0 0 {{ $cW }} {{ $cH }}" role="img" aria-label="월별 수익 추이">
                        @for ($g = 0; $g <= $trend['ticks']; $g++)
                            @php
                                $gy = round($pT + ($ih / $trend['ticks']) * $g, 1);
                                $gv = (int) ($trend['top'] - ($trend['top'] / $trend['ticks']) * $g);
                            @endphp
                            <line x1="{{ $pL }}" y1="{{ $gy }}" x2="{{ $cW - $pR }}" y2="{{ $gy }}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
                            <text x="{{ $pL - 10 }}" y="{{ round($gy + 4, 1) }}" text-anchor="end" fill="rgba(255,255,255,0.42)" font-size="11">{{ number_format($gv) }}</text>
                        @endfor
                        @foreach ([['key' => 'svod', 'dash' => true], ['key' => 'total', 'dash' => false]] as $ser)
                            @php
                                $vals = $trend[$ser['key']];
                                $d = collect($vals)->map(fn ($v, $i) => ($i ? 'L' : 'M') . $X($i) . ' ' . $Y($v))->implode(' ');
                            @endphp
                            <path d="{{ $d }}" fill="none" stroke="var(--brand-primary)" stroke-width="{{ $ser['dash'] ? '2' : '2.4' }}"
                                  @if ($ser['dash']) stroke-dasharray="2 5" opacity="0.85" @endif
                                  stroke-linecap="round" stroke-linejoin="round"/>
                            @foreach ($vals as $i => $v)
                                <circle cx="{{ $X($i) }}" cy="{{ $Y($v) }}" r="{{ $ser['dash'] ? '2.8' : '3.6' }}"
                                        fill="{{ $ser['dash'] ? 'var(--bg-surface)' : 'var(--brand-primary)' }}"
                                        stroke="var(--brand-primary)" stroke-width="{{ $ser['dash'] ? '1.6' : '0' }}"/>
                                <text x="{{ $X($i) }}" y="{{ round($Y($v) + ($ser['dash'] ? 17 : -12), 1) }}" text-anchor="middle"
                                      fill="{{ $ser['dash'] ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.82)' }}"
                                      font-size="11" font-weight="600">{{ number_format($v) }}</text>
                            @endforeach
                        @endforeach
                        @foreach ($trend['labels'] as $i => $lb)
                            <text x="{{ $X($i) }}" y="{{ $cH - 12 }}" text-anchor="middle" fill="rgba(255,255,255,0.42)" font-size="11">{{ $lb }}</text>
                        @endforeach
                    </svg>
                </div>

                {{-- 정산 산식 : 표의 숫자가 어떻게 나온 값인지 먼저 밝힌다 --}}
                <div class="rev-panel">
                    <div class="rev-panel__head">
                        <h3 class="rev-panel__title">정산 산식</h3>
                        <span class="rev-panel__hint">이번 달 기준</span>
                    </div>
                    <div class="rev-calc">
                        <div class="rev-calc__notes">
                            @foreach ($notes as $note)
                                <div class="rev-calc__note"><b>{{ $note['title'] }}</b><span>= {{ $note['desc'] }}</span></div>
                            @endforeach
                        </div>
                        <div class="rev-metrics">
                            @foreach ($metrics as $m)
                                <div @class(['rev-metric', 'rev-metric--key' => !empty($m['key'])])>
                                    <span class="rev-metric__ico">{!! $svg($m['ico']) !!}</span>
                                    <span class="rev-metric__label">{{ $m['label'] }}</span>
                                    <strong class="rev-metric__value">{{ $m['value'] }}</strong>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>

            {{-- 콘텐츠별 정산 상세 --}}
            <div class="rev-panel">
                <div class="rev-panel__head">
                    <h3 class="rev-panel__title">콘텐츠별 정산 상세</h3>
                    <span class="rev-panel__hint">이번 달 · 회차 단위</span>
                </div>
                <div class="rev-table">
                    <table>
                        <thead>
                            <tr>
                                <th>제목</th><th>회차</th>
                                <th class="rev-table__num">유효 시청시간</th>
                                <th class="rev-table__num">평균 완주율</th>
                                <th class="rev-table__num">가중치</th>
                                <th class="rev-table__num">회차별 정산점수</th>
                                <th class="rev-table__num">유료 순시청자</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($detail as $r)
                                <tr>
                                    <td>{{ $r['title'] }}</td>
                                    <td>{{ $r['episode'] }}</td>
                                    <td class="rev-table__num">{{ $r['minutes'] }}</td>
                                    <td class="rev-table__num">{{ $r['rate'] }}</td>
                                    <td class="rev-table__num">{{ $r['weight'] }}</td>
                                    <td class="rev-table__num rev-table__strong">{{ $r['score'] }}</td>
                                    <td class="rev-table__num">{{ $r['viewers'] }}</td>
                                    <td><span class="rev-badge rev-badge--{{ $r['status'] }}">{{ $r['statusLabel'] }}</span></td>
                                </tr>
                            @endforeach
                            <tr class="is-total">
                                <td>{{ $detailTotal['title'] }}</td>
                                <td>{{ $detailTotal['episode'] }}</td>
                                <td class="rev-table__num is-brand">{{ $detailTotal['minutes'] }}</td>
                                <td class="rev-table__num">—</td>
                                <td class="rev-table__num">—</td>
                                <td class="rev-table__num is-brand">{{ $detailTotal['score'] }}</td>
                                <td class="rev-table__num is-brand">{{ $detailTotal['viewers'] }}</td>
                                <td><span class="rev-badge rev-badge--none">—</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- 정산 기준 안내 --}}
            <div class="rev-panel">
                <div class="rev-panel__head">
                    <h3 class="rev-panel__title">정산 기준 안내</h3>
                    <span class="rev-panel__hint">기준 변경 시 공지로 안내드립니다</span>
                </div>
                <div class="rev-guide">
                    @foreach ($guide as $g)
                        <div class="rev-guide__item">
                            <span class="rev-guide__ico">{!! $svg($g['ico']) !!}</span>
                            <span class="rev-guide__text">{!! nl2br(e($g['text'])) !!}</span>
                        </div>
                    @endforeach
                </div>
                <p class="rev-foot">{{ $foot }}</p>
            </div>
        </div>
    </section>
@endsection
