# Service Test Reference — Mockito Unit Tests

Plantillas para pruebas unitarias puras de la capa de servicios del proyecto
Pequeños Sanos. Sin contexto Spring — solo Mockito y JUnit 5.

## Estructura base de un test de servicio

```java
package uk.jimsimrodev.pequenos_sanos.service;

import uk.jimsimrodev.pequenos_sanos.domain.[entidad].I[Entidad]Repository;
import uk.jimsimrodev.pequenos_sanos.domain.[entidad].Datos[Request];
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class [Nombre]ServiceTest {

    @Mock
    private I[Entidad]Repository [entidad]Repository;

    @InjectMocks
    private [Nombre]Service [nombre]Service;
}
```

---

## Plantilla: flujo feliz — Result.success

```java
@Test
@DisplayName("Should return success result when operation completes correctly")
void shouldReturnSuccessResultWhenOperationCompletesCorrectly() {
    // Arrange
    var input = new Datos[Request](/* valores válidos */);
    var savedEntity = new [Entidad](/* campos */);
    when([entidad]Repository.save(any())).thenReturn(savedEntity);

    // Act
    var result = [nombre]Service.[metodo](input, 1L);

    // Assert
    assertThat(result.isSuccess()).isTrue();
    assertThat(result.getValue()).isNotNull();
    verify([entidad]Repository, times(1)).save(any());
}
```

## Plantilla: error de negocio — Result.error

```java
@Test
@DisplayName("Should return error result when business rule is violated")
void shouldReturnErrorResultWhenBusinessRuleIsViolated() {
    // Arrange
    when([entidad]Repository.[metodoCheck](anyLong(), anyLong(), any()))
            .thenReturn(true);     // simula condición que dispara el error

    // Act
    var result = [nombre]Service.[metodo](new Datos[Request](1L, 2L), 1L);

    // Assert
    assertThat(result.isError()).isTrue();
    assertThat(result.getErrorCode()).isEqualTo("[CODIGO_ERROR]");
    verify([entidad]Repository, never()).save(any());  // no debe persistir nada
}
```

## Plantilla: entidad no encontrada

```java
@Test
@DisplayName("Should return not found error when entity does not exist")
void shouldReturnNotFoundErrorWhenEntityDoesNotExist() {
    // Arrange
    long nonExistentId = 999L;
    when([entidad]Repository.findById(nonExistentId))
            .thenReturn(Optional.empty());

    // Act
    var result = [nombre]Service.buscarPorId(nonExistentId);

    // Assert
    assertThat(result.isError()).isTrue();
    assertThat(result.getErrorCode()).isEqualTo("[ENTIDAD]_NO_ENCONTRADO");
}
```

## Plantilla: verificar que NO se llama un método

```java
@Test
@DisplayName("Should not call recompensa service when consumo validation fails")
void shouldNotCallRecompensaServiceWhenConsumoValidationFails() {
    // Arrange
    when(alimentoRepository.findById(anyLong())).thenReturn(Optional.empty());

    // Act
    consumoService.registrar(new DatosRegistroConsumo(1L, 999L), 1L);

    // Assert
    verify(recompensaService, never()).acreditar(any());
}
```

## Plantilla: verificar argumentos con ArgumentCaptor

```java
@Test
@DisplayName("Should save registro with correct fecha consumo")
void shouldSaveRegistroWithCorrectFechaConsumo() {
    // Arrange
    var captor = ArgumentCaptor.forClass(RegistroConsumo.class);
    when(alimentoRepository.findById(2L)).thenReturn(Optional.of(buildAlimento()));
    when(perfilRepository.findById(1L)).thenReturn(Optional.of(buildPerfil()));

    // Act
    consumoService.registrar(new DatosRegistroConsumo(1L, 2L), 10L);

    // Assert
    verify(registroConsumoRepository).save(captor.capture());
    assertThat(captor.getValue().getFechaConsumo()).isEqualTo(LocalDate.now());
}
```

---

## Ejemplo completo: ConsumoServiceTest

```java
package uk.jimsimrodev.pequenos_sanos.service;

import uk.jimsimrodev.pequenos_sanos.domain.alimento.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.IAlimentoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.DatosRegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.RegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.PerfilInfantil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsumoServiceTest {

    @Mock
    private IRegistroConsumoRepository registroConsumoRepository;

    @Mock
    private IAlimentoRepository alimentoRepository;

    @Mock
    private IPerfilInfantilRepository perfilRepository;

    @Mock
    private RecompensaService recompensaService;

    @InjectMocks
    private ConsumoService consumoService;

    @Test
    @DisplayName("Should return success when consumo is registered for the first time today")
    void shouldReturnSuccessWhenConsumoIsRegisteredForTheFirstTimeToday() {
        // Arrange
        var alimento = Alimento.builder().id(2L).nombre("Brócoli").puntosReward(10).build();
        var perfil = PerfilInfantil.builder().id(1L).build();

        when(alimentoRepository.findById(2L)).thenReturn(Optional.of(alimento));
        when(perfilRepository.findByIdAndUsuarioId(1L, 10L)).thenReturn(Optional.of(perfil));
        when(registroConsumoRepository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                1L, 2L, LocalDate.now())).thenReturn(false);
        when(registroConsumoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Act
        var result = consumoService.registrar(new DatosRegistroConsumo(1L, 2L), 10L);

        // Assert
        assertThat(result.isSuccess()).isTrue();
        verify(recompensaService, times(1)).acreditar(any());
    }

    @Test
    @DisplayName("Should return CONSUMO_DUPLICADO when alimento already registered today")
    void shouldReturnConsumoDuplicadoWhenAlimentoAlreadyRegisteredToday() {
        // Arrange
        when(alimentoRepository.findById(2L))
                .thenReturn(Optional.of(Alimento.builder().id(2L).build()));
        when(perfilRepository.findByIdAndUsuarioId(1L, 10L))
                .thenReturn(Optional.of(PerfilInfantil.builder().id(1L).build()));
        when(registroConsumoRepository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                anyLong(), anyLong(), any(LocalDate.class))).thenReturn(true);

        // Act
        var result = consumoService.registrar(new DatosRegistroConsumo(1L, 2L), 10L);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo("CONSUMO_DUPLICADO");
        verify(registroConsumoRepository, never()).save(any());
        verify(recompensaService, never()).acreditar(any());
    }

    @Test
    @DisplayName("Should return ALIMENTO_NO_ENCONTRADO when alimento id does not exist")
    void shouldReturnAlimentoNoEncontradoWhenAlimentoIdDoesNotExist() {
        // Arrange
        when(alimentoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        var result = consumoService.registrar(new DatosRegistroConsumo(1L, 999L), 10L);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo("ALIMENTO_NO_ENCONTRADO");
        verify(registroConsumoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return PERFIL_NO_ENCONTRADO when perfil does not belong to padre")
    void shouldReturnPerfilNoEncontradoWhenPerfilDoesNotBelongToPadre() {
        // Arrange
        when(alimentoRepository.findById(2L))
                .thenReturn(Optional.of(Alimento.builder().id(2L).build()));
        when(perfilRepository.findByIdAndUsuarioId(1L, 10L))
                .thenReturn(Optional.empty());   // perfil no pertenece a este padre

        // Act
        var result = consumoService.registrar(new DatosRegistroConsumo(1L, 2L), 10L);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo("PERFIL_NO_ENCONTRADO");
    }
}
```
