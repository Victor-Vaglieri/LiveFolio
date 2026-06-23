package com.livefolio.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Serviço responsável pelas projeções de dados rápidos no Redis.
 */
@Service
public class RedisProjectionService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    // Injeção de dependência pelo Spring.
    // O StringRedisTemplate já possui a conexão pronta e gerenciada.
    public RedisProjectionService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void updateProjections(String eventType, String repo, String author, String branch, String rawPayload) {
        try {
            // Utilizamos o ObjectMapper para navegar facilmente pelo JSON do payload
            JsonNode payloadNode = objectMapper.readTree(rawPayload);

            redisTemplate.opsForHash().increment("stats:repos", repo, 1);
            redisTemplate.opsForHash().increment("stats:authors", author, 1);

            JsonNode languageNode = payloadNode.path("repository").path("language");
            if (!languageNode.isMissingNode() && !languageNode.isNull()) {
                redisTemplate.opsForHash().increment("stats:languages", languageNode.asText(), 1);
            }

            JsonNode messageNode = payloadNode.path("head_commit").path("message");
            String message = messageNode.isMissingNode() ? "No message" : messageNode.asText();

            Map<String, Object> eventData = new HashMap<>();
            eventData.put("type", eventType);
            eventData.put("repo", repo);
            eventData.put("author", author);
            eventData.put("branch", branch);
            eventData.put("timestamp", Instant.now().getEpochSecond());
            eventData.put("message", message);

            String eventJson = objectMapper.writeValueAsString(eventData);

            redisTemplate.opsForList().leftPush("events:latest", eventJson);
            redisTemplate.opsForList().trim("events:latest", 0, 9);

        } catch (Exception e) {
            System.err.println("[ERRO] Falha ao atualizar projeções no Redis: " + e.getMessage());
        }
    }
}
