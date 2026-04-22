<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Database\Connection;

$db = Connection::get();

$sql = "
    CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        source VARCHAR(255),
        ip VARCHAR(45),
        user_agent TEXT,
        path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
";

$db->exec($sql);
echo "[SUCCESS] Tabela 'visits' criada ou já existente.\n";
