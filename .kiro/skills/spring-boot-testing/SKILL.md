---
name: spring-boot-testing
description: >
  Genera pruebas unitarias y de slice para proyectos Spring Boot 3.x siguiendo
  los estándares del proyecto Pequeños Sanos. Cubre @WebMvcTest para
  controladores, @DataJpaTest para repositorios y pruebas unitarias puras para
  servicios con Mockito. Aplica siempre el patrón Arrange-Act-Assert y las
  convenciones de nomenclatura del proyecto.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Spring Boot Testing — Pequeños Sanos

Generador de pruebas técnicas para Spring Boot 3.x con JUnit 5, Mockito y
Spring Security Test. Adaptado a la estructura de paquetes y convenciones del
proyecto Pequeños Sanos (`uk.jimsimrodev.pequenos_sanos`).

## Overview

Esta skill produce clases de prueba listas para compilar y ejecutar, siguiendo
el estándar del proyecto:

- **Slice tests (`@WebMvcTest`)** para la capa de controladores HTTP.
- **Slice tests (`@DataJpaTest`)** para repositorios JPA.
- **Unit tests (Mockito puro)** para la capa de servicios.
- Patrón **Arrange-Act-Assert (AAA)** con comentarios en cada fase.
- Nombres de método descriptivos en formato `should<Result>When<Condition>`.
- Aserciones con `MockMvcResultMatchers` y `AssertJ`.

## When to Use

Activa esta skill cuando el usuario pida:

- "Genera el test del controlador X"
- "Crea la prueba unitaria para el servicio Y"
- "Escribe el @DataJpaTest del repositorio Z"
- "Necesito test de validación para el endpoint X"
- "Crea tests AAA para..."
- "Genera pruebas @WebMvcTest"

## Quick Reference

### Anotaciones por tipo de prueba

| Tipo        | Anotación principal                   | Scope               |
| ----------- | ------------------------------------- | ------------------- |
| Controlador | `@WebMvcTest(XController.class)`      | Solo capa web       |
| Repositorio | `@DataJpaTest`                        | Solo capa JPA       |
| Servicio    | `@ExtendWith(MockitoExtension.class)` | Sin contexto Spring |
| Integración | `@SpringBootTest`                     | Contexto completo   |

### Estructura de paquetes de pruebas

```
src/test/java/uk/jimsimrodev/pequenos_sanos/
├── controller/          ← @WebMvcTest
├── domain/
│   └── [entidad]/       ← @DataJpaTest
└── service/             ← Unit tests con Mockito
```

### Dependencias requeridas (ya en el proyecto)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

---

## Instructions

### Generar test de Controlador (`@WebMvcTest`)

Usa la referencia:
[references/controller-test.md](references/controller-test.md)

**Pasos:**

1. Identificar el controlador y sus dependencias (services, mappers).
2. Usar `@WebMvcTest(NombreController.class)`.
3. Mockear dependencias con `@MockBean`.
4. Para endpoints protegidos con JWT, agregar `@WithMockUser` o
   configurar `SecurityConfig` de prueba.
5. Escribir mínimo: 1 test de éxito (200/201) + 1 test de validación (400)
   - 1 test de no autorizado (401/403).
6. Separar cada fase AAA con comentarios `// Arrange`, `// Act`, `// Assert`.

```java
@WebMvcTest(AuthController.class)
@Import(SecurityTestConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConsumoService consumoService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should return 201 when consumo is registered successfully")
    void shouldReturn201WhenConsumoIsRegisteredSuccessfully() throws Exception {
        // Arrange
        var request = new DatosRegistroConsumo(1L, 2L);
        var response = new DatosRespuestaConsumo(1L, "Brócoli", LocalDate.now());
        when(consumoService.registrar(any(), any())).thenReturn(Result.success(response));

        // Act
        var result = mockMvc.perform(post("/api/v1/consumos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // Assert
        result.andExpect(status().isCreated())
              .andExpect(jsonPath("$.id").value(1L));
    }
}
```

Guía completa → [references/controller-test.md](references/controller-test.md)

---

### Generar test de Repositorio (`@DataJpaTest`)

Usa la referencia:
[references/repository-test.md](references/repository-test.md)

**Pasos:**

1. Anotar con `@DataJpaTest`.
2. Inyectar el repositorio con `@Autowired`.
3. Usar `@Sql` o `TestEntityManager` para cargar datos de prueba.
4. Verificar constraints UNIQUE, queries personalizadas y métodos derivados.

