<?php

declare(strict_types=1);

namespace App\Persistence;

use PDO;

class EventRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->initializeTable();
    }

    private function initializeTable(): void
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS github_events (
                id SERIAL PRIMARY KEY,
                event_type VARCHAR(100) NOT NULL,
                repo VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                branch VARCHAR(255) NOT NULL,
                payload JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ";
        $this->db->exec($sql);
    }

    public function save(string $eventType, string $repo, string $author, string $branch, array $payload): void
    {
        $sql = "INSERT INTO github_events (event_type, repo, author, branch, payload) VALUES (:type, :repo, :author, :branch, :payload)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':type' => $eventType,
            ':repo' => $repo,
            ':author' => $author,
            ':branch' => $branch,
            ':payload' => json_encode($payload)
        ]);
        
        echo "[SUCCESS] Evento salvo no PostgreSQL com sucesso\n";
    }

    public function existsByCommit(string $sha): bool
    {
        $sql = "SELECT 1 FROM github_events 
                WHERE payload->>'after' = :sha 
                   OR payload->'head_commit'->>'id' = :sha 
                   OR payload->'payload'->>'head' = :sha 
                LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':sha' => $sha]);
        return (bool) $stmt->fetchColumn();
    }
}
