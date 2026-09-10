@extends('layouts.app')

@section('title', $doc['title'] . ' · VIBUZZ')

@section('content')
    <section class="doc">
        {{-- 좌측 : 문서 목록 (그룹별) --}}
        <aside class="doc__side" aria-label="문서 목록">
            @php($groups = collect($nav)->groupBy('group'))
            @foreach ($groups as $group => $items)
                <p class="doc__side-title">{{ $group }}</p>
                <nav class="doc__side-nav">
                    @foreach ($items as $item)
                        <a href="{{ route('doc', $item['slug']) }}" @class(['is-active' => $item['slug'] === $slug])
                           @if ($item['slug'] === $slug) aria-current="page" @endif>{{ $item['title'] }}</a>
                    @endforeach
                </nav>
            @endforeach
        </aside>

        {{-- 우측 : 문서 본문 --}}
        <article class="doc__body">
            <header class="doc__head">
                <h1 class="doc__title">{{ $doc['title'] }}</h1>
                <p class="doc__lead">{{ $doc['lead'] }}</p>
                <p class="doc__updated">최종 수정일 {{ $doc['updated'] }}</p>
            </header>

            @foreach ($doc['sections'] as $sec)
                <section class="doc__section">
                    <h2 class="doc__h">{{ $sec['h'] }}</h2>

                    @foreach ($sec['p'] ?? [] as $para)
                        <p class="doc__p">{{ $para }}</p>
                    @endforeach

                    @if (!empty($sec['list']))
                        <ul class="doc__list">
                            @foreach ($sec['list'] as $li)
                                <li>{{ $li }}</li>
                            @endforeach
                        </ul>
                    @endif

                    {{-- 회사소개 : 지표 --}}
                    @if (!empty($sec['stats']))
                        <div class="doc__stats">
                            @foreach ($sec['stats'] as $stat)
                                <div class="doc__stat">
                                    <p class="doc__stat-label">{{ $stat['label'] }}</p>
                                    <p class="doc__stat-value">{{ $stat['value'] }}</p>
                                </div>
                            @endforeach
                        </div>
                    @endif

                    {{-- 회사소개 : 회사 정보 --}}
                    @if (!empty($sec['dl']))
                        <dl class="doc__dl">
                            @foreach ($sec['dl'] as $row)
                                <div><dt>{{ $row[0] }}</dt><dd>{{ $row[1] }}</dd></div>
                            @endforeach
                        </dl>
                    @endif

                    {{-- 채용 : 포지션 --}}
                    @if (!empty($sec['jobs']))
                        <ul class="doc__jobs">
                            @foreach ($sec['jobs'] as $job)
                                <li class="doc__job">
                                    <span class="doc__job-team">{{ $job['team'] }}</span>
                                    <span class="doc__job-title">{{ $job['title'] }}</span>
                                    <span class="doc__job-type">{{ $job['type'] }}</span>
                                </li>
                            @endforeach
                        </ul>
                    @endif

                    {{-- 뉴스룸 : 소식 --}}
                    @if (!empty($sec['news']))
                        <ul class="doc__news">
                            @foreach ($sec['news'] as $n)
                                <li class="doc__news-item">
                                    <span class="doc__news-tag">{{ $n['tag'] }}</span>
                                    <span class="doc__news-title">{{ $n['title'] }}</span>
                                    <span class="doc__news-date">{{ $n['date'] }}</span>
                                </li>
                            @endforeach
                        </ul>
                    @endif
                </section>
            @endforeach
        </article>
    </section>
@endsection
