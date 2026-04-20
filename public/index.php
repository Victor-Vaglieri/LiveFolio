<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Webhook\GitHubHandler;

$uri = $_SERVER['REQUEST_URI'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'POST' && $uri === '/webhook/github') {
    $handler = new GitHubHandler();
    $handler->handle(file_get_contents('php://input'), getallheaders());
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not Found']);
