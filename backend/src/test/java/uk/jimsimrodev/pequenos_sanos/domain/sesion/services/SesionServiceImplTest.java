package uk.jimsimrodev.pequenos_sanos.domain.sesion.services;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.dto.DatosRespuestaSesion;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.model.SesionJuego;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.services.impl.SesionServiceImpl;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.GameStateStore;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SesionServiceImplTest {

    @Mock
    private IPerfilInfantilRepository perfilRepository;

    @Mock
    private ISesionJuegoRepository sesionRepository;

    @Mock
    private GameStateStore gameStateStore;

    @InjectMocks
    private SesionServiceImpl sesionService;

    private static final Long PERFIL_ID = 1L;

    @Test
    @DisplayName("Should return success when session is started successfully")
    void shouldReturnSuccessWhenSessionIsStartedSuccessfully() {
        // Arrange
        var padre = new Usuario("Carlos", "c@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return 1L; }
        };
        var perfil = new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30) {
            @Override public Long getId() { return PERFIL_ID; }
        };
        var sesionGuardada = new SesionJuego(perfil) {
            @Override public Long getId() { return 10L; }
        };

        when(perfilRepository.findByIdAndActivoTrue(PERFIL_ID)).thenReturn(Optional.of(perfil));
        when(sesionRepository.findByPerfilIdAndFechaSesion(anyLong(), any())).thenReturn(Optional.empty());
        when(sesionRepository.save(any(SesionJuego.class))).thenReturn(sesionGuardada);

        // Act
        var result = sesionService.iniciar(PERFIL_ID);

        // Assert
        assertThat(result.isSuccess()).isTrue();
        assertThat(((Result.Success<DatosRespuestaSesion>) result).value().estado()).isEqualTo("ACTIVA");
        verify(gameStateStore).registerTimer(PERFIL_ID, 30 * 60);
    }

    @Test
    @DisplayName("Should return TIEMPO_AGOTADO when daily limit is reached")
    void shouldReturnTiempoAgotadoWhenDailyLimitIsReached() {
        // Arrange
        var padre = new Usuario("Carlos", "c@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return 1L; }
        };
        var perfil = new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30) {
            @Override public Long getId() { return PERFIL_ID; }
        };
        // Closed session with minutos_jugados == limite (30)
        var sesionCerrada = new SesionJuego(perfil) {
            @Override public Short getMinutosJugados() { return (short) 30; }
            @Override public java.time.LocalDateTime getFin() {
                return java.time.LocalDateTime.now().minusMinutes(5);
            }
        };

        when(perfilRepository.findByIdAndActivoTrue(PERFIL_ID)).thenReturn(Optional.of(perfil));
        when(sesionRepository.findByPerfilIdAndFechaSesion(anyLong(), any()))
                .thenReturn(Optional.of(sesionCerrada));

        // Act
        var result = sesionService.iniciar(PERFIL_ID);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(((Result.Error<?>) result).code()).isEqualTo(CodigosError.TIEMPO_AGOTADO);
        verify(sesionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return SESION_ACTIVA when an open session already exists")
    void shouldReturnSesionActivaWhenOpenSessionAlreadyExists() {
        // Arrange
        var padre = new Usuario("Carlos", "c@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return 1L; }
        };
        var perfil = new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30) {
            @Override public Long getId() { return PERFIL_ID; }
        };
        // Open session (fin is null)
        var sesionActiva = new SesionJuego(perfil) {
            @Override public java.time.LocalDateTime getFin() { return null; }
        };

        when(perfilRepository.findByIdAndActivoTrue(PERFIL_ID)).thenReturn(Optional.of(perfil));
        when(sesionRepository.findByPerfilIdAndFechaSesion(anyLong(), any()))
                .thenReturn(Optional.of(sesionActiva));

        // Act
        var result = sesionService.iniciar(PERFIL_ID);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(((Result.Error<?>) result).code()).isEqualTo(CodigosError.SESION_ACTIVA);
        verify(sesionRepository, never()).save(any());
    }
}
