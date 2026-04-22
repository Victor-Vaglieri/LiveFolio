<?php

declare(strict_types=1);

namespace App\Processing;

use App\Persistence\EventRepository;
use App\Persistence\RedisProjection;

class EventProcessor
{
    public function __construct(
        private readonly EventRepository $repository,
        private readonly RedisProjection $projection
    ) {}

    public function process(string $eventType, array $payload): void
    {
        echo "[SUCCESS] Processando evento: {$eventType}\n";
        echo "[SUCCESS] Chaves do Payload: " . implode(', ', array_keys($payload)) . "\n";

        // Exemplo de Regra de Negócio: Ignorar eventos que não sejam 'push'
        if ($eventType !== 'push') {
            echo "[WARNING] Evento ignorado (não é um push)\n";
            return;
        }

        $data = json_decode($payload['payload'] ?? '', true);
        
        if (!$data) {
            echo "[ERRO] Payload inválido\n";
            return;
        }
        $repo = $data['repository']['full_name'] ?? 'unknown';
        $author = $data['pusher']['name'] ?? 'unknown';
        $branch = $data['ref'] ?? 'unknown';

        echo "[SUCCESS] Dados extraídos: Repo: {$repo} | Autor: {$author} | Branch: {$branch}\n";

        try {
            $this->repository->save($eventType, $repo, $author, $branch, $data);
            $this->projection->updateProjections($eventType, $repo, $author, $branch, $data);
        } catch (\Throwable $e) {
            echo "[ERRO] Falha na persistência/projeção: " . $e->getMessage() . "\n";
        }
    }
}
