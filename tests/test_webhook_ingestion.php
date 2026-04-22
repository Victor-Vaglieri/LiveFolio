<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

$secret = 'projeto_livefolio_secret_123';
$payload = json_encode([
    'ref' => 'refs/heads/main',
    'repository' => [
        'name' => 'livefolio',
        'full_name' => 'victor/livefolio'
    ],
    'pusher' => [
        $signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        echo "[SUCCESS] Iniciando Teste de Ingestão\n";

        $ch = curl_init('https://localhost/webhook/github');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-GitHub-Event: push',
            'X-Hub-Signature-256: ' . $signature
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        echo "[SUCCESS] Enviando webhook para o backend\n";
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        echo "[SUCCESS] Resposta do Servidor: HTTP {$httpCode} - {$response}\n";

        if ($httpCode !== 202) {
            echo "[ERRO] O backend não retornou o status 202 (Accepted)\n";
            exit(1);
        }

        echo "[SUCCESS] Verificando se o evento chegou no Redis Stream\n";
        $redis = new Redis();
        try {
            $redis->connect('redis', 6379);
            $events = $redis->xRead(['github_events_stream' => '0'], 1);

            if (empty($events)) {
                echo "[ERRO] Nenhum evento encontrado no Redis Stream: github_events_stream\n";
                exit(1);
            }

            $streamData = $events['github_events_stream'];
            $lastEvent = end($streamData);
            $payloadNoRedis = $lastEvent['payload'];

            if ($payloadNoRedis === $payload) {
                echo "[SUCCESS] O payload no Redis coincide com o enviado!\n";
                echo "[SUCCESS] Teste Concluído com Êxito\n";
            } else {
                echo "[ERRO] O payload no Redis está diferente do enviado\n";
                exit(1);
            }

        } catch (Exception $e) {
            echo "[ERRO] Conexão com Redis: {$e->getMessage()}\n";
            exit(1);
        }

