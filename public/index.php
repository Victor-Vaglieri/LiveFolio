<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Webhook\GitHubHandler;

$handler = new GitHubHandler();

$isWorker = getenv('FRANKENPHP_WORKER') === '1' || function_exists('frankenphp_handle_request');

if ($isWorker) {
    $callback = function () use ($handler) {
        handleRequest($handler);
    };

    while (frankenphp_handle_request($callback)) {
    }
} else {
    handleRequest($handler);
}

function handleRequest(GitHubHandler $handler): void
{
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($method === 'POST' && $uri === '/webhook/github') {
        // Obter headers de forma compatível
        $headers = function_exists('getallheaders') ? getallheaders() : getHeadersFromServer();
        // error_log("SERVER: " . json_encode($_SERVER));
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
