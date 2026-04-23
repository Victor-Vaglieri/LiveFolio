<?php

declare(strict_types=1);

namespace App\Messaging;

use Redis;

class RedisStreamProducer
{
    private Redis $client;

    public function __construct(string $url)
    {
        $this->client = new Redis();
        
        $configuracao = parse_url($url);
        
        $host = $configuracao['host'] ?? null;
        $porta = $configuracao['port'] ?? 6379;
        $senha = $configuracao['pass'] ?? null;

        if (!$host) {
            throw new \RuntimeException("[ERRO] Host do Redis não configurado.");
        }

        $this->client->connect($host, (int) $porta);

        if ($senha) {
            $this->client->auth($senha);
        }
    }

    public function produce(string $streamName, array $data): void
    {
        $resultado = $this->client->xAdd($streamName, '*', $data);

        if (!$resultado) {
            throw new \RuntimeException("[ERRO] Falha ao enviar mensagem para o Redis Stream: {$streamName}");
        }
    }
}
