package uk.jimsimrodev.pequenos_sanos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over SockJS WebSocket configuration.
 * Registers the game endpoint and configures the in-memory message broker.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configures the message broker for pub/sub and user queues.
     *
     * @param registry the message broker registry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Simple in-memory broker for topic broadcasts and user queues
        registry.enableSimpleBroker("/topic", "/user");
        // Prefix for client-to-server messages handled by @MessageMapping
        registry.setApplicationDestinationPrefixes("/app");
        // Prefix for user-specific destinations (/user/queue/...)
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Registers the STOMP endpoint with SockJS fallback.
     *
     * @param registry the STOMP endpoint registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/game")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
