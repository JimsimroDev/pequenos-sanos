package uk.jimsimrodev.pequenos_sanos.domain.recompensa.controllers;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import uk.jimsimrodev.pequenos_sanos.config.SecurityConfig;
import uk.jimsimrodev.pequenos_sanos.config.SecurityTestConfig;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;
import uk.jimsimrodev.pequenos_sanos.infra.security.SecurityFilter;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RecompensaController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {SecurityConfig.class, SecurityFilter.class}
        ))
@Import(SecurityTestConfig.class)
class RecompensaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ITransaccionRecompensaRepository recompensaRepository;

    @MockBean
    private IPerfilInfantilRepository perfilRepository;

    private UsernamePasswordAuthenticationToken buildAuth(Long userId) {
        var usuario = new Usuario("Padre Test", "padre@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return userId; }
        };
        return new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
    }

    private PerfilInfantil buildPerfil(Long perfilId, Long padreId) {
        var padre = new Usuario("Padre", "p@test.com", "hash", Rol.PADRE) {
            @Override public Long getId() { return padreId; }
        };
        return new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30) {
            @Override public Long getId() { return perfilId; }
        };
    }

    @Test
    @DisplayName("Should return 200 with empty historial when profile belongs to parent")
    void shouldReturn200WhenProfileBelongsToParent() throws Exception {
        // Arrange
        var perfil = buildPerfil(1L, 1L);
        when(perfilRepository.findByIdAndActivoTrue(1L)).thenReturn(Optional.of(perfil));
        when(recompensaRepository.findByPerfilIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        // Act & Assert
        mockMvc.perform(get("/api/v1/recompensas/perfil/1")
                        .with(authentication(buildAuth(1L))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return 403 when historial requested for profile of another parent")
    void shouldReturn403WhenHistorialRequestedForProfileOfAnotherParent() throws Exception {
        // Arrange — profile belongs to parent 2, requesting user is parent 1
        var perfilDeOtro = buildPerfil(5L, 2L);
        when(perfilRepository.findByIdAndActivoTrue(5L)).thenReturn(Optional.of(perfilDeOtro));

        // Act & Assert
        mockMvc.perform(get("/api/v1/recompensas/perfil/5")
                        .with(authentication(buildAuth(1L))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should return 200 with saldo when profile belongs to parent")
    void shouldReturn200WithSaldoWhenProfileBelongsToParent() throws Exception {
        // Arrange
        var perfil = buildPerfil(1L, 1L);
        when(perfilRepository.findByIdAndActivoTrue(anyLong())).thenReturn(Optional.of(perfil));

        // Act & Assert
        mockMvc.perform(get("/api/v1/recompensas/perfil/1/saldo")
                        .with(authentication(buildAuth(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfilId").value(1L));
    }

    @Test
    @DisplayName("Should return 403 when saldo requested for profile of another parent")
    void shouldReturn403WhenSaldoRequestedForProfileOfAnotherParent() throws Exception {
        // Arrange
        var perfilDeOtro = buildPerfil(5L, 2L);
        when(perfilRepository.findByIdAndActivoTrue(5L)).thenReturn(Optional.of(perfilDeOtro));

        // Act & Assert
        mockMvc.perform(get("/api/v1/recompensas/perfil/5/saldo")
                        .with(authentication(buildAuth(1L))))
                .andExpect(status().isForbidden());
    }
}
