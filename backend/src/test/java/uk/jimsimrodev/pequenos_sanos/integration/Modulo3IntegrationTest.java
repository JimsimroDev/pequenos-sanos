package uk.jimsimrodev.pequenos_sanos.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.repositories.IUsuarioRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.services.ISesionService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end integration test for Módulo 3 (Motor MMO y Control de Tiempo).
 * Uses H2 in-memory database via the "test" profile.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class Modulo3IntegrationTest {

    @Autowired private ISesionService sesionService;
    @Autowired private IUsuarioRepository usuarioRepository;
    @Autowired private IPerfilInfantilRepository perfilRepository;
    @Autowired private ISesionJuegoRepository sesionRepository;

    @Test
    @DisplayName("Módulo 3 flow: iniciar sesión -> éxito -> intento de reconexión -> SESION_ACTIVA")
    void shouldReturnSesionActivaOnSecondStartAttempt() {
        // Arrange
        var padre = usuarioRepository.save(
                new Usuario("Pedro Soto", "pedro@example.com", "hashedpwd", Rol.PADRE));
        var perfil = perfilRepository.save(
                new PerfilInfantil(padre, "Sofía", (short) 2, (short) 15));

        // Act — first start succeeds
        var primera = sesionService.iniciar(perfil.getId());
        assertThat(primera.isSuccess()).isTrue();

        // Assert — 1 open session in DB
        assertThat(sesionRepository.findAll()).hasSize(1);
        assertThat(sesionRepository.findAll().get(0).getFin()).isNull();

        // Act — second start attempt while session is active
        var segunda = sesionService.iniciar(perfil.getId());

        // Assert — SESION_ACTIVA returned
        assertThat(segunda.isError()).isTrue();
        assertThat(((Result.Error<?>) segunda).code()).isEqualTo(CodigosError.SESION_ACTIVA);

        // Assert — still only 1 session in DB
        assertThat(sesionRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Módulo 3 flow: session closed with time exhausted -> TIEMPO_AGOTADO on reconnect")
    void shouldReturnTiempoAgotadoWhenDailyLimitReached() {
        // Arrange
        var padre = usuarioRepository.save(
                new Usuario("Rosa Medina", "rosa@example.com", "hashedpwd", Rol.PADRE));
        var perfil = perfilRepository.save(
                new PerfilInfantil(padre, "Tomás", (short) 3, (short) 15));

        // Start and immediately close the session with minutes_played == limit
        var primera = sesionService.iniciar(perfil.getId());
        assertThat(primera.isSuccess()).isTrue();

        // Close session with all minutes consumed
        final var sesion = sesionRepository.findAll().get(0);
        sesion.setFin(java.time.LocalDateTime.now());
        sesion.setMinutosJugados((short) 15); // == screen_time_limit
        sesion.setCerradaPor("FORCE_LOGOUT");
        sesionRepository.save(sesion);

        // Act — attempt to start again
        var segunda = sesionService.iniciar(perfil.getId());

        // Assert — TIEMPO_AGOTADO returned
        assertThat(segunda.isError()).isTrue();
        assertThat(((Result.Error<?>) segunda).code()).isEqualTo(CodigosError.TIEMPO_AGOTADO);
    }
}
