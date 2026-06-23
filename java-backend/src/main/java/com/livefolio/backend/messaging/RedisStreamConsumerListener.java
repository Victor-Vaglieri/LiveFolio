package com.livefolio.backend.messaging;

import com.livefolio.backend.service.EventProcessorService;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Component;

/**
 * Fica escutando a fila no Redis em background.
 */
@Component
public class RedisStreamConsumerListener implements StreamListener<String, MapRecord<String, String, String>> {

    private final EventProcessorService eventProcessorService;

    public RedisStreamConsumerListener(EventProcessorService eventProcessorService) {
        this.eventProcessorService = eventProcessorService;
    }

    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        try {
            String eventType = message.getValue().get("event_type");
            String payload = message.getValue().get("payload");

            if (eventType != null && payload != null) {
                eventProcessorService.process(eventType, payload);
            }
        } catch (Exception e) {
            System.err.println("[ERRO] Falha ao processar mensagem do Redis: " + e.getMessage());
        }
    }
}
