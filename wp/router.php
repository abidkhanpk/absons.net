<?php
// Simple router for PHP's built-in server: serve files directly when they exist,
// otherwise fall back to WordPress front controller.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$fullPath = __DIR__ . $path;

// Redirect legacy /plugins.php to the real admin path.
if ($path === '/plugins.php') {
    header('Location: /wp-admin/plugins.php', true, 301);
    exit;
}

if ($path !== '/' && file_exists($fullPath) && !is_dir($fullPath)) {
    return false;
}

$_SERVER['SCRIPT_NAME'] = '/index.php';
require __DIR__ . '/index.php';
