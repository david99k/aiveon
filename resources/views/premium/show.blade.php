@extends('layouts.app')

@section('title', '프리미엄 구독 · VIBUZZ')

@section('content')
    <section class="prem">
        {{-- 히어로 --}}
        <div class="prem__hero">
            <span class="prem__badge">PREMIUM</span>
            <h1 class="prem__title">VIBUZZ 프리미엄으로<br><em>모든 이야기</em>를 끝까지</h1>
            <p class="prem__lead">프리미엄 전용 콘텐츠부터 신작 먼저보기까지, 하나의 구독으로 전부 즐기세요.</p>
        </div>

        {{-- 이미 구독 중 안내 (body.is-premium 일 때 JS 가 노출) --}}
        <div class="prem__current js-prem-current" hidden>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            이미 프리미엄 구독 중입니다. 다음 결제일은 <strong>2026-08-02</strong> 입니다.
        </div>

        {{-- 혜택 --}}
        <div class="prem__benefits">
            @foreach ($benefits as $b)
                <div class="prem-bene">
                    <span class="prem-bene__icon" data-icon="{{ $b['icon'] }}" aria-hidden="true"></span>
                    <strong class="prem-bene__title">{{ $b['title'] }}</strong>
                    <p class="prem-bene__desc">{{ $b['desc'] }}</p>
                </div>
            @endforeach
        </div>

        {{-- 무료 vs 프리미엄 --}}
        <table class="prem-compare">
            <thead>
                <tr>
                    <th scope="col"></th>
                    <th scope="col">무료</th>
                    <th scope="col" class="is-prem">프리미엄</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($compare as $row)
                    <tr>
                        <th scope="row">{{ $row['label'] }}</th>
                        <td>{{ $row['free'] }}</td>
                        <td class="is-prem">{{ $row['premium'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        {{-- 플랜 선택 --}}
        <h2 class="prem__sec-title">플랜 선택</h2>
        <div class="prem-plans js-prem-plans" role="radiogroup" aria-label="구독 플랜">
            @foreach ($plans as $plan)
                <label class="prem-plan {{ $plan['default'] ? 'is-on' : '' }}">
                    <input type="radio" name="plan" value="{{ $plan['key'] }}" @checked($plan['default'])>
                    @if ($plan['badge'])
                        <span class="prem-plan__badge">{{ $plan['badge'] }}</span>
                    @endif
                    <span class="prem-plan__name">{{ $plan['name'] }}</span>
                    <span class="prem-plan__price">{{ $plan['price'] }}<em>{{ $plan['per'] }}</em></span>
                    <span class="prem-plan__note">{{ $plan['note'] }}</span>
                </label>
            @endforeach
        </div>

        {{-- 결제 수단 --}}
        <h2 class="prem__sec-title">결제 수단</h2>
        <div class="prem-pays" role="radiogroup" aria-label="결제 수단">
            @foreach ($payMethods as $i => $method)
                <label class="prem-pay">
                    <input type="radio" name="pay" value="{{ $method }}" @checked($i === 0)>
                    <span>{{ $method }}</span>
                </label>
            @endforeach
        </div>

        {{-- 유의사항 + 동의 --}}
        <ul class="prem-notices">
            @foreach ($notices as $notice)
                <li>{{ $notice }}</li>
            @endforeach
        </ul>
        <label class="prem-agree">
            <input type="checkbox" class="js-prem-agree">
            <span class="prem-agree__box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <span class="prem-agree__text">구독 이용약관 및 자동갱신 결제에 동의합니다 <em>(필수)</em></span>
        </label>

        {{-- CTA --}}
        <button type="button" class="btn btn--primary prem-cta js-prem-cta" disabled>프리미엄 시작하기</button>
        <p class="prem-cta__hint">오늘 결제 · 다음 결제일 전 언제든 해지할 수 있어요</p>
    </section>

    {{-- 완료 모달 : 데모 프리미엄 상태(body.is-premium)를 켜서 사이트 전체에 반영 --}}
    <div class="modal js-prem-modal" id="modal-premium" role="dialog" aria-modal="true" aria-labelledby="modal-prem-title">
        <div class="modal__box">
            <div class="prem-done">
                <span class="prem-done__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                <h2 class="prem-done__title" id="modal-prem-title">프리미엄이 시작되었습니다!</h2>
                <p class="prem-done__desc">지금부터 프리미엄 전용 콘텐츠를 시청할 수 있어요.<br>다음 결제일 : <strong class="js-prem-next">2026-08-30</strong></p>
                <div class="prem-done__actions">
                    <a href="{{ route('main') }}" class="btn btn--ghost">홈으로</a>
                    <a href="{{ route('category', 'drama') }}" class="btn btn--primary">프리미엄 콘텐츠 보기</a>
                </div>
            </div>
        </div>
    </div>
@endsection
