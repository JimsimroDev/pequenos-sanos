package uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories;

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
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.model.TransaccionRecompensa;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class ITransaccionRecompensaRepositoryTest {

    @Autowired
    private ITransaccionRecompensaRepository recompensaRepository;

    @Autowired
    private TestEntityManager em;

    private PerfilInfantil perfil;
    private RegistroConsumo registro;

    @BeforeEach
    void setUp() {
        // Arrange — shared fixtures
        var padre = em.persistAndFlush(
                new Usuario("Ana Torres", "ana@example.com", "hashedpwd", Rol.PADRE));
        perfil = em.persistAndFlush(
                new PerfilInfantil(padre, "Tomás", (short) 3, (short) 20));
        var alimento = em.persistAndFlush(
                new Alimento("Espinaca", CategoriaAlimento.VERDURA, (short) 15));
        registro = em.persistAndFlush(new RegistroConsumo(perfil, alimento, padre));
    }

    @Test
    @DisplayName("Should throw exception when duplicate reward for same consumption record")
    void shouldThrowExceptionWhenDuplicateRewardForSameConsumptionRecord() {
        // Arrange
        var primera = new TransaccionRecompensa(perfil, registro, (short) 15);
        recompensaRepository.saveAndFlush(primera);

        // Act & Assert
        var segunda = new TransaccionRecompensa(perfil, registro, (short) 15);
        assertThatThrownBy(() -> recompensaRepository.saveAndFlush(segunda))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Should return true when transaction exists for registro consumo")
    void shouldReturnTrueWhenTransactionExistsForRegistroConsumo() {
        // Arrange
        recompensaRepository.saveAndFlush(new TransaccionRecompensa(perfil, registro, (short) 15));

        // Act
        boolean exists = recompensaRepository.existsByRegistroConsumoId(registro.getId());

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when no transaction exists for registro consumo")
    void shouldReturnFalseWhenNoTransactionExistsForRegistroConsumo() {
        // Arrange — no transaction saved

        // Act
        boolean exists = recompensaRepository.existsByRegistroConsumoId(registro.getId());

        // Assert
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should return transactions ordered by created_at desc")
    void shouldReturnTransactionsOrderedByCreatedAtDesc() {
        // Arrange — create two registros for different alimentos
        var padre2 = em.find(Usuario.class, perfil.getUsuario().getId());
        var otroAlimento = em.persistAndFlush(
                new Alimento("Zanahoria", CategoriaAlimento.VERDURA, (short) 10));
        var registro2 = em.persistAndFlush(new RegistroConsumo(perfil, otroAlimento, padre2));

        recompensaRepository.saveAndFlush(new TransaccionRecompensa(perfil, registro, (short) 15));
        recompensaRepository.saveAndFlush(new TransaccionRecompensa(perfil, registro2, (short) 10));

        // Act
        List<TransaccionRecompensa> result =
                recompensaRepository.findByPerfilIdOrderByCreatedAtDesc(perfil.getId());

        // Assert
        assertThat(result).hasSize(2);
    }
}
