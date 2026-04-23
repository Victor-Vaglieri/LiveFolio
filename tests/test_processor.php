<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Database\Connection;
use App\Persistence\EventRepository;
use App\Persistence\RedisProjection;
use App\Processing\EventProcessor;

echo "[TEST] Iniciando teste do EventProcessor e Persistência...\n";

try {
    $db = Connection::get();
    $redisUrl = getenv('REDIS_URL');
    if (!$redisUrl) {
        throw new \RuntimeException("[ERRO] Variável de ambiente REDIS_URL não configurada.");
    }
    
    $repository = new EventRepository($db);
    $projection = new RedisProjection($redisUrl);
    
    $processor = new EventProcessor($repository, $projection);
    
    $payloadData = [
        'ref' => 'refs/heads/main',
        'repository' => [
            'name' => 'livefolio',
            'full_name' => 'victor/livefolio'
        ],
        'pusher' => [
            'name' => 'victor'
        ],
        'head_commit' => [
            'message' => 'Test commit for processor'
        ]
    ];
    
    $eventData = [
        'event_type' => 'push',
        'payload' => json_encode($payloadData)
    ];
    
    $processor->process('push', $eventData);
    
    echo "[SUCCESS] Processamento e persistência concluídos sem lançar exceções.\n";
} catch (\Throwable $e) {
    echo "[ERRO] Falha no teste do processador: " . $e->getMessage() . "\n";
    exit(1);
}
