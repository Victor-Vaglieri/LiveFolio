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

        $urlDoRedis = $_ENV['REDIS_URL'] ?? getenv('REDIS_URL') ?: '';
        
        if (empty($urlDoRedis)) {
            http_response_code(500);
            echo json_encode(['error' => 'Configuração do Redis ausente']);
            return;
        }

        try {
            $produtor = new \App\Messaging\RedisStreamProducer($urlDoRedis);
            $normalizedHeaders = array_change_key_case($headers, CASE_LOWER);
            $eventType = $normalizedHeaders['x-github-event'] ?? 'unknown';

            $dadosDoEvento = [
                'payload' => $payload,
                'received_at' => date('c'),
                'event_type' => $eventType
            ];

            $produtor->produce('github_events_stream', $dadosDoEvento);

            http_response_code(202);
            echo json_encode(['status' => 'Event received and pushed to stream']);
        } catch (\Throwable $erro) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error', 'message' => $erro->getMessage()]);
        }
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
