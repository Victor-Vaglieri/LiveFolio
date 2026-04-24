<?php

declare(strict_types=1);

namespace App\Security;

use Redis;

class RateLimiter
{
    private Redis $client;
    private int $limit;
    private int $window;

    public function __construct(string $url, int $limit = 60, int $window = 60)
    {
        $this->client = new Redis();
        $config = parse_url($url);
        
        $scheme = $config['scheme'] ?? 'redis';
        $host = $config['host'] ?? 'localhost';
        $port = $config['port'] ?? 6379;
        $pass = $config['pass'] ?? null;

        if ($scheme === 'rediss' || str_contains($url, 'upstash.io')) {
            $host = 'tls://' . $host;
        }

        $this->client->connect($host, (int) $port, 5.0);

        if ($pass) {
            $this->client->auth($pass);
        }

        $this->limit = $limit;
        $this->window = $window;
    }

    public function check(string $key): bool
    {
        $current = $this->client->get($key);

        if ($current !== false && (int)$current >= $this->limit) {
            return false;
        }

        if ($current === false) {
            $this->client->setex($key, $this->window, 1);
        } else {
            $this->client->incr($key);
        }

        return true;
    }

    public function getRemaining(string $key): int
    {
        $current = $this->client->get($key);
        if ($current === false) {
            return $this->limit;
        }
        return max(0, $this->limit - (int)$current);
    }
}
