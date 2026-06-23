package com.livefolio.backend.repository;

import com.livefolio.backend.domain.GithubEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repositório para acessar a tabela github_events.
 */
@Repository
public interface GithubEventRepository extends JpaRepository<GithubEvent, Long> {

    // Utilizando @Query nativa do Spring Data JPA.
    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM github_events " +
            "WHERE payload->>'after' = :sha " +
            "   OR payload->'head_commit'->>'id' = :sha " +
            "   OR payload->'payload'->>'head' = :sha", 
            nativeQuery = true)
    boolean existsByCommit(@Param("sha") String sha);

    // O @Modifying diz ao Spring que isso é um comando de escrita (UPDATE), e não de leitura (SELECT).
    @Modifying
    @Query(value = "UPDATE github_events " +
            "SET event_type = :type, repo = :repo, author = :author, branch = :branch, payload = CAST(:payload AS jsonb) " +
            "WHERE payload->>'after' = :sha " +
            "   OR payload->'head_commit'->>'id' = :sha " +
            "   OR payload->'payload'->>'head' = :sha", 
            nativeQuery = true)
    void updateByCommit(
            @Param("sha") String sha,
            @Param("type") String eventType,
            @Param("repo") String repo,
            @Param("author") String author,
            @Param("branch") String branch,
            @Param("payload") String payload
    );
}
