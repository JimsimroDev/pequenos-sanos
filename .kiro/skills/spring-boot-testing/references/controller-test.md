# Controller Test Reference — @WebMvcTest

Plantillas completas para pruebas de la capa de controladores del proyecto
Pequeños Sanos usando `@WebMvcTest`, `MockMvc` y Spring Security Test.

## Estructura base de un test de controlador

```java
package uk.jimsimrodev.pequenos_sanos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import uk.jimsimrodev.pequenos_sanos.domain.[entidad].Datos[Request];
import uk.jimsimrodev.pequenos_sanos.domain.[entidad].Datos[Response];
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.service.[Nombre]Service;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest([Nombre]Controller.class)
@Import(SecurityTestConfig.class)           // desactiva JWT para pruebas de slice
class [Nombre]ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private [Nombre]Service [nombre]Service;  // mockear todas las dependencias del controller
}
```

---

## Plantilla: POST con cuerpo JSON — éxito 201

```java
@Test
@WithMockUser                               // simula usuario autenticado
@DisplayName("Should return 201 when resource is created successfully")
void shouldReturn201WhenResourceIsCreatedSuccessfully() throws Exception {
    // Arrange
    var requestBody = new DatosRegistro[Nombre](/* campos válidos */);
    var serviceResponse = new DatosRespuesta[Nombre](1L, /* campos */);
    when([nombre]Service.crear(any())).thenReturn(Result.success(serviceResponse));

    // Act
    var result = mockMvc.perform(post("/api/v1/[ruta]")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestBody)));

    // Assert
    result.andExpect(status().isCreated())
          .andExpect(jsonPath("$.id").value(1L));
}
```

## Plantilla: POST con cuerpo JSON — fallo de validación 400

```java
@Test
@WithMockUser
@DisplayName("Should return 400 when required fields are blank")
void shouldReturn400WhenRequiredFieldsAreBlank() throws Exception {
    // Arrange — objeto con campos inválidos (vacíos/nulos)
    var invalidRequest = new DatosRegistro[Nombre](null, "");

    // Act
    var result = mockMvc.perform(post("/api/v1/[ruta]")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(invalidRequest)));

    // Assert
    result.andExpect(status().isBadRequest());
}
```

## Plantilla: GET lista — éxito 200

```java
@Test
@WithMockUser
@DisplayName("Should return 200 with list when resources exist")
void shouldReturn200WithListWhenResourcesExist() throws Exception {
    // Arrange
    var lista = List.of(new DatosRespuesta[Nombre](1L, /* campos */));
    when([nombre]Service.listar(any())).thenReturn(lista);

    // Act
    var result = mockMvc.perform(get("/api/v1/[ruta]")
            .contentType(MediaType.APPLICATION_JSON));

    // Assert
    result.andExpect(status().isOk())
          .andExpect(jsonPath("$").isArray())
          .andExpect(jsonPath("$[0].id").value(1L));
}
```

## Plantilla: GET por ID — no encontrado 404

```java
@Test
@WithMockUser
@DisplayName("Should return 404 when resource does not exist")
void shouldReturn404WhenResourceDoesNotExist() throws Exception {
    // Arrange
    long nonExistentId = 999L;
    when([nombre]Service.buscarPorId(nonExistentId))
            .thenThrow(new EntityNotFoundException("Not found"));

    // Act
    var result = mockMvc.perform(get("/api/v1/[ruta]/{id}", nonExistentId));

    // Assert
    result.andExpect(status().isNotFound());
}
```

## Plantilla: Endpoint protegido — sin autenticación 401

```java
@Test
@DisplayName("Should return 401 when request has no authentication token")
void shouldReturn401WhenRequestHasNoAuthenticationToken() throws Exception {
    // Arrange — no se configura @WithMockUser ni token

    // Act
    var result = mockMvc.perform(get("/api/v1/[ruta]")
            .contentType(MediaType.APPLICATION_JSON));

    // Assert
    result.andExpect(status().isUnauthorized());
}
```

