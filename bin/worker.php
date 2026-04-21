<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Messaging\RedisStreamConsumer;
use App\Processing\EventProcessor;

$urlRedis = getenv('REDIS_URL') ?: 'redis://redis:6379';
$stream = 'github_events_stream';

echo "[SUCCESS] Iniciando Worker de Eventos\n";
echo "[SUCCESS] Conectando ao Redis: {$urlRedis}\n";

$consumer = new RedisStreamConsumer($urlRedis);
$processor = new EventProcessor();

// Começamos lendo a partir das novas mensagens ($)
$lastId = '$';

while (true) {
    try {
        // Bloqueia por 5 segundos esperando nova mensagem
        $messages = $consumer->consume($stream, $lastId, 5000);

        foreach ($messages as $id => $data) {
            echo "[SUCCESS] Lida mensagem ID: {$id}\n";
            $eventType = $data['event_type'] ?? 'unknown';

            $processor->process($eventType, $data);

            // Atualiza o ID para a próxima leitura
            $lastId = $id;
        }
    } catch (\Throwable $e) {
        echo "[ERRO] Erro no Worker: {$e->getMessage()}\n";
        sleep(2); // Evita loop frenético em caso de erro de conexão
    }
}

