@extends('layouts.app')

@section('title', '이벤트 · AIVEON')

@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 이벤트 : 갤러리 형태 (썸네일 카드 그리드 + 진행중/종료 필터) --}}
        <div class="mypage__content">
            <h2 class="mypage__page-title">이벤트</h2>

            <div class="board__top">
                <div class="board__filters" role="tablist" aria-label="이벤트 상태">
                    @foreach ($filters as $i => $f)
                        <button type="button" @class(['board__filter', 'is-active' => $i === 0]) role="tab" aria-selected="{{ $i === 0 ? 'true' : 'false' }}">{{ $f }}</button>
                    @endforeach
                </div>
            </div>

            <div class="event-grid">
                @foreach ($events as $ev)
                    <a href="{{ route('event.show', $ev['id']) }}" @class(['event-card', 'is-ended' => $ev['status'] === 'ended'])>
                        <figure class="event-card__thumb">
                            <img src="{{ asset($ev['thumb']) }}" alt="" loading="lazy">
                            <span class="event-card__status event-card__status--{{ $ev['status'] }}">{{ $ev['statusLabel'] }}</span>
                            @if ($ev['status'] === 'ongoing' && $ev['dday'] !== '상시')
                                <span class="event-card__dday">{{ $ev['dday'] }}</span>
                            @endif
                        </figure>

                        <div class="event-card__body">
                            <strong class="event-card__title">{{ $ev['title'] }}</strong>
                            <p class="event-card__summary">{{ $ev['summary'] }}</p>
                            <span class="event-card__period">{{ $ev['period'] }}</span>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    </section>
@endsection
