package com.livefolio.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.livefolio.backend.domain.GithubEvent;
import com.livefolio.backend.repository.GithubEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável por processar as regras de negócio dos eventos recebidos.
 */
@Service
public class EventProcessorService {

    private final GithubEventRepository repository;
    private final RedisProjectionService projectionService;
    private final ObjectMapper objectMapper;

    public EventProcessorService(
            GithubEventRepository repository,
            RedisProjectionService projectionService,
            ObjectMapper objectMapper) {
        this.repository = repository;
        this.projectionService = projectionService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void process(String eventType, String rawPayload) {
        System.out.println("[SUCCESS] Processando evento: " + eventType);

        if (!"push".equals(eventType)) {
            System.out.println("[WARNING] Evento ignorado (não é um push)");
            return;
        }

        try {
            JsonNode data = objectMapper.readTree(rawPayload);

            JsonNode repoNode = data.path("repository").path("full_name");
            String repo = repoNode.isMissingNode() ? "unknown" : repoNode.asText();

            JsonNode senderNode = data.path("sender").path("login");
            JsonNode pusherNode = data.path("pusher").path("name");
            String author = !senderNode.isMissingNode() ? senderNode.asText() : 
                            (!pusherNode.isMissingNode() ? pusherNode.asText() : "unknown");

            JsonNode refNode = data.path("ref");
            String branch = refNode.isMissingNode() ? "unknown" : refNode.asText();

            System.out.println("[SUCCESS] Dados extraídos: Repo: " + repo + " | Autor: " + author + " | Branch: " + branch);

            GithubEvent event = new GithubEvent(eventType, repo, author, branch, rawPayload);
            repository.save(event);
            System.out.println("[SUCCESS] Evento salvo no PostgreSQL com sucesso");

            projectionService.updateProjections(eventType, repo, author, branch, rawPayload);

        } catch (Exception e) {
            System.err.println("[ERRO] Falha na persistência/projeção: " + e.getMessage());
        }
    }
}
