package uk.jimsimrodev.pequenos_sanos.domain.perfil.controllers;

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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import uk.jimsimrodev.pequenos_sanos.config.SecurityConfig;
import uk.jimsimrodev.pequenos_sanos.config.SecurityTestConfig;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRegistroPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRespuestaPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.services.IPerfilService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;
import uk.jimsimrodev.pequenos_sanos.infra.security.SecurityFilter;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PerfilController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {SecurityConfig.class, SecurityFilter.class}
        ))
@Import(SecurityTestConfig.class)
class PerfilControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IPerfilService perfilService;

    private UsernamePasswordAuthenticationToken buildAuth(Long userId) {
        var usuario = new Usuario("Padre Test", "padre@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return userId; }
        };
        return new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
    }

    @Test
    @DisplayName("Should return 201 when profile is created successfully")
    void shouldReturn201WhenProfileIsCreatedSuccessfully() throws Exception {
        // Arrange
        var request = new DatosRegistroPerfil("Lucía", (short) 3, "AVATAR_01", (short) 30);
        var response = new DatosRespuestaPerfil(1L, "Lucía", (short) 3, "AVATAR_01", (short) 30, 0);

        when(perfilService.crear(any(DatosRegistroPerfil.class), eq(1L)))
                .thenReturn(Result.success(response));

        // Act & Assert
        mockMvc.perform(post("/api/v1/perfiles")
                        .with(authentication(buildAuth(1L)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nombre").value("Lucía"));
    }

    @Test
    @DisplayName("Should return 400 when registration data is invalid")
    void shouldReturn400WhenRegistrationDataIsInvalid() throws Exception {
        // Arrange — blank name, invalid age
        var request = new DatosRegistroPerfil("", (short) 10, null, (short) 30);

        // Act & Assert
        mockMvc.perform(post("/api/v1/perfiles")
                        .with(authentication(buildAuth(1L)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 200 with profile list when listing")
    void shouldReturn200WithProfileListWhenListing() throws Exception {
        // Arrange
        var perfil = new DatosRespuestaPerfil(1L, "Lucía", (short) 3, "AVATAR_01", (short) 30, 50);
        when(perfilService.listar(1L)).thenReturn(List.of(perfil));

        // Act & Assert
        mockMvc.perform(get("/api/v1/perfiles")
                        .with(authentication(buildAuth(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Lucía"));
    }

    @Test
    @DisplayName("Should return 403 when deactivating a profile of another parent")
    void shouldReturn403WhenDeactivatingProfileOfAnotherParent() throws Exception {
        // Arrange
        when(perfilService.desactivar(eq(99L), eq(1L)))
                .thenReturn(Result.error(CodigosError.PERFIL_NO_ENCONTRADO,
                        "El perfil no pertenece al usuario"));

        // Act & Assert
        mockMvc.perform(delete("/api/v1/perfiles/99")
                        .with(authentication(buildAuth(1L))))
                .andExpect(status().isForbidden());
    }
}
