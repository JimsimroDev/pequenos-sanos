package uk.jimsimrodev.pequenos_sanos.domain.auth.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uk.jimsimrodev.pequenos_sanos.config.SecurityConfig;
import uk.jimsimrodev.pequenos_sanos.config.SecurityTestConfig;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosJWTToken;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosLoginUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosRegistroUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosRespuestaUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.services.IAuthService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;
import uk.jimsimrodev.pequenos_sanos.infra.security.SecurityFilter;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {SecurityConfig.class, SecurityFilter.class}
        ))
@Import(SecurityTestConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IAuthService authService;

    @Test
    @DisplayName("Should return 201 when registration is successful")
    void shouldReturn201WhenRegistrationIsSuccessful() throws Exception {
        // Arrange
        var request = new DatosRegistroUsuario("Juan Perez", "juan@example.com", "password123");
        var response = new DatosRespuestaUsuario(1L, "Juan Perez", "juan@example.com");

        when(authService.registrar(any(DatosRegistroUsuario.class)))
                .thenReturn(Result.success(response));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nombre").value("Juan Perez"))
                .andExpect(jsonPath("$.email").value("juan@example.com"));
    }

    @Test
    @DisplayName("Should return 409 when email already exists")
    void shouldReturn409WhenEmailAlreadyExists() throws Exception {
        // Arrange
        var request = new DatosRegistroUsuario("Juan Perez", "duplicado@example.com", "password123");

        when(authService.registrar(any(DatosRegistroUsuario.class)))
                .thenReturn(Result.error(CodigosError.EMAIL_DUPLICADO, "El correo ya existe"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Should return 400 when registration data is invalid")
    void shouldReturn400WhenRegistrationDataIsInvalid() throws Exception {
        // Arrange — empty name and invalid email
        var request = new DatosRegistroUsuario("", "not-an-email", "12");

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 200 with token when login is successful")
    void shouldReturn200WithTokenWhenLoginIsSuccessful() throws Exception {
        // Arrange
        var request = new DatosLoginUsuario("juan@example.com", "password123");

        when(authService.login(any(DatosLoginUsuario.class)))
                .thenReturn(Result.success(new DatosJWTToken("jwt-token-123")));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-123"));
    }

    @Test
    @DisplayName("Should return 401 when credentials are invalid")
    void shouldReturn401WhenCredentialsAreInvalid() throws Exception {
        // Arrange
        var request = new DatosLoginUsuario("juan@example.com", "wrongpassword");

        when(authService.login(any(DatosLoginUsuario.class)))
                .thenReturn(Result.error("CREDENCIALES_INVALIDAS", "Credenciales incorrectas"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
