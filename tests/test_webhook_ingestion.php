<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

$secret = getenv('GITHUB_WEBHOOK_SECRET') ?: 'projeto_livefolio_secret_123';
$webhookUrl = getenv('WEBHOOK_URL') ?: 'http://localhost/webhook/github';
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
        'message' => 'Test commit from manual ingestion script - fixed redirect'
    ]
];

$payload = json_encode($payloadData);
$signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);

echo "[SUCCESS] Iniciando Teste de Ingestão\n";

$ch = curl_init($webhookUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
// TODO verificar isso aqui - idealmente o certificado deveria ser válido, mas para facilitar o desenvolvimento local, vamos ignorar a verificação de SSL.
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // <--- Ignorar verificação de certificado
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // <--- Ignorar verificação de host
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

if ($httpCode === 429) {
    echo "[AVISO] Você atingiu o Rate Limit! O backend bloqueou a requisição propositalmente para segurança.\n";
    exit(0);
}

if ($httpCode !== 202) {
    echo "[ERRO] O backend não retornou o status 202 (Accepted)\n";
    exit(1);
}

echo "[SUCCESS] Evento enviado com sucesso. Aguarde o processamento do Worker.\n";
