package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.AvatarState;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosEstadoMapa;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosMovimientoAvatar;

import java.util.ArrayList;

/**
 * STOMP WebSocket controller that handles avatar movement messages
 * and broadcasts map state to all connected clients.
 */
@Controller
public class GameSessionHandler {

    private static final Logger log = LoggerFactory.getLogger(GameSessionHandler.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final GameStateStore gameStateStore;

    /**
     * Creates the handler with required dependencies.
     *
     * @param messagingTemplate Spring STOMP messaging template
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
     */
    @MessageMapping("/mover")
    public void moverAvatar(DatosMovimientoAvatar movimiento) {
        log.debug("Avatar movement: perfilId={} x={} y={}", 
                movimiento.perfilId(), movimiento.x(), movimiento.y());

        final var state = new AvatarState(
                movimiento.perfilId(),
                null,   // nombre fetched from GameStateStore on next broadcast
                movimiento.x(),
                movimiento.y(),
                movimiento.direccion()
        );

        gameStateStore.updateAvatar(state);
    }

    /**
     * Broadcasts the current map state to all subscribers of a given map channel.
     * Called by the 30 FPS scheduler in {@link SessionTimerService}.
     *
     * @param mapId the map channel identifier
     */
    public void broadcastMapState(String mapId) {
        final var avatares = new ArrayList<>(gameStateStore.getAllAvatares());
        final var payload = new DatosEstadoMapa(System.currentTimeMillis(), avatares);
        messagingTemplate.convertAndSend("/topic/mapa/" + mapId, payload);
    }
}
