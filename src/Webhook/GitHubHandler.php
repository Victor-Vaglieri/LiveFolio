<?php

declare(strict_types=1);

namespace App\Webhook;

class GitHubHandler
{
    private string $secret;

    public function __construct()
    {
        $this->secret = $_ENV['GITHUB_WEBHOOK_SECRET'] ?? getenv('GITHUB_WEBHOOK_SECRET') ?: '';
    }

    public function handle(string $payload, array $headers): void
    {
        if (!$this->validateSignature($payload, $headers)) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid signature']);
            return;
        }

        // TODO: Enviar para o Kafka
        http_response_code(202);
        echo json_encode(['status' => 'Event received and validation passed']);
    }

    private function validateSignature(string $payload, array $headers): bool
    {
        $signature = $headers['x-hub-signature-256'] ?? $headers['X-Hub-Signature-256'] ?? null;

        if (!$signature || empty($this->secret)) {
            return false;
        }

        $hash = 'sha256=' . hash_hmac('sha256', $payload, $this->secret);

        return hash_equals($hash, (string) $signature);
    }
}
