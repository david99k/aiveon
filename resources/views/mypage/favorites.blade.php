@extends('layouts.app')

@section('title', '즐겨찾기 · AIVEON')

{{-- 사이드바가 푸터까지 이어지도록 (body.is-mypage) --}}
@section('body-class', 'is-mypage')

@section('content')
    <section class="mypage">
        @include('partials.mypage-sidebar')

        {{-- 우측 : 즐겨찾기 리스트 (세로 포스터 카드 그리드) --}}
        <div class="mypage__content">
            <h2 class="mypage__page-title">즐겨찾기 리스트</h2>

            <div class="fav-grid">
                @foreach ($favorites as $item)
                    <x-poster-card :item="$item" />
                @endforeach
            </div>
        </div>
    </section>
@endsection
