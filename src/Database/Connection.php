<?php

declare(strict_types=1);

namespace App\Database;

use PDO;
use PDOException;

class Connection
{
    private static ?PDO $instance = null;

    public static function get(): PDO
    {
        if (self::$instance === null) {
            $originalHost = (string) getenv('DB_HOST');
            $port = (string) getenv('DB_PORT');
            $dbName = (string) getenv('DB_NAME');
            $user = (string) getenv('DB_USER');
            $pass = (string) getenv('DB_PASSWORD');

            if (empty($originalHost) || empty($port) || empty($dbName) || empty($user) || empty($pass)) {
                throw new \RuntimeException("[ERRO] Variáveis de ambiente do banco de dados não configuradas corretamente.");
            }

            $host = $originalHost;
            $records = @dns_get_record($host, DNS_A);
            if (!empty($records) && isset($records[0]['ip'])) {
                $host = $records[0]['ip'];
                echo "[INFO] Usando IPv4 resolvido: {$host}\n";
            } else {
                echo "[AVISO] Não foi possível encontrar um endereço IPv4 para {$originalHost}.\n";
                echo "[DICA] Se estiver usando Supabase, mude para o host do 'Pooler' (Transaction mode) nas configurações do banco.\n";
            }

            $dsn = "pgsql:host={$host};port={$port};dbname={$dbName};sslmode=require";

            try {
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_TIMEOUT => 5,
                ]);
            } catch (PDOException $e) {
                echo "[ERRO] Falha crítica de conexão: " . $e->getMessage() . "\n";
                if (str_contains($e->getMessage(), 'Network unreachable')) {
                    echo "[SOLUÇÃO] Seu Docker não suporta IPv6. Use o host do POOLER do Supabase (IPv4 compatível).\n";
                }
                throw $e;
            }
        }

        return self::$instance;
    }
}
