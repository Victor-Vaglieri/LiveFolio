package com.livefolio.backend.controller;

import com.livefolio.backend.service.GitHubSyncService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller administrativo para acionar a sincronização.
 * Permite chamar a lógica do antigo import_github.php via API Rest.
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final GitHubSyncService syncService;

    @Value("${ADMIN_SECRET:}")
    private String adminSecret;

    public AdminController(GitHubSyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> triggerSync(@RequestHeader(value = "Authorization", defaultValue = "") String authorization) {
        Map<String, String> response = new HashMap<>();

        // Validação básica (Aprimoramento Profissional para substituir o script solto)
        if (adminSecret == null || adminSecret.isEmpty() || !authorization.equals("Bearer " + adminSecret)) {
            response.put("error", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Executa a importação
        String result = syncService.syncEvents();
        response.put("message", result);

        return ResponseEntity.ok(response);
    }
}
