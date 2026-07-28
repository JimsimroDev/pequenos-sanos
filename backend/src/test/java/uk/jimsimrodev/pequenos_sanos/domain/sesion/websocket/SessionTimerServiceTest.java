package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.DatosForceLogout;

import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionTimerServiceTest {

    @Mock
    private GameStateStore gameStateStore;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ISesionJuegoRepository sesionRepository;

    @InjectMocks
    private SessionTimerService sessionTimerService;

    @Test
    @DisplayName("Should invoke forzarLogout when timer reaches zero")
    void shouldInvokeForzarLogoutWhenTimerReachesZero() {
        // Arrange
        final Long perfilId = 1L;
        when(gameStateStore.getActiveTimerProfiles()).thenReturn(Set.of(perfilId));
        // Return 0 (time expired) on decrement
        when(gameStateStore.decrementTimer(perfilId)).thenReturn(0);
        when(sesionRepository.findByPerfilIdAndFechaSesionAndFinIsNull(any(), any()))
                .thenReturn(Optional.empty());

        // Act
        sessionTimerService.tick();

        // Assert — Force Logout signal sent
        verify(messagingTemplate).convertAndSendToUser(
                eq(perfilId.toString()),
                contains("/queue/logout"),
                any(DatosForceLogout.class)
        );
        verify(gameStateStore).removeTimer(perfilId);
        verify(gameStateStore).removeAvatar(perfilId);
    }

    @Test
    @DisplayName("Should not trigger logout when timer has remaining seconds")
    void shouldNotTriggerLogoutWhenTimerHasRemainingSeconds() {
        // Arrange
        final Long perfilId = 2L;
        when(gameStateStore.getActiveTimerProfiles()).thenReturn(Set.of(perfilId));
        // 300 seconds remaining — no logout
        when(gameStateStore.decrementTimer(perfilId)).thenReturn(300);

        // Act
        sessionTimerService.tick();

        // Assert — no Force Logout, no cleanup
        verify(gameStateStore).decrementTimer(perfilId);
        verify(messagingTemplate, org.mockito.Mockito.never())
                .convertAndSendToUser(any(), contains("/queue/logout"), any());
        verify(gameStateStore, org.mockito.Mockito.never()).removeTimer(any());
    }
}
