package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.AvatarState;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosEstadoMapa;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosMovimientoAvatar;

import java.util.ArrayList;

/**
 * STOMP WebSocket controller that handles avatar movement messages
 * and broadcasts the full map state to all connected clients at 30 FPS (~33ms).
 */
@Controller
public class GameSessionHandler {

    private static final Logger log = LoggerFactory.getLogger(GameSessionHandler.class);

    /** Default map ID used for broadcasting in MVP (single-map mode). */
    private static final String DEFAULT_MAP_ID = "mundo-1";

    private final SimpMessagingTemplate messagingTemplate;
    private final GameStateStore gameStateStore;

    /**
     * Creates the handler with required dependencies.
     *
             Spring STOMP messaging template
     * @param gameStateStore    in-memory avatar and timer state
     */
    public GameSessionHandler(SimpMessagingTemplate messagingTemplate,
                               GameStateStore gameStateStore) {
        this.messagingTemplate = messagingTemplate;
        this.gameStateStore = gameStateStore;
    }

    /**
     * Handles avatar movement messages from clients.
     * Updates the in-memory position for the given profile.
     *
     * @param movimiento the movement data from the client
                
    @MessageMapping("/mover")
    public void moverAvatar(DatosMovimientoAvatar movimiento) {
        log.debug("Avatar movement: perfilId={} x={} y={} dir={}",
                movim to.perfilId(), movimiento.x(), movimiento.y(), movimiento.direccion());

        final var state = new AvatarState(
                movimiento.perfilId(),        null,   // nombre not sent on each move to save bandwidth
                movimiento.x(),
                movimiento.y(),
                movimiento.direccion()
        );

        gameStateStore.updateAvatar(state);
    }

    /**
     * Broadcasts the current map state to all subscribers at approximately 30 FPS (33 ms interval).
     * Reads all avatar positions from {@link GameStateStore} and sends a snapshot to every client
     * subscribed to {@code /topic/mapa/{mapId}}.
     */
    @Scheduled(fixedRate = 33)
    public void broadcastMapState() {
        final var avatares = new ArrayList<>(gameStateStore.getAllAvatares());

        // Skip broadcast when no avatars are on the map to save resources
        if (avatares.isEmpty()) {
            return;
        }

        final var payload = new DatosEstadoMapa(System.currentTimeMillis(), avatares);
        messagingTemplate.convertAndSend("/topic/mapa/" + DEFAULT_MAP_ID, payload);
    }

    /**
     * Broadcasts the current map state to a specific map channel.
     * Used for testing or multi-map scenarios.
     *
     * @param mapId the map channel identifier
     */
    public void broadcastMapState(String mapId) {
        final var avatares = new ArrayList<>(gameStateStore.getAllAvatares());
        final var payload = new DatosEstadoMapa(System.currentTimeMillis(), avatares);
        messagingTemplate.convertAndSend("/topic/mapa/" + mapId, payload);
    }
}
