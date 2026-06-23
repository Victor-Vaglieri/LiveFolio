package com.livefolio.backend.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entidade que mapeia a tabela github_events no banco de dados.
 */
@Entity
@Table(name = "github_events")
public class GithubEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(nullable = false, length = 255)
    private String repo;

    @Column(nullable = false, length = 255)
    private String author;

    @Column(nullable = false, length = 255)
    private String branch;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public GithubEvent() {
    }

    public GithubEvent(String eventType, String repo, String author, String branch, String payload) {
        this.eventType = eventType;
        this.repo = repo;
        this.author = author;
        this.branch = branch;
        this.payload = payload;
    }

    public Long getId() { return id; }
    public String getEventType() { return eventType; }
    public String getRepo() { return repo; }
    public String getAuthor() { return author; }
    public String getBranch() { return branch; }
    public String getPayload() { return payload; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
