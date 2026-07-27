package uk.jimsimrodev.pequenos_sanos.domain.consumo.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.repositories.IAlimentoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.repositories.IUsuarioRepository;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ConsumoIntegrationTest {

    @Autowired
    private IConsumoService consumoService;

    @Autowired
    private IRegistroConsumoRepository consumoRepository;

    @Autowired
    private ITransaccionRecompensaRepository recompensaRepository;

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private IPerfilInfantilRepository perfilRepository;

    @Autowired
    private IAlimentoRepository alimentoRepository;

    private Usuario padre;
    private PerfilInfantil perfil;
    private Alimento alimento;

    @BeforeEach
    void setUp() {
        // Arrange — shared fixtures for each test
        padre = usuarioRepository.save(
                new Usuario("Carlos Torres", "carlos@example.com", "hashedpwd", Rol.PADRE));
        perfil = perfilRepository.save(
                new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30));
        alimento = alimentoRepository.save(
                new Alimento("Brócoli", CategoriaAlimento.VERDURA, (short) 15));
    }

    @Test
    @DisplayName("Should return CONSUMO_DUPLICADO on second registration of same food today")
    void shouldReturnConsumoDuplicadoOnSecondRegistrationOfSameFoodToday() {
        // Arrange
        var request = new DatosRegistroConsumo(perfil.getId(), alimento.getId());

        // Act — first registration succeeds
        var primera = consumoService.registrar(request, padre.getId());
        assertThat(primera.isSuccess()).isTrue();

        // Act — second registration is rejected
        var segunda = consumoService.registrar(request, padre.getId());

        // Assert
        assertThat(segunda.isError()).isTrue();
        assertThat(((Result.Error<?>) segunda).code()).isEqualTo(CodigosError.CONSUMO_DUPLICADO);

        // Verify exactly 1 RegistroConsumo and 1 TransaccionRecompensa persisted
        assertThat(consumoRepository.findAll()).hasSize(1);
        assertThat(recompensaRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Should persist only 1 registro and 1 recompensa when consumo succeeds")
    void shouldPersistOnly1RegistroAnd1RecompensaWhenConsumoSucceeds() {
        // Arrange
        var request = new DatosRegistroConsumo(perfil.getId(), alimento.getId());

        // Act
        var result = consumoService.registrar(request, padre.getId());

        // Assert
        assertThat(result.isSuccess()).isTrue();
        assertThat(consumoRepository.findAll()).hasSize(1);
        assertThat(recompensaRepository.findAll()).hasSize(1);

        // Verify perfil balance was updated
        var perfilActualizado = perfilRepository.findById(perfil.getId()).orElseThrow();
        assertThat(perfilActualizado.getMonedasSaldo()).isEqualTo(alimento.getPuntosReward());
    }

    @Test
    @DisplayName("Should return ALIMENTO_NO_ENCONTRADO when alimento does not exist")
    void shouldReturnAlimentoNoEncontradoWhenAlimentoDoesNotExist() {
        // Arrange — use a non-existent alimento ID
        var request = new DatosRegistroConsumo(perfil.getId(), 9999L);

        // Act
        var result = consumoService.registrar(request, padre.getId());

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(((Result.Error<?>) result).code()).isEqualTo(CodigosError.ALIMENTO_NO_ENCONTRADO);
        assertThat(consumoRepository.findAll()).isEmpty();
        assertThat(recompensaRepository.findAll()).isEmpty();
    }
}
