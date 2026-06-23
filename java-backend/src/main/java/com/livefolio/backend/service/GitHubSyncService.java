package com.livefolio.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.livefolio.backend.domain.GithubEvent;
import com.livefolio.backend.repository.GithubEventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

/**
 * Serviço de Sincronização Manual com o GitHub.
 * Substitui o bin/import_github.php.
 */
@Service
public class GitHubSyncService {

    private final GithubEventRepository repository;
    private final RedisProjectionService projectionService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${GITHUB_USERNAME:Victor-Vaglieri}")
    private String username;

    @Value("${GITHUB_TOKEN:}")
    private String token;

    public GitHubSyncService(GithubEventRepository repository,
                             RedisProjectionService projectionService,
                             ObjectMapper objectMapper) {
        this.repository = repository;
        this.projectionService = projectionService;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public String syncEvents() {
        System.out.println("[INFO] Iniciando importação histórica para o usuário: " + username);

        String url = "https://api.github.com/users/" + username + "/events/public?per_page=100";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "LiveFolio-App");
        if (token != null && !token.isEmpty()) {
            headers.set("Authorization", "token " + token);
        }

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response;

        try {
            response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        } catch (Exception e) {
            return "[ERRO] Falha ao acessar a API do GitHub: " + e.getMessage();
        }

        int count = 0;
        int updatedCount = 0;

        try {
            JsonNode events = objectMapper.readTree(response.getBody());

            for (JsonNode event : events) {
                if ("PushEvent".equals(event.path("type").asText())) {
                    String repo = event.path("repo").path("name").asText();
                    String author = event.path("actor").path("login").asText();
                    String branch = event.path("payload").path("ref").asText("refs/heads/main");
                    String sha = event.path("payload").path("head").asText(null);

                    JsonNode payloadNode = event.path("payload");
                    
                    // Se estiver vazio os commits, mas tem a HEAD, busca direto do repo
                    if (payloadNode.path("commits").isEmpty() && sha != null) {
                        try {
                            String commitUrl = "https://api.github.com/repos/" + repo + "/commits/" + sha;
                            ResponseEntity<String> commitResponse = restTemplate.exchange(commitUrl, HttpMethod.GET, entity, String.class);
                            JsonNode commitData = objectMapper.readTree(commitResponse.getBody());
                            String message = commitData.path("commit").path("message").asText("No message found");
                            
                            // Modifica o JSON localmente
                            ObjectNode commitObj = objectMapper.createObjectNode();
                            commitObj.put("message", message);
                            ArrayNode commitsArray = objectMapper.createArrayNode();
                            commitsArray.add(commitObj);
                            ((ObjectNode) payloadNode).set("commits", commitsArray);
                        } catch (Exception e) {
                            System.err.println("Aviso: Falha ao buscar dados extras do commit: " + sha);
                        }
                    }

                    String rawPayload = event.toString();

                    if (sha != null && repository.existsByCommit(sha)) {
                        repository.updateByCommit(sha, "push", repo, author, branch, rawPayload);
                        updatedCount++;
                    } else {
                        GithubEvent newEvent = new GithubEvent("push", repo, author, branch, rawPayload);
                        repository.save(newEvent);
                        projectionService.updateProjections("push", repo, author, branch, rawPayload);
                        count++;
                    }
                }
            }
        } catch (Exception e) {
            return "[ERRO] Processamento dos eventos falhou: " + e.getMessage();
        }

        return "[SUCESSO] Importação finalizada! " + count + " eventos novos adicionados e " + updatedCount + " atualizados.";
    }
}
