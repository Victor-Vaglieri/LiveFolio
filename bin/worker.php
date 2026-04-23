<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Messaging\RedisStreamConsumer;
use App\Processing\EventProcessor;
use App\Database\Connection;
use App\Persistence\EventRepository;
use App\Persistence\RedisProjection;

$urlRedis = getenv('REDIS_URL');
$stream = 'github_events_stream';

if (!$urlRedis) {
    echo "[ERRO] Variável REDIS_URL não configurada.\n";
    exit(1);
}

echo "[SUCCESS] Iniciando Worker de Eventos\n";
echo "[SUCCESS] Conectando ao Redis: {$urlRedis}\n";

$consumer = new RedisStreamConsumer($urlRedis);

$db = Connection::get();
$repository = new EventRepository($db);
$projection = new RedisProjection($urlRedis);

$processor = new EventProcessor($repository, $projection);

$lastId = '0'; // Processar desde o início do stream para garantir consistência

while (true) {
    try {
        $messages = $consumer->consume($stream, $lastId, 5000);

        foreach ($messages as $id => $data) {
            echo "[SUCCESS] Lida mensagem ID: {$id}\n";
            $eventType = $data['event_type'] ?? 'unknown';

            $processor->process($eventType, $data);
            $lastId = $id;
        }
    } catch (\Throwable $e) {
        echo "[ERRO] Erro no Worker: {$e->getMessage()}\n";
        sleep(2);
    }
}

