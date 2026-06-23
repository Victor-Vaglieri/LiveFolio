package com.livefolio.backend.config;

import com.livefolio.backend.messaging.RedisStreamConsumerListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.data.redis.stream.Subscription;

import java.time.Duration;

/**
 * Configuração que cria o worker background para ler a fila do Redis.
 */
@Configuration
public class RedisStreamConfig {

    @Bean
    public Subscription subscription(RedisConnectionFactory factory, RedisStreamConsumerListener listener) {
        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options =
                StreamMessageListenerContainer.StreamMessageListenerContainerOptions.builder()
                        .pollTimeout(Duration.ofMillis(100))
                        .build();

        StreamMessageListenerContainer<String, MapRecord<String, String, String>> container =
                StreamMessageListenerContainer.create(factory, options);

        Subscription subscription = container.receive(
                StreamOffset.latest("github_events_stream"),
                listener
        );
        container.start();

        return subscription;
    }
}
