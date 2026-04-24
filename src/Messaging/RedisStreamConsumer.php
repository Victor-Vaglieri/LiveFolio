<?php

declare(strict_types=1);

namespace App\Messaging;

use Redis;

class RedisStreamConsumer
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
        $this->client->connect($host, (int) $port, 5.0);
        
        if ($pass) {
            $this->client->auth($pass);
        }
    }

    public function consume(string $stream, string $lastId = '0', int $block = 0): array
    {
        $result = $this->client->xRead([$stream => $lastId], 0, $block);
        
        return $result[$stream] ?? [];
    }
}
