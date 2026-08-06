@extends('layouts.app')

@section('title', '알림 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 : 알림함 --}}
        <div class="mypage__content mypage__content--dash">
            <div class="noti__head">
                <h2 class="mypage__page-title">알림 @if ($unread)<span class="noti__unread">{{ $unread }}</span>@endif</h2>
                <button type="button" class="noti__read-all js-noti-read-all">모두 읽음</button>
            </div>

            {{-- 탭 --}}
            <div class="noti__tabs js-noti-tabs" role="tablist">
                @foreach ($tabs as $i => $tab)
                    <button type="button" class="noti__tab {{ $i === 0 ? 'is-active' : '' }}" data-noti-tab="{{ $tab['key'] }}"
                            role="tab" aria-selected="{{ $i === 0 ? 'true' : 'false' }}">
                        {{ $tab['label'] }} <span class="noti__tab-count">{{ $tab['count'] }}</span>
                    </button>
                @endforeach
            </div>

            {{-- 목록 --}}
            <ul class="noti__list js-noti-list">
                @foreach ($notifications as $n)
                    <li class="noti__item {{ $n['read'] ? '' : 'is-unread' }}" data-noti-group="{{ $n['group'] }}">
                        <a href="{{ route($n['url']) }}" class="noti__link">
                            <span class="noti__icon" data-noti-icon="{{ $n['icon'] }}" aria-hidden="true"></span>
                            <span class="noti__body">
                                <strong class="noti__title">{{ $n['title'] }}</strong>
                                <span class="noti__desc">{{ $n['desc'] }}</span>
                            </span>
                            <span class="noti__time">{{ $n['time'] }}</span>
                            @unless ($n['read'])
                                <span class="noti__dot" aria-label="읽지 않음"></span>
                            @endunless
                        </a>
                    </li>
                @endforeach
            </ul>

            <p class="noti__empty js-noti-empty" hidden>해당 알림이 없습니다.</p>
            <p class="noti__foot">알림 수신 설정은 <a href="{{ route('mypage') }}#account">회원정보</a>에서 변경할 수 있습니다.</p>
        </div>
    </section>
@endsection
