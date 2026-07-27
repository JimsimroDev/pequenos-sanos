package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosForceLogout;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosTimerUpdate;

import java.time.LocalDate;
import java.util.ArrayList;

/**
 * Scheduled service that decrements session timers every second and sends
 * periodic updates to clients. When a timer reaches zero, it triggers Force Logout.
 */
@Service
public class SessionTimerService {

    private static final Logger log = LoggerFactory.getLogger(SessionTimerService.class);

    /** Send timer updates every 10 ticks (10 seconds). */
    private static final int TIMER_UPDATE_INTERVAL_TICKS = 10;

    private int tickCount = 0;

    private final GameStateStore gameStateStore;
    private final SimpMessagingTemplate messagingTemplate;
    private final ISesionJuegoRepository sesionRepository;

    /**
     * Creates the timer service with required dependencies.
     *
     * @param gameStateStore      in-memory state store
     * @param messagingTemplate   STOMP messaging template
     * @param sesionRepository    game session repository
     */
    public SessionTimerService(GameStateStore gameStateStore,
                                SimpMessagingTemplate messagingTemplate,
                                ISesionJuegoRepository sesionRepository) {
        this.gameStateStore = gameStateStore;
        this.messagingTemplate = messagingTemplate;
        this.sesionRepository = sesionRepository;
    }

    /**
     * Runs every second. Decrements all active timers and triggers Force Logout
     * for any profile that has run out of time. Sends timer updates every 10 seconds.
     */
    @Scheduled(fixedRate = 1000)
    public void tick() {
        tickCount++;

        // Copy to avoid ConcurrentModificationException during iteration
        final var activeProfiles = new ArrayList<>(gameStateStore.getActiveTimerProfiles());

        for (Long perfilId : activeProfiles) {
            final Integer segundosRestantes = gameStateStore.decrementTimer(perfilId);

            if (segundosRestantes == null) {
                continue;
            }

            if (segundosRestantes <= 0) {
                forzarLogout(perfilId);
            } else if (tickCount % TIMER_UPDATE_INTERVAL_TICKS == 0) {
                sendTimerUpdate(perfilId, segundosRestantes);
            }
        }
    }

    /**
     * Triggers a Force Logout for a child profile when their daily screen time runs out.
     * Closes the active session in the database and sends the force logout signal via WebSocket.
     *
     * @param perfilId the child profile whose session is being terminated
     */
    @Transactional
    public void forzarLogout(Long perfilId) {
        log.info("Force logout triggered for perfilId={}", perfilId);

        // Close the active session in the database
        sesionRepository
                .findByPerfilIdAndFechaSesionAndFinIsNull(perfilId, LocalDate.now())
                .ifPresent(sesion -> {
                    sesion.setFin(java.time.LocalDateTime.now());
                    sesion.setCerradaPor("FORCE_LOGOUT");
                    // Calculate minutes played
                    final long minutos = java.time.Duration
                            .between(sesion.getInicio(), sesion.getFin())
                            .toMinutes();
                    sesion.setMinutosJugados((short) Math.min(minutos, Short.MAX_VALUE));
                    sesionRepository.save(sesion);
                });

        // Send Force Logout signal to the client
        final var payload = new DatosForceLogout(
                "TIME_EXPIRED",
                "Tu tiempo de juego de hoy ha terminado. ¡Hasta mañana!"
        );
        messagingTemplate.convertAndSendToUser(
                perfilId.toString(),
                "/queue/logout",
                payload
        );

        // Clean up in-memory state
        gameStateStore.removeTimer(perfilId);
        gameStateStore.removeAvatar(perfilId);
    }

    private void sendTimerUpdate(Long perfilId, int segundosRestantes) {
        final int minutos = segundosRestantes / 60;
        final int segundos = segundosRestantes % 60;

        final var update = new DatosTimerUpdate(minutos, segundos);
        messagingTemplate.convertAndSendToUser(
                perfilId.toString(),
                "/queue/timer",
                update
        );
    }
}
