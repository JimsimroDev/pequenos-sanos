# Repository Test Reference — @DataJpaTest

Plantillas para pruebas de la capa de persistencia del proyecto Pequeños Sanos
usando `@DataJpaTest`, `TestEntityManager` y anotaciones de datos de prueba.

## Estructura base de un test de repositorio

```java
package uk.jimsimrodev.pequenos_sanos.domain.[entidad];

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest                              // carga solo JPA, usa H2 en memoria
class I[Entidad]RepositoryTest {

    @Autowired
    private I[Entidad]Repository repository;

    @Autowired
    private TestEntityManager em;         // para persistir datos de prueba directamente
}
```

> **Nota:** `@DataJpaTest` usa H2 por defecto. Si necesitas comportamiento
> específico de PostgreSQL (constraints, tipos), agrega
> `@AutoConfigureTestDatabase(replace = Replace.NONE)` y configura un
> datasource de prueba con Testcontainers.

---

## Plantilla: verificar que un método derivado devuelve el resultado correcto

```java
@Test
@DisplayName("Should find active records by user id")
void shouldFindActiveRecordsByUserId() {
    // Arrange
    var usuario = em.persist(buildUsuario());
    var activo = em.persist(build[Entidad](usuario, true));
    em.persist(build[Entidad](usuario, false));  // inactivo — no debe aparecer
    em.flush();

    // Act
    var resultado = repository.findBy[Campo]AndActivoTrue(usuario.getId());

    // Assert
    assertThat(resultado).hasSize(1);
    assertThat(resultado.get(0).getId()).isEqualTo(activo.getId());
}
```

## Plantilla: verificar constraint UNIQUE

```java
@Test
@DisplayName("Should throw DataIntegrityViolationException when unique constraint is violated")
void shouldThrowDataIntegrityViolationExceptionWhenUniqueConstraintIsViolated() {
    // Arrange
    var entidad1 = build[Entidad](/* mismos campos únicos */);
    var entidad2 = build[Entidad](/* mismos campos únicos */);
    repository.save(entidad1);

    // Act & Assert
    assertThatThrownBy(() -> {
        repository.save(entidad2);
        em.flush();                        // fuerza el INSERT para que salte el constraint
    }).isInstanceOf(DataIntegrityViolationException.class);
}
```

## Plantilla: query personalizada con @Query

```java
@Test
@DisplayName("Should return true when record exists for given perfil alimento and date")
void shouldReturnTrueWhenRecordExistsForGivenPerfilAlimentoAndDate() {
    // Arrange
    var perfil = em.persist(buildPerfil());
    var alimento = em.persist(buildAlimento());
    em.persist(buildRegistroConsumo(perfil, alimento, LocalDate.now()));
    em.flush();

    // Act
    boolean existe = repository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
            perfil.getId(), alimento.getId(), LocalDate.now());

    // Assert
    assertThat(existe).isTrue();
}

@Test
@DisplayName("Should return false when no record exists for given date")
void shouldReturnFalseWhenNoRecordExistsForGivenDate() {
    // Arrange — no hay datos insertados para esa fecha

    // Act
    boolean existe = repository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
            1L, 2L, LocalDate.now());

    // Assert
    assertThat(existe).isFalse();
}
```

## Plantilla: verificar que no persiste cuando hay rollback

```java
@Test
@DisplayName("Should not persist record when transaction is rolled back")
void shouldNotPersistRecordWhenTransactionIsRolledBack() {
    // Arrange
    long countBefore = repository.count();

    // Act — simular que algo falla durante la transacción
    try {
        repository.save(build[Entidad](/* campos inválidos */));
        em.flush();
    } catch (Exception ignored) {
        // esperado
    }

    // Assert
    assertThat(repository.count()).isEqualTo(countBefore);
}
```

---

## Ejemplo completo: IRegistroConsumoRepositoryTest

```java
package uk.jimsimrodev.pequenos_sanos.domain.consumo;

import uk.jimsimrodev.pequenos_sanos.domain.alimento.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class IRegistroConsumoRepositoryTest {

    @Autowired
    private IRegistroConsumoRepository repository;

    @Autowired
    private TestEntityManager em;

    @Test
    @DisplayName("Should return true when consumo exists for perfil alimento and date")
    void shouldReturnTrueWhenConsumoExistsForPerfilAlimentoAndDate() {
        // Arrange
        var usuario = em.persist(buildUsuario());
        var perfil = em.persist(buildPerfil(usuario));
        var alimento = em.persist(buildAlimento());
        em.persist(buildRegistro(perfil, alimento, usuario, LocalDate.now()));
        em.flush();

        // Act
        boolean existe = repository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                perfil.getId(), alimento.getId(), LocalDate.now());

        // Assert
        assertThat(existe).isTrue();
    }

    @Test
    @DisplayName("Should return false when consumo does not exist for given date")
    void shouldReturnFalseWhenConsumoDoesNotExistForGivenDate() {
        // Arrange — sin datos en BD

        // Act
        boolean existe = repository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                1L, 1L, LocalDate.now());

        // Assert
        assertThat(existe).isFalse();
    }

    @Test
    @DisplayName("Should throw exception when duplicate consumo is inserted same day")
    void shouldThrowExceptionWhenDuplicateConsumoIsInsertedSameDay() {
        // Arrange
        var usuario = em.persist(buildUsuario());
        var perfil = em.persist(buildPerfil(usuario));
        var alimento = em.persist(buildAlimento());
        repository.save(buildRegistro(perfil, alimento, usuario, LocalDate.now()));

        // Act & Assert
        assertThatThrownBy(() -> {
            repository.save(buildRegistro(perfil, alimento, usuario, LocalDate.now()));
            em.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Should find all consumos for a given perfil ordered by date descending")
    void shouldFindAllConsumosForGivenPerfilOrderedByDateDescending() {
        // Arrange
        var usuario = em.persist(buildUsuario());
        var perfil = em.persist(buildPerfil(usuario));
        var alimento = em.persist(buildAlimento());

        em.persist(buildRegistro(perfil, alimento, usuario, LocalDate.now().minusDays(1)));
        em.persist(buildRegistro(perfil, alimento, usuario, LocalDate.now()));
        em.flush();

        // Act
        var lista = repository.findByPerfilIdOrderByCreatedAtDesc(perfil.getId());

        // Assert
        assertThat(lista).hasSize(2);
        assertThat(lista.get(0).getFechaConsumo())
                .isAfterOrEqualTo(lista.get(1).getFechaConsumo());
    }

    // ---- Builders de datos de prueba ----

    private Usuario buildUsuario() {
        return Usuario.builder()
                .nombre("Padre Test")
                .email("padre@test.com")
                .passwordHash("hash")
                .build();
    }

    private PerfilInfantil buildPerfil(Usuario usuario) {
        return PerfilInfantil.builder()
                .usuario(usuario)
                .nombre("Niño Test")
                .edadAnios(3)
                .screenTimeLimit(15)
                .build();
    }

    private Alimento buildAlimento() {
        return Alimento.builder()
                .nombre("Brócoli")
                .categoria(CategoriaAlimento.VERDURA)
                .puntosReward(10)
                .build();
    }

    private RegistroConsumo buildRegistro(PerfilInfantil perfil, Alimento alimento,
                                          Usuario registradoPor, LocalDate fecha) {
        return RegistroConsumo.builder()
                .perfil(perfil)
                .alimento(alimento)
                .registradoPor(registradoPor)
                .fechaConsumo(fecha)
                .horaConsumo(LocalTime.now())
                .build();
    }
}
```
