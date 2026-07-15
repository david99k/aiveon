<?php

/*
 * [QA 전용] PHP 내장 서버(php -S)용 라우터.
 *
 * 내장 서버는 HTTP Range 요청을 지원하지 않아 <video> 시킹(구간 이동)이
 * 동작하지 않는다(브라우저가 seekable=0으로 판단). 이 라우터는 동영상
 * 파일에 한해 Range를 직접 처리하고, 나머지 요청은 내장 서버 기본
 * 정적 파일 처리로 넘긴다(return false).
 *
 * 사용:  php -S localhost:8123 router.php   (public 폴더에서)
 * 실서버(Apache/nginx)는 Range를 기본 지원하므로 이 파일이 필요 없다.
 */

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . str_replace(['..', "\0"], '', rawurldecode($path));

$extensions = ['mp4' => 'video/mp4', 'webm' => 'video/webm', 'ogg' => 'video/ogg'];
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

if (!isset($extensions[$ext]) || !is_file($file)) {
    return false; // 동영상 외 요청은 내장 서버가 처리
}

$size = filesize($file);
$start = 0;
$end = $size - 1;

if (isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $m)) {
    if ($m[1] !== '') {
        $start = (int) $m[1];
    }
    if ($m[2] !== '') {
        $end = min((int) $m[2], $size - 1);
    } elseif ($m[1] === '') {
        // bytes=-N : 마지막 N바이트
        $start = max(0, $size - (int) $m[2]);
    }

    if ($start > $end || $start >= $size) {
        header('HTTP/1.1 416 Range Not Satisfiable');
        header("Content-Range: bytes */{$size}");
        exit;
    }

    header('HTTP/1.1 206 Partial Content');
    header("Content-Range: bytes {$start}-{$end}/{$size}");
}

header('Accept-Ranges: bytes');
header('Content-Type: ' . $extensions[$ext]);
header('Content-Length: ' . ($end - $start + 1));

$fp = fopen($file, 'rb');
fseek($fp, $start);
$remain = $end - $start + 1;

while ($remain > 0 && !feof($fp) && !connection_aborted()) {
    $chunk = fread($fp, min(131072, $remain));
    echo $chunk;
    flush();
    $remain -= strlen($chunk);
}

fclose($fp);
