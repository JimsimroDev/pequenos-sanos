package uk.jimsimrodev.pequenos_sanos.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.repositories.IUsuarioRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.infra.security.TokenService;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security and authorization tests covering JWT validation, cross-parent access prevention,
 * and unauthenticated request handling.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthorizationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private IUsuarioRepository usuarioRepository;
    @Autowired private IPerfilInfantilRepository perfilRepository;
    @Autowired private TokenService tokenService;

    @Test
    @DisplayName("Should return 401 when request to protected endpoint has no token")
    void shouldReturn401WhenNoTokenProvided() throws Exception {
        // Arrange — no Authorization header

        // Act & Assert
        mockMvc.perform(get("/api/v1/perfiles"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 401 when JWT token is expired")
    void shouldReturn401WhenJwtTokenIsExpired() throws Exception {
        // Arrange — create expired token (0ms expiration)
        var tokenServiceExpired = new TokenService(
                "test-secret-key-for-unit-testing-purposes-minimum-32-chars", 0L);
        var padre = usuarioRepository.save(
                new Usuario("Test User", "test@example.com", "hash", Rol.PADRE));
        String expiredToken = tokenServiceExpired.generarToken(padre);

        // Act & Assert
        mockMvc.perform(get("/api/v1/perfiles")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 403 when padre A tries to access perfil of padre B")
    void shouldReturn403WhenParentAccessesPerfiltOfAnotherParent() throws Exception {
        // Arrange — create two parents
        var padreA = usuarioRepository.save(
                new Usuario("Padre A", "padre-a@test.com", "hash", Rol.PADRE));
        var padreB = usuarioRepository.save(
                new Usuario("Padre B", "padre-b@test.com", "hash", Rol.PADRE));

        // Perfil pertenece a Padre B
        var perfilDeB = perfilRepository.save(
                new PerfilInfantil(padreB, "Hijo de B", (short) 3, (short) 30));

        // Padre A tries to delete Padre B's profile
        var authA = new UsernamePasswordAuthenticationToken(
                padreA, null, List.of());

        // Act & Assert — 403 Forbidden
        mockMvc.perform(delete("/api/v1/perfiles/" + perfilDeB.getId())
                        .with(authentication(authA)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should return 200 when valid token is provided to protected endpoint")
    void shouldReturn200WhenValidTokenProvided() throws Exception {
        // Arrange
        var padre = usuarioRepository.save(
                new Usuario("Padre Válido", "valido@test.com", "hash", Rol.PADRE));
        String validToken = tokenService.generarToken(padre);

        // Act & Assert
        mockMvc.perform(get("/api/v1/perfiles")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return 200 when POST /auth/registro without token (public endpoint)")
    void shouldReturn201WhenPostToPublicRegistroEndpoint() throws Exception {
        // Arrange — public endpoint, no token required
        String body = """
                {"nombre":"Test","email":"nuevo@test.com","password":"password123"}
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    // Helper method for DELETE request
    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder delete(String url) {
        return org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete(url);
    }
}
