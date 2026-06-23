package com.livefolio.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Endpoint para receber Webhooks do GitHub.
 */
@RestController
@RequestMapping("/webhook")
public class GitHubWebhookController {

    private final StringRedisTemplate redisTemplate;
    private final String secret;

    public GitHubWebhookController(
            StringRedisTemplate redisTemplate,
            @Value("${GITHUB_WEBHOOK_SECRET:}") String secret) {
        this.redisTemplate = redisTemplate;
        this.secret = secret;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "unknown") String eventType,
            @RequestBody String payload) {

        // Validação de assinatura
        if (!validateSignature(payload, signature)) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid signature");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            Map<String, String> eventData = new HashMap<>();
            eventData.put("payload", payload);
            eventData.put("received_at", Instant.now().toString());
            eventData.put("event_type", eventType);

            MapRecord<String, String, String> record = StreamRecords.newRecord()
                    .in("github_events_stream")
                    .ofStrings(eventData);

            redisTemplate.opsForStream().add(record);

            Map<String, String> response = new HashMap<>();
            response.put("status", "Event received and pushed to stream");
            return ResponseEntity.accepted().body(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Internal server error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private boolean validateSignature(String payload, String signature) {
        System.out.println("Received signature: " + signature);
        System.out.println("Secret is empty? " + (secret == null || secret.isEmpty()));
        System.out.println("Secret length: " + (secret == null ? 0 : secret.length()));
        
        if (signature == null || secret == null || secret.isEmpty()) {
            return false;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hashBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            String expectedSignature = "sha256=" + sb.toString();
            
            System.out.println("Expected signature: " + expectedSignature);

            return java.security.MessageDigest.isEqual(expectedSignature.getBytes(), signature.getBytes());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
