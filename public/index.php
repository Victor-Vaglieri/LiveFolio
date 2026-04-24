<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Webhook\GitHubHandler;
use App\Security\RateLimiter;

$urlDoRedis = $_ENV['REDIS_URL'] ?? getenv('REDIS_URL') ?: '';
$limiter = !empty($urlDoRedis) ? new RateLimiter($urlDoRedis, limit: 30, window: 60) : null;

$handler = new GitHubHandler();

$isWorker = getenv('FRANKENPHP_WORKER') === '1' || function_exists('frankenphp_handle_request');

if ($isWorker) {
    $callback = function () use ($handler, $limiter) {
        handleRequest($handler, $limiter);
    };

    while (frankenphp_handle_request($callback)) {
    }
} else {
    handleRequest($handler, $limiter);
}

function handleRequest(GitHubHandler $handler, ?RateLimiter $limiter): void
{
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    if ($limiter && !$limiter->check("rate_limit:$ip")) {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Too Many Requests', 'retry_after' => 60]);
        return;
    }

    if ($method === 'POST' && $uri === '/webhook/github') {
        $headers = function_exists('getallheaders') ? getallheaders() : getHeadersFromServer();
        $handler->handle(file_get_contents('php://input'), $headers);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
    }
}

function getHeadersFromServer(): array
{
    $headers = [];
    foreach ($_SERVER as $name => $value) {
        if (str_starts_with($name, 'HTTP_')) {
            $key = strtolower(str_replace('_', '-', substr($name, 5)));
            $headers[$key] = $value;
        } elseif ($name === 'CONTENT_TYPE') {
            $headers['content-type'] = $value;
        } elseif ($name === 'CONTENT_LENGTH') {
            $headers['content-length'] = $value;
        }
    }
    return $headers;
}
