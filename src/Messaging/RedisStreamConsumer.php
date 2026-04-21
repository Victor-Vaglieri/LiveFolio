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
        
        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? 6379;
        $pass = $config['pass'] ?? null;

        $this->client->connect($host, (int) $port);
        if ($pass) {
            $this->client->auth($pass);
        }
    }

    /**
     * Lê mensagens do stream. 
     * @param string $stream Nome do stream
     * @param string $lastId ID da última mensagem lida (padrão '$' para novas)
     * @param int $block Tempo em ms para bloquear esperando novas mensagens (0 = infinito)
     */
    public function consume(string $stream, string $lastId = '0', int $block = 0): array
    {
        $result = $this->client->xRead([$stream => $lastId], 0, $block);
        
        return $result[$stream] ?? [];
    }
}
