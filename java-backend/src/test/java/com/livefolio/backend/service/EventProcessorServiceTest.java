package com.livefolio.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livefolio.backend.domain.GithubEvent;
import com.livefolio.backend.repository.GithubEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

/**
 * Teste unitário para a regra de negócios.
 */
class EventProcessorServiceTest {

    private GithubEventRepository repository;
    private RedisProjectionService projectionService;
    private ObjectMapper objectMapper;
    private EventProcessorService processorService;

    @BeforeEach
    void setUp() {
        repository = mock(GithubEventRepository.class);
        projectionService = mock(RedisProjectionService.class);
        objectMapper = new ObjectMapper();
        
        processorService = new EventProcessorService(repository, projectionService, objectMapper);
    }

    @Test
    void shouldIgnoreNonPushEvents() {
        processorService.process("issues", "{}");
        
        verify(repository, never()).save(any());
        verify(projectionService, never()).updateProjections(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void shouldProcessAndSavePushEvents() {
        String jsonPayload = """
                {
                  "ref": "refs/heads/main",
                  "repository": {
                    "full_name": "victor/livefolio"
                  },
                  "sender": {
                    "login": "victor"
                  }
                }
                """;

        processorService.process("push", jsonPayload);

        ArgumentCaptor<GithubEvent> captor = ArgumentCaptor.forClass(GithubEvent.class);
        verify(repository, times(1)).save(captor.capture());

        GithubEvent savedEvent = captor.getValue();
        assertEquals("victor/livefolio", savedEvent.getRepo());
        assertEquals("victor", savedEvent.getAuthor());
        assertEquals("refs/heads/main", savedEvent.getBranch());
        assertEquals("push", savedEvent.getEventType());
    }
}
