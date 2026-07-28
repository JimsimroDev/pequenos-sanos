package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.AvatarState;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosAlimentoComido;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosEstadoMapa;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosMovimientoAvatar;

import java.util.ArrayList;

/**
 * STOMP WebSocket controller that handles avatar movement messages
 * and broadcasts the full map state to all connected clients at ~30 FPS (33 ms
 * interval).
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
     * Updates the in-memory position and display info for the given profile.
     *
     * @param movimiento the movement data including position, name and color
     */
    @MessageMapping("/mover")
    public void moverAvatar(DatosMovimientoAvatar movimiento) {
        log.debug("Avatar move: perfilId={} x={} y={} dir={} codigo={}",
                movimiento.perfilId(), movimiento.x(), movimiento.y(),
                movimiento.direccion(), movimiento.avatarCodigo());

        final var state = new AvatarState(
                movimiento.perfilId(),
                movimiento.nombre() != null ? movimiento.nombre() : "",
                movimiento.x(),
                movimiento.y(),
                movimiento.direccion(),
                movimiento.color() != null ? movimiento.color() : "#10b981",
                movimiento.avatarCodigo() != null ? movimiento.avatarCodigo() : "");

        gameStateStore.updateAvatar(state);
    }

    /**
     * Handles food collection events. Broadcasts to all clients so they
     * remove the consumed food item from their local map.
     *
     * @param evento the food collected data including alimentoId and perfilId
     */
    @MessageMapping("/alimento/comer")
    public void alimentoComido(DatosAlimentoComido evento) {
        log.debug("Food collected: alimentoId={} by perfilId={}", evento.alimentoId(), evento.perfilId());
        messagingTemplate.convertAndSend("/topic/alimento/comido", evento);
    }

    /**
     * Broadcasts the current map state to all subscribers at approximately 30 FPS
     * (33 ms interval).
     * Reads all avatar positions from {@link GameStateStore} and sends a snapshot
     * to every client
     * subscribed to {@code /topic/mapa/mundo-1}.
     */
    @Scheduled(fixedRate = 33)
    public void broadcastMapState() {
        final var avatares = new ArrayList<>(gameStateStore.getAllAvatares());

        // Skip broadcast when no avatars are on the map
        if (avatares.isEmpty()) {
            return;
        }

        final var payload = new DatosEstadoMapa(System.currentTimeMillis(), avatares);
        messagingTemplate.convertAndSend("/topic/mapa/" + DEFAULT_MAP_ID, payload);
    }

    /**
     * Broadcasts the current map state to a specific map channel.
     *
     * @param mapId the map channel identifier
     */
    public void broadcastMapState(String mapId) {
        final var avatares = new ArrayList<>(gameStateStore.getAllAvatares());
        final var payload = new DatosEstadoMapa(System.currentTimeMillis(), avatares);
        messagingTemplate.convertAndSend("/topic/mapa/" + mapId, payload);
    }
}
