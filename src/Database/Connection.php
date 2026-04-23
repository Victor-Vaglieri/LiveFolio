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
            $host = getenv('DB_HOST');
            $port = getenv('DB_PORT');
            $dbName = getenv('DB_NAME');
            $user = getenv('DB_USER');
            $pass = getenv('DB_PASSWORD');

            if (!$host || !$port || !$dbName || !$user || !$pass) {
                throw new \RuntimeException("[ERRO] Variáveis de ambiente do banco de dados não configuradas corretamente.");
            }

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