```java
@DataJpaTest
class IRegistroConsumoRepositoryTest {

    @Autowired
    private IRegistroConsumoRepository repository;

    @Autowired
    private TestEntityManager em;

    @Test
    @DisplayName("Should throw exception when duplicate consumo is inserted same day")
    void shouldThrowExceptionWhenDuplicateConsumoIsInsertedSameDay() {
        // Arrange
        var perfil = em.persist(buildPerfilInfantil());
        var alimento = em.persist(buildAlimento());
        repository.save(buildRegistro(perfil, alimento, LocalDate.now()));

        // Act & Assert
        assertThatThrownBy(() -> {
            repository.save(buildRegistro(perfil, alimento, LocalDate.now()));
            em.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}
```

Guía completa → [references/repository-test.md](references/repository-test.md)

---

### Generar test de Servicio (Mockito puro)

Usa la referencia:
[references/service-test.md](references/service-test.md)

**Pasos:**

1. Anotar con `@ExtendWith(MockitoExtension.class)`.
2. Declarar mocks con `@Mock` e inyectarlos con `@InjectMocks`.
3. Cubrir: flujo feliz, cada `Result.Error` posible, y casos borde.
4. Usar `verify()` para confirmar interacciones con repositorios.

```java
@ExtendWith(MockitoExtension.class)
class ConsumoServiceTest {

    @Mock
    private IRegistroConsumoRepository consumoRepository;

    @Mock
    private RecompensaService recompensaService;

    @InjectMocks
    private ConsumoService consumoService;

    @Test
    @DisplayName("Should return CONSUMO_DUPLICADO when alimento already registered today")
    void shouldReturnConsumoDuplicadoWhenAlimentoAlreadyRegisteredToday() {
        // Arrange
        when(consumoRepository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                anyLong(), anyLong(), any(LocalDate.class))).thenReturn(true);

        // Act
        var result = consumoService.registrar(new DatosRegistroConsumo(1L, 2L), 1L);

        // Assert
        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo("CONSUMO_DUPLICADO");
        verify(consumoRepository, never()).save(any());
    }
}
```

Guía completa → [references/service-test.md](references/service-test.md)

---

## Best Practices

- **Nombres de método** deben describir comportamiento, no implementación:
  `shouldReturn400WhenEmailIsBlank` ✅ — `testLogin` ❌
- **Un assert conceptual por test** — si necesitas verificar múltiples cosas
  del mismo escenario, agrúpalas en el mismo test pero con claridad.
- **No probar detalles de implementación** — prueba el contrato público
  (lo que devuelve el método), no cómo lo hace internamente.
- **Datos de prueba aislados** — cada test construye sus propios datos;
  nunca dependas del orden de ejecución.
- **Mockear solo lo que importa** — si un `@MockBean` no se usa en el test,
  es señal de que el scope está mal.

## What NOT to Do

- No usar `@SpringBootTest` para probar un solo controlador o servicio.
- No omitir los comentarios `// Arrange`, `// Act`, `// Assert`.
- No escribir tests que solo verifican que el código compila.
- No hardcodear IDs como `1L` sin un comentario que explique el valor.
- No ignorar los tests de error — los `Result.Error` son tan importantes
  como los flujos de éxito.

## References

| Archivo                                                        | Contenido                                           |
| -------------------------------------------------------------- | --------------------------------------------------- |
| [references/controller-test.md](references/controller-test.md) | Plantillas completas `@WebMvcTest`, seguridad, JSON |
| [references/repository-test.md](references/repository-test.md) | Plantillas `@DataJpaTest`, constraints, queries     |
| [references/service-test.md](references/service-test.md)       | Plantillas Mockito, Result pattern, verify          |
| [references/test-utilities.md](references/test-utilities.md)   | Builders de datos de prueba, helpers comunes        |

## Constraints

- El paquete base siempre es `uk.jimsimrodev.pequenos_sanos`.
- Los tests de controlador van en `src/test/java/.../controller/`.
- Los tests de repositorio van en `src/test/java/.../domain/[entidad]/`.
- Los tests de servicio van en `src/test/java/.../service/`.
- Siempre usar `@DisplayName` con descripción en inglés en infinitivo.
- Los imports deben ser estáticos para `MockMvcResultMatchers` y `Mockito`.
