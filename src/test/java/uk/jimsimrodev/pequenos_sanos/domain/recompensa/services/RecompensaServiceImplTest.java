package uk.jimsimrodev.pequenos_sanos.domain.recompensa.services;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.model.RegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.model.TransaccionRecompensa;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.services.impl.RecompensaServiceImpl;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecompensaServiceImplTest {

    @Mock
    private IRegistroConsumoRepository consumoRepository;

    @Mock
    private ITransaccionRecompensaRepository recompensaRepository;

    @InjectMocks
    private RecompensaServiceImpl recompensaService;

    @Test
    @DisplayName("Should return error when registro is already processed")
    void shouldReturnErrorWhenRegistroIsAlreadyProcessed() {
        // Arrange
        var padre = new Usuario("Carlos", "carlos@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return 1L; }
        };
        var alimento = new Alimento("Brócoli", CategoriaAlimento.VERDURA, (short) 15) {
            @Override public Long getId() { return 3L; }
        };
        var perfil = new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30) {
            @Override public Long getId() { return 2L; }
        };
        var registro = new RegistroConsumo(perfil, alimento, padre) {
            @Override public Long getId() { return 10L; }
        };
        // Mark as already processed
        registro.setProcesado(true);

        when(consumoRepository.findById(10L)).thenReturn(Optional.of(registro));

        // Act
        var result = recompensaService.acreditar(10L);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(result).isInstanceOf(uk.jimsimrodev.pequenos_sanos.infra.Result.Error.class);
        assertThat(((uk.jimsimrodev.pequenos_sanos.infra.Result.Error<?>) result).code())
                .isEqualTo(CodigosError.CONSUMO_DUPLICADO);

        // Verify no second transaction was created
        verify(recompensaRepository, never()).save(any(TransaccionRecompensa.class));
    }

    @Test
    @DisplayName("Should return error when registro consumo does not exist")
    void shouldReturnErrorWhenRegistroConsumoDoesNotExist() {
        // Arrange
        when(consumoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        var result = recompensaService.acreditar(999L);

        // Assert
        assertThat(result.isError()).isTrue();
        verify(recompensaRepository, never()).save(any());
    }
}
