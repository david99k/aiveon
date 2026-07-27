@extends('layouts.app')

@section('title', '수익 관리 · AIVEON')

{{-- 마이페이지 셸 재사용 : 사이드바가 푸터까지 이어지도록 --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        {{-- 좌측 : 마이페이지 사이드바 (크리에이터 스튜디오 아코디언 펼침 + 수익 관리 활성) --}}
        @include('partials.mypage-sidebar', ['studioSub' => 'revenue'])

        {{-- 우측 : 수익(포인트) 현황. 출금 개념 없이 제휴 스토어에서 포인트로 사용한다. --}}
        <div class="mypage__content mypage__content--studio">
            <h2 class="studio__title">수익 관리</h2>
            <p class="studio__lead">적립된 수익을 포인트로 확인하고, 제휴 스토어에서 사용하세요.</p>

            {{-- 요약 카드 --}}
            <div class="rev-cards">
                @foreach ($summary as $card)
                    <div @class(['rev-card', 'rev-card--accent' => !empty($card['accent'])])>
                        <span class="rev-card__label">{{ $card['label'] }}</span>
                        <strong class="rev-card__value">{{ $card['value'] }}@if (!empty($card['unit']))<span class="rev-card__unit">{{ $card['unit'] }}</span>@endif</strong>
                        @if (!empty($card['note']))
                            <span @class([
                                'rev-card__note',
                                'rev-card__note--up' => ($card['dir'] ?? '') === 'up',
                                'rev-card__note--down' => ($card['dir'] ?? '') === 'down',
                                'rev-card__note--accent' => !empty($card['accent']),
                            ])>{{ $card['note'] }}</span>
                        @endif
                    </div>
                @endforeach
            </div>

            <div class="rev-grid">
                {{-- 월별 수익 추이 (막대 차트) --}}
                <div class="rev-panel">
                    <div class="rev-panel__head">
                        <h3 class="rev-panel__title">월별 수익 추이</h3>
                        <span class="rev-panel__hint">최근 6개월 · 단위 만원</span>
                    </div>
                    <div class="rev-chart">
                        @foreach ($trend as $bar)
                            <div class="rev-bar">
                                <span class="rev-bar__value">{{ $bar['value'] }}</span>
                                <span @class(['rev-bar__fill', 'rev-bar__fill--current' => !empty($bar['current'])]) style="height: {{ $bar['height'] }}%"></span>
                                <span class="rev-bar__month">{{ $bar['month'] }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>

                {{-- 수익 구성 + 최고 수익 콘텐츠 --}}
                <div class="rev-panel">
                    <div class="rev-panel__head">
                        <h3 class="rev-panel__title">수익 구성</h3>
                        <span class="rev-panel__hint">이번 달</span>
                    </div>
                    <ul class="rev-comp">
                        @foreach ($composition as $row)
                            <li class="rev-comp__row">
                                <span class="rev-comp__dot" style="background-color: {{ $row['color'] }}"></span>
                                {{ $row['label'] }}
                                <span class="rev-comp__track"><span class="rev-comp__bar" style="width: {{ $row['pct'] }}%; background-color: {{ $row['color'] }}"></span></span>
                                <span class="rev-comp__pct">{{ $row['pct'] }}%</span>
                            </li>
                        @endforeach
                    </ul>

                    <div class="rev-top">
                        <span class="rev-card__label">가장 수익이 높은 콘텐츠</span>
                        <div class="rev-top__item">
                            <div class="rev-top__thumb"><img src="{{ asset($top['thumb']) }}" alt=""></div>
                            <div>
                                <p class="rev-top__title">{{ $top['title'] }}</p>
                                <p class="rev-top__meta">{{ $top['meta'] }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- 포인트 적립 내역 --}}
            <div class="rev-panel">
                <div class="rev-panel__head">
                    <h3 class="rev-panel__title">포인트 적립 내역</h3>
                    <span class="rev-panel__hint">최근 4개월</span>
                </div>
                <div class="rev-table">
                    <table>
                        <thead>
                            <tr><th>적립월</th><th>광고</th><th>구독 분배</th><th>적립 포인트</th><th>상태</th></tr>
                        </thead>
                        <tbody>
                            @foreach ($history as $row)
                                <tr>
                                    <td>{{ $row['month'] }}</td>
                                    <td class="rev-table__num">{{ $row['ad'] }}</td>
                                    <td class="rev-table__num">{{ $row['sub'] }}</td>
                                    <td class="rev-table__num rev-table__strong">{{ $row['point'] }}</td>
                                    <td><span class="rev-badge rev-badge--{{ $row['status'] }}">{{ $row['statusLabel'] }}</span></td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- 포인트 사용 (외부 제휴 스토어로 이동) --}}
            <div class="rev-point">
                <div>
                    <strong class="rev-point__amount">보유 포인트 {{ $point['balance'] }}<span class="rev-point__unit">P</span></strong>
                    <p class="rev-point__desc">{{ $point['desc'] }}</p>
                </div>
                <a href="{{ $pointUrl }}" class="rev-point__btn" target="_blank" rel="noopener">
                    포인트 사용하기
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
            </div>
        </div>
    </section>
@endsection
