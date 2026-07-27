package uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.model.SesionJuego;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class ISesionJuegoRepositoryTest {

    @Autowired
    private ISesionJuegoRepository sesionRepository;

    @Autowired
    private TestEntityManager em;

    private PerfilInfantil perfil;

    @BeforeEach
    void setUp() {
        var padre = em.persistAndFlush(
                new Usuario("María López", "maria@example.com", "hashedpwd", Rol.PADRE));
        perfil = em.persistAndFlush(
                new PerfilInfantil(padre, "Tomás", (short) 3, (short) 20));
    }

    @Test
    @DisplayName("Should find session by perfil and date")
    void shouldFindSessionByPerfilAndDate() {
        // Arrange
        var sesion = sesionRepository.saveAndFlush(new SesionJuego(perfil));

        // Act
        var result = sesionRepository.findByPerfilIdAndFechaSesion(
                perfil.getId(), LocalDate.now());

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(sesion.getId());
    }

    @Test
    @DisplayName("Should find open session (fin is null)")
    void shouldFindOpenSession() {
        // Arrange
        sesionRepository.saveAndFlush(new SesionJuego(perfil));

        // Act
        var result = sesionRepository.findByPerfilIdAndFechaSesionAndFinIsNull(
                perfil.getId(), LocalDate.now());

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getFin()).isNull();
    }

    @Test
    @DisplayName("Should not find open session when session is closed")
    void shouldNotFindOpenSessionWhenSessionIsClosed() {
        // Arrange
        var sesion = new SesionJuego(perfil);
        sesion.setFin(sesion.getInicio().plusMinutes(20));
        sesionRepository.saveAndFlush(sesion);

        // Act
        var result = sesionRepository.findByPerfilIdAndFechaSesionAndFinIsNull(
                perfil.getId(), LocalDate.now());

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should throw exception when two sessions exist for same perfil and date")
    void shouldThrowExceptionWhenTwoSessionsExistForSamePerfilAndDate() {
        // Arrange
        sesionRepository.saveAndFlush(new SesionJuego(perfil));

        // Act & Assert — second session on same day violates UNIQUE(perfil_id, fecha_sesion)
        assertThatThrownBy(() ->
                sesionRepository.saveAndFlush(new SesionJuego(perfil)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