## Plantilla: Endpoint protegido — rol insuficiente 403

```java
@Test
@WithMockUser(roles = "NINO")              // rol que NO tiene permiso
@DisplayName("Should return 403 when user role is not authorized")
void shouldReturn403WhenUserRoleIsNotAuthorized() throws Exception {
    // Arrange — usuario autenticado pero sin el rol correcto

    // Act
    var result = mockMvc.perform(post("/api/v1/consumos")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"));

    // Assert
    result.andExpect(status().isForbidden());
}
```

## Plantilla: Result.Error desde el service — 422

```java
@Test
@WithMockUser
@DisplayName("Should return 422 when service returns business error")
void shouldReturn422WhenServiceReturnsBusinessError() throws Exception {
    // Arrange
    var requestBody = new DatosRegistroConsumo(1L, 2L);
    when(consumoService.registrar(any(), any()))
            .thenReturn(Result.error("CONSUMO_DUPLICADO", "Ya registrado hoy"));

    // Act
    var result = mockMvc.perform(post("/api/v1/consumos")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestBody)));

    // Assert
    result.andExpect(status().isUnprocessableEntity())
          .andExpect(jsonPath("$.codigo").value("CONSUMO_DUPLICADO"));
}
```

---

## SecurityTestConfig para @WebMvcTest

Cuando uses `@WebMvcTest` el contexto de seguridad se carga parcialmente.
Crea esta configuración en `src/test/java/.../config/`:

```java
package uk.jimsimrodev.pequenos_sanos.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad simplificada para pruebas de slice (@WebMvcTest).
 * Deshabilita JWT y CSRF para permitir probar controladores de forma aislada.
 */
@TestConfiguration
public class SecurityTestConfig {

    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .build();
    }
}
```

> Usa `@Import(SecurityTestConfig.class)` en los tests que necesiten
> omitir la seguridad JWT real.

---

## Ejemplo completo: ConsumoControllerTest

```java
package uk.jimsimrodev.pequenos_sanos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import uk.jimsimrodev.pequenos_sanos.config.SecurityTestConfig;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.DatosRegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.DatosRespuestaConsumo;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.service.ConsumoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ConsumoController.class)
@Import(SecurityTestConfig.class)
class ConsumoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ConsumoService consumoService;

    @Test
    @WithMockUser
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
              .andExpect(jsonPath("$.id").value(1L))
              .andExpect(jsonPath("$.nombreAlimento").value("Brócoli"));
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 400 when perfilId is null")
    void shouldReturn400WhenPerfilIdIsNull() throws Exception {
        // Arrange — perfilId nulo viola @NotNull
        var invalidRequest = new DatosRegistroConsumo(null, 2L);

        // Act
        var result = mockMvc.perform(post("/api/v1/consumos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)));

        // Assert
        result.andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 422 when consumo is duplicate for today")
    void shouldReturn422WhenConsumoIsDuplicateForToday() throws Exception {
        // Arrange
        var request = new DatosRegistroConsumo(1L, 2L);
        when(consumoService.registrar(any(), any()))
                .thenReturn(Result.error("CONSUMO_DUPLICADO", "Ya registrado hoy"));

        // Act
        var result = mockMvc.perform(post("/api/v1/consumos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // Assert
        result.andExpect(status().isUnprocessableEntity())
              .andExpect(jsonPath("$.codigo").value("CONSUMO_DUPLICADO"));
    }

    @Test
    @DisplayName("Should return 401 when request has no authentication")
    void shouldReturn401WhenRequestHasNoAuthentication() throws Exception {
        // Arrange — no @WithMockUser, sin token

        // Act
        var result = mockMvc.perform(post("/api/v1/consumos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"));

        // Assert
        result.andExpect(status().isUnauthorized());
    }
}
```
