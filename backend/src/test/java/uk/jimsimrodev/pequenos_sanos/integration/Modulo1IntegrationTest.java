package uk.jimsimrodev.pequenos_sanos.integration;

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
import uk.jimsimrodev.pequenos_sanos.domain.consumo.services.IConsumoService;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end integration test for Módulo 1 (Parental y Nutricional).
 * Uses H2 in-memory database via the "test" profile.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class Modulo1IntegrationTest {

    @Autowired private IConsumoService consumoService;
    @Autowired private IUsuarioRepository usuarioRepository;
    @Autowired private IPerfilInfantilRepository perfilRepository;
    @Autowired private IAlimentoRepository alimentoRepository;
    @Autowired private IRegistroConsumoRepository consumoRepository;
    @Autowired private ITransaccionRecompensaRepository recompensaRepository;

    @Test
    @DisplayName("Full flow: registro padre -> crear perfil -> registrar consumo -> saldo incrementado")
    void shouldCompleteFullNutritionalFlow() {
        // Arrange — create parent, profile and food
        var padre = usuarioRepository.save(
                new Usuario("Ana Torres", "ana@example.com", "hashedpwd", Rol.PADRE));
        var perfil = perfilRepository.save(
                new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30));
        var alimento = alimentoRepository.save(
                new Alimento("Brócoli", CategoriaAlimento.VERDURA, (short) 15));

        final int saldoInicial = perfil.getMonedasSaldo();

        // Act — register food consumption
        var result = consumoService.registrar(
                new DatosRegistroConsumo(perfil.getId(), alimento.getId()),
                padre.getId());

        // Assert — consumption registered
        assertThat(result.isSuccess()).isTrue();

        // Assert — exactly 1 RegistroConsumo and 1 TransaccionRecompensa in DB
        assertThat(consumoRepository.findAll()).hasSize(1);
        assertThat(recompensaRepository.findAll()).hasSize(1);

        // Assert — profile balance incremented by alimento reward points
        var perfilActualizado = perfilRepository.findById(perfil.getId()).orElseThrow();
        assertThat(perfilActualizado.getMonedasSaldo())
                .isEqualTo(saldoInicial + alimento.getPuntosReward());
    }

    @Test
    @DisplayName("Módulo 2 flow: duplicate consumo same day -> 422 CONSUMO_DUPLICADO, balance unchanged")
    void shouldRejectDuplicateConsumoAndKeepBalanceUnchanged() {
        // Arrange
        var padre = usuarioRepository.save(
                new Usuario("Carlos Ruiz", "carlos@example.com", "hashedpwd", Rol.PADRE));
        var perfil = perfilRepository.save(
                new PerfilInfantil(padre, "Miguel", (short) 4, (short) 20));
        var alimento = alimentoRepository.save(
                new Alimento("Manzana", CategoriaAlimento.FRUTA, (short) 10));

        var request = new DatosRegistroConsumo(perfil.getId(), alimento.getId());

        // Act — first consumption succeeds
        var primera = consumoService.registrar(request, padre.getId());
        assertThat(primera.isSuccess()).isTrue();

        int saldoTrasFirst = perfilRepository.findById(perfil.getId()).orElseThrow().getMonedasSaldo();

        // Act — second consumption same day is rejected
        var segunda = consumoService.registrar(request, padre.getId());

        // Assert — CONSUMO_DUPLICADO returned
        assertThat(segunda.isError()).isTrue();
        assertThat(((Result.Error<?>) segunda).code()).isEqualTo(CodigosError.CONSUMO_DUPLICADO);

        // Assert — balance unchanged after failed second attempt
        var perfilFinal = perfilRepository.findById(perfil.getId()).orElseThrow();
        assertThat(perfilFinal.getMonedasSaldo()).isEqualTo(saldoTrasFirst);

        // Assert — still exactly 1 registro and 1 recompensa
        assertThat(consumoRepository.findAll()).hasSize(1);
        assertThat(recompensaRepository.findAll()).hasSize(1);
    }
}
