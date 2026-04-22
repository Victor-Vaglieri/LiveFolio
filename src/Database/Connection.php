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
            $host = getenv('DB_HOST') ?: '127.0.0.1'; // TODO - usar variável de ambiente e não hardcoded
            $port = getenv('DB_PORT') ?: '5432'; // TODO - usar variável de ambiente e não hardcoded
            $dbName = getenv('DB_NAME') ?: 'livefolio'; // TODO - usar variável de ambiente e não hardcoded
            $user = getenv('DB_USER') ?: 'postgres'; // TODO - usar variável de ambiente e não hardcoded
            $pass = getenv('DB_PASSWORD') ?: 'postgres'; // TODO - usar variável de ambiente e não hardcoded

            $dsn = "pgsql:host={$host};port={$port};dbname={$dbName}";

            try {
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
            } catch (PDOException $e) {
                echo "[ERRO] Erro ao conectar no PostgreSQL: " . $e->getMessage() . "\n";
                throw $e;
            }
        }

        return self::$instance;
    }
}
