package uk.jimsimrodev.pequenos_sanos.domain.consumo.services;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.repositories.IAlimentoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRespuestaConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.model.RegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.services.impl.ConsumoServiceImpl;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosRespuestaRecompensa;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.services.IRecompensaService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConsumoServiceImplTest {

    @Mock
    private IRegistroConsumoRepository consumoRepository;

    @Mock
    private IAlimentoRepository alimentoRepository;

    @Mock
    private IPerfilInfantilRepository perfilRepository;

    @Mock
    private IRecompensaService recompensaService;

    @InjectMocks
    private ConsumoServiceImpl consumoService;

    private static final Long USUARIO_ID = 1L;
    private static final Long PERFIL_ID = 2L;
    private static final Long ALIMENTO_ID = 3L;

    @Test
    @DisplayName("Should return success when consumo is registered and reward credited")
    void shouldReturnSuccessWhenConsumoIsRegisteredAndRewardCredited() {
        // Arrange
        var request = new DatosRegistroConsumo(PERFIL_ID, ALIMENTO_ID);
        var padre = buildUsuario();
        var alimento = buildAlimento();
        var perfil = buildPerfil(padre);
        var registro = buildRegistro(perfil, alimento, padre);
        var recompensa = new DatosRespuestaRecompensa(1L, (short) 15, "CREDITO", null, "Brócoli");

        when(alimentoRepository.findById(ALIMENTO_ID)).thenReturn(Optional.of(alimento));
        when(perfilRepository.findByIdAndActivoTrue(PERFIL_ID)).thenReturn(Optional.of(perfil));
        when(consumoRepository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                anyLong(), anyLong(), any(LocalDate.class))).thenReturn(false);
        when(consumoRepository.save(any(RegistroConsumo.class))).thenReturn(registro);
        when(recompensaService.acreditar(anyLong())).thenReturn(Result.success(recompensa));

        // Act
        var result = consumoService.registrar(request, USUARIO_ID);

        // Assert
        assertThat(result.isSuccess()).isTrue();
        assertThat(((Result.Success<DatosRespuestaConsumo>) result).value().nombreAlimento())
                .isEqualTo("Brócoli");
        verify(consumoRepository).save(any(RegistroConsumo.class));
        verify(recompensaService).acreditar(anyLong());
    }

    @Test
    @DisplayName("Should return CONSUMO_DUPLICADO when same food registered today")
    void shouldReturnConsumoDuplicadoWhenSameFoodRegisteredToday() {
        // Arrange
        var request = new DatosRegistroConsumo(PERFIL_ID, ALIMENTO_ID);
        var padre = buildUsuario();
        var alimento = buildAlimento();
        var perfil = buildPerfil(padre);

        when(alimentoRepository.findById(ALIMENTO_ID)).thenReturn(Optional.of(alimento));
        when(perfilRepository.findByIdAndActivoTrue(PERFIL_ID)).thenReturn(Optional.of(perfil));
        when(consumoRepository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                anyLong(), anyLong(), any(LocalDate.class))).thenReturn(true);

        // Act
        var result = consumoService.registrar(request, USUARIO_ID);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(((Result.Error<?>) result).code()).isEqualTo(CodigosError.CONSUMO_DUPLICADO);
        verify(consumoRepository, never()).save(any());
        verify(recompensaService, never()).acreditar(anyLong());
    }

    @Test
    @DisplayName("Should return ALIMENTO_NO_ENCONTRADO when alimento does not exist")
    void shouldReturnAlimentoNoEncontradoWhenAlimentoDoesNotExist() {
        // Arrange
        var request = new DatosRegistroConsumo(PERFIL_ID, ALIMENTO_ID);
        when(alimentoRepository.findById(ALIMENTO_ID)).thenReturn(Optional.empty());

        // Act
        var result = consumoService.registrar(request, USUARIO_ID);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(((Result.Error<?>) result).code()).isEqualTo(CodigosError.ALIMENTO_NO_ENCONTRADO);
        verify(consumoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return PERFIL_NO_ENCONTRADO when profile does not belong to parent")
    void shouldReturnPerfilNoEncontradoWhenProfileDoesNotBelongToParent() {
        // Arrange
        var request = new DatosRegistroConsumo(PERFIL_ID, ALIMENTO_ID);
        var alimento = buildAlimento();
        // Build profile owned by a different user (ID 99, not USUARIO_ID=1)
        var otroPadre = new Usuario("Otro", "otro@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return 99L; }
        };
        var perfilDeOtro = buildPerfil(otroPadre);

        when(alimentoRepository.findById(ALIMENTO_ID)).thenReturn(Optional.of(alimento));
        when(perfilRepository.findByIdAndActivoTrue(PERFIL_ID)).thenReturn(Optional.of(perfilDeOtro));

        // Act
        var result = consumoService.registrar(request, USUARIO_ID);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(((Result.Error<?>) result).code()).isEqualTo(CodigosError.PERFIL_NO_ENCONTRADO);
        verify(consumoRepository, never()).save(any());
    }

    // --- Helpers ---

    private Usuario buildUsuario() {
        return new Usuario("Carlos", "carlos@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return USUARIO_ID; }
        };
    }

    private Alimento buildAlimento() {
        return new Alimento("Brócoli", CategoriaAlimento.VERDURA, (short) 15) {
            @Override public Long getId() { return ALIMENTO_ID; }
        };
    }

    private PerfilInfantil buildPerfil(Usuario padre) {
        return new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30) {
            @Override public Long getId() { return PERFIL_ID; }
        };
    }

    private RegistroConsumo buildRegistro(PerfilInfantil perfil, Alimento alimento, Usuario padre) {
        return new RegistroConsumo(perfil, alimento, padre) {
            @Override public Long getId() { return 10L; }
        };
    }
}
