<?php

declare(strict_types=1);

namespace App\Processing;

class EventProcessor
{
    /**
     * Processa um evento individual vindo do Redis
     */
    public function process(string $eventType, array $payload): void
    {
        echo "[SUCCESS] Processando evento: {$eventType}\n";
        echo "[SUCCESS] Chaves do Payload: " . implode(', ', array_keys($payload)) . "\n";

        // Exemplo de Regra de Negócio: Ignorar eventos que não sejam 'push'
        if ($eventType !== 'push') {
            echo "[WARNING] Evento ignorado (não é um push)\n";
            return;
        }

        // Decodificar o JSON do payload
        $data = json_decode($payload['payload'] ?? '', true);
        
        if (!$data) {
            echo "[ERRO] Payload inválido\n";
            return;
        }

        // Extrair informações relevantes
        $repo = $data['repository']['full_name'] ?? 'unknown';
        $author = $data['pusher']['name'] ?? 'unknown';
        $branch = $data['ref'] ?? 'unknown';

        echo "[SUCCESS] Dados extraídos: Repo: {$repo} | Autor: {$author} | Branch: {$branch}\n";
        
        // Aqui na Etapa 3 enviaremos para o PostgreSQL/Redis Projections
    }
}
