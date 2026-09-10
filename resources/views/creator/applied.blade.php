@extends('layouts.app')

@section('title', '크리에이터 신청 완료 · VIBUZZ')

@section('content')
    <section class="capply capply--done">
        <div class="capply-done">
            <span class="capply-done__ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5.2l3.4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h1 class="capply-done__title">신청이 접수되었습니다</h1>
            <p class="capply-done__desc">
                담당자가 계정 정보와 활동 계획을 확인하고 있어요.<br>
                결과는 <strong>{{ $reviewDays }}영업일 이내</strong>에 이메일과 알림으로 안내드립니다.
            </p>

            <dl class="capply-done__meta">
                <div>
                    <dt>신청 번호</dt>
                    <dd>{{ $application['no'] }}</dd>
                </div>
                <div>
                    <dt>신청일</dt>
                    <dd>{{ $application['appliedAt'] }}</dd>
                </div>
                <div>
                    <dt>현재 상태</dt>
                    <dd class="is-review">{{ $application['status'] }}</dd>
                </div>
            </dl>

            {{-- 진행 단계 : 서버가 내려주는 상태로 is-done / is-now 를 결정한다 --}}
            <ol class="capply-steps" aria-label="신청 진행 단계">
                @foreach ($steps as $step)
                    <li @class(['capply-step', 'is-done' => $step['state'] === 'done', 'is-now' => $step['state'] === 'now'])
                        @if ($step['state'] === 'now') aria-current="step" @endif>
                        <span class="capply-step__dot" aria-hidden="true"></span>
                        <p class="capply-step__name">{{ $step['name'] }}</p>
                        <p class="capply-step__when">{{ $step['when'] }}</p>
                    </li>
                @endforeach
            </ol>

            <div class="capply-done__actions">
                <a href="{{ route('creator.apply') }}" class="btn btn--ghost">신청 내용 보기</a>
                <a href="{{ route('notifications') }}" class="btn btn--ghost">알림함</a>
                <a href="{{ route('main') }}" class="btn btn--primary">홈으로</a>
            </div>
            <p class="capply-done__hint">이 화면은 상단 <strong>신청 진행 상황</strong> 버튼이나 프로필 메뉴에서 다시 볼 수 있어요.</p>
        </div>

        <div class="capply-next">
            <h2 class="capply-next__title">승인 후 이렇게 진행됩니다</h2>
            <ol class="capply-next__list">
                <li class="capply-next__item">
                    <p class="capply-next__no">NEXT 01</p>
                    <p class="capply-next__name">데뷔 영상 3편 업로드</p>
                    <p class="capply-next__desc">승인 안내를 받으면 크리에이터 스튜디오에서 영상을 올려주세요.</p>
                </li>
                <li class="capply-next__item">
                    <p class="capply-next__no">NEXT 02</p>
                    <p class="capply-next__name">최종 검토</p>
                    <p class="capply-next__desc">품질검사와 정책 심사를 거칩니다.</p>
                </li>
                <li class="capply-next__item">
                    <p class="capply-next__no">NEXT 03</p>
                    <p class="capply-next__name">채널 공개 · 수익 집계 시작</p>
                    <p class="capply-next__desc">채널이 공개되고 광고·구독 수익이 쌓이기 시작합니다.</p>
                </li>
            </ol>
        </div>
    </section>
@endsection
