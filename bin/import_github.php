<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Database\Connection;
use App\Persistence\EventRepository;
use App\Persistence\RedisProjection;

$username = getenv('GITHUB_USERNAME') ?: 'Victor-Vaglieri'; 

echo "[INFO] Iniciando importação histórica para o usuário: $username\n";

try {
    $pdo = Connection::get();
    $repository = new EventRepository($pdo);
    $redisUrl = getenv('REDIS_URL') ?: 'redis://redis:6379';
    
    $projection = new RedisProjection($redisUrl);
} catch (\Exception $e) {
    echo "[ERRO] Falha na inicialização: " . $e->getMessage() . "\n";
    exit(1);
}

$apiUrl = "https://api.github.com/users/$username/events/public?per_page=100";
$token = getenv('GITHUB_TOKEN');

$headers = "User-Agent: LiveFolio-App\r\n";
if ($token) {
    $headers .= "Authorization: token $token\r\n";
}

$options = [
    'http' => [
        'method' => "GET",
        'header' => $headers
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($apiUrl, false, $context);

if (!$response) {
    echo "[ERRO] Não foi possível acessar a API do GitHub. Verifique se o username '$username' está correto.\n";
    exit(1);
}

$events = json_decode($response, true);
$count = 0;

foreach ($events as $event) {
    if ($event['type'] === 'PushEvent') {
        $repo = $event['repo']['name'];
        $author = $event['actor']['login'];
        $branch = $event['payload']['ref'] ?? 'refs/heads/main';
        
        if (empty($event['payload']['commits']) && isset($event['payload']['head'])) {
            $sha = $event['payload']['head'];
            $commitUrl = "https://api.github.com/repos/$repo/commits/$sha";
            $commitResponse = @file_get_contents($commitUrl, false, $context);
            if ($commitResponse) {
                $commitData = json_decode($commitResponse, true);
                $event['payload']['commits'][0]['message'] = $commitData['commit']['message'] ?? 'No message found';
            }
        }

        try {
            $repository->save('push', $repo, $author, $branch, $event);
            $projection->updateProjections('push', $repo, $author, $branch, $event);
            
            echo "[OK] Importado: Commit em $repo ($branch)\n";
            $count++;
        } catch (\Exception $e) {
            continue;
        }
    }
}

echo "\n[SUCESSO] Importação finalizada! $count eventos foram adicionados ao seu portfólio.\n";
echo "[DICA] Agora seu frontend deve exibir essas atividades imediatamente.\n";
