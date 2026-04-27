<?php

declare(strict_types=1);

namespace App\Persistence;

use Redis;

class RedisProjection
{
    private Redis $client;

    public function __construct(string $url)
    {
        $this->client = new Redis();
        $config = parse_url($url);
        
        $scheme = $config['scheme'] ?? 'redis';
        $host = $config['host'] ?? null;
        $port = $config['port'] ?? 6379;
        $pass = $config['pass'] ?? null;

        if (!$host) {
            throw new \RuntimeException("[ERRO] Host do Redis não configurado.");
        }
        if ($scheme === 'rediss' || str_contains($url, 'upstash.io')) {
            $host = 'tls://' . $host;
        }

        $this->client->connect($host, (int) $port);
        if ($pass) {
            $this->client->auth($pass);
        }
    }

    public function updateProjections(string $eventType, string $repo, string $author, string $branch, array $payload): void
    {
        $this->client->hIncrBy('stats:repos', $repo, 1);
        $this->client->hIncrBy('stats:authors', $author, 1);
        $language = $payload['repository']['language'] ?? null;
        if ($language) {
            $this->client->hIncrBy('stats:languages', $language, 1);
        }

        $eventData = [
            'type' => $eventType,
            'repo' => $repo,
            'author' => $author,
            'branch' => $branch,
            'timestamp' => time(),
            'message' => $payload['head_commit']['message'] ?? 'No message'
        ];
        
        $this->client->lPush('events:latest', json_encode($eventData));
        $this->client->lTrim('events:latest', 0, 9);
        
        echo "[SUCCESS] Projeções no Redis atualizadas com sucesso\n";
    }
}
