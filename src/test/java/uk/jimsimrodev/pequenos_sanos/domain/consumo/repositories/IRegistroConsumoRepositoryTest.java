package uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.model.RegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class IRegistroConsumoRepositoryTest {

    @Autowired
    private IRegistroConsumoRepository consumoRepository;

    @Autowired
    private TestEntityManager em;

    private PerfilInfantil perfil;
    private Alimento alimento;
    private Usuario padre;

    @BeforeEach
    void setUp() {
        // Arrange — shared test fixtures
        padre = em.persistAndFlush(
                new Usuario("Carlos Torres", "carlos@example.com", "hashedpwd", Rol.PADRE));
        perfil = em.persistAndFlush(
                new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30));
        alimento = em.persistAndFlush(
                new Alimento("Brócoli", CategoriaAlimento.VERDURA, (short) 15));
    }

    @Test
    @DisplayName("Should throw exception when same food is registered twice on same day")
    void shouldThrowExceptionWhenSameFoodRegisteredTwiceOnSameDay() {
        // Arrange
        var registro1 = new RegistroConsumo(perfil, alimento, padre);
        consumoRepository.saveAndFlush(registro1);

        // Act & Assert
        var registro2 = new RegistroConsumo(perfil, alimento, padre);
        assertThatThrownBy(() -> consumoRepository.saveAndFlush(registro2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Should return true when daily duplicate exists")
    void shouldReturnTrueWhenDailyDuplicateExists() {
        // Arrange
        consumoRepository.saveAndFlush(new RegistroConsumo(perfil, alimento, padre));

        // Act
        boolean exists = consumoRepository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                perfil.getId(), alimento.getId(), LocalDate.now());

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when no consumption exists for that day")
    void shouldReturnFalseWhenNoConsumptionExistsForThatDay() {
        // Arrange — no record persisted

        // Act
        boolean exists = consumoRepository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                perfil.getId(), alimento.getId(), LocalDate.now());

        // Assert
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should return records ordered by created_at desc")
    void shouldReturnRecordsOrderedByCreatedAtDesc() {
        // Arrange
        var otro = em.persistAndFlush(
                new Alimento("Manzana", CategoriaAlimento.FRUTA, (short) 10));
        consumoRepository.saveAndFlush(new RegistroConsumo(perfil, alimento, padre));
        consumoRepository.saveAndFlush(new RegistroConsumo(perfil, otro, padre));

        // Act
        List<RegistroConsumo> result =
                consumoRepository.findByPerfilIdOrderByCreatedAtDesc(perfil.getId());

        // Assert
        assertThat(result).hasSize(2);
    }
}
