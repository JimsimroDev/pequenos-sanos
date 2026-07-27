package uk.jimsimrodev.pequenos_sanos.infra.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;

import static org.assertj.core.api.Assertions.assertThat;

class TokenServiceTest {

    private TokenService tokenService;

    private static final String SECRET = "my-super-secret-key-for-testing-purposes-only-32chars";
    private static final long EXPIRATION_MILLIS = 7200000L; // 2 hours

    @BeforeEach
    void setUp() {
        tokenService = new TokenService(SECRET, EXPIRATION_MILLIS);
    }

    @Test
    @DisplayName("Should generate token and extract subject correctly")
    void shouldGenerateTokenAndExtractSubjectCorrectly() {
        // Arrange
        var usuario = new Usuario("Juan Perez", "juan@example.com", "hashedpassword", Rol.PADRE);

        // Act
        String token = tokenService.generarToken(usuario);
        String subject = tokenService.getSubject(token);

        // Assert
        assertThat(token).isNotNull().isNotBlank();
        assertThat(subject).isEqualTo("juan@example.com");
    }

    @Test
    @DisplayName("Should return null when token is invalid")
    void shouldReturnNullWhenTokenIsInvalid() {
        // Arrange
        String invalidToken = "eyJhbGciOiJIUzI1NiJ9.invalid.signature";

        // Act
        String subject = tokenService.getSubject(invalidToken);

        // Assert
        assertThat(subject).isNull();
    }

    @Test
    @DisplayName("Should return null when token is tampered")
    void shouldReturnNullWhenTokenIsTampered() {
        // Arrange
        var usuario = new Usuario("Ana Lopez", "ana@example.com", "hashedpassword", Rol.PADRE);
        String validToken = tokenService.generarToken(usuario);
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "XXXXX";

        // Act
        String subject = tokenService.getSubject(tamperedToken);

        // Assert
        assertThat(subject).isNull();
    }

    @Test
    @DisplayName("Should return null when token is expired")
    void shouldReturnNullWhenTokenIsExpired() {
        // Arrange — create a service with 0ms expiration (already expired)
        var expiredTokenService = new TokenService(SECRET, 0L);
        var usuario = new Usuario("Maria Test", "maria@example.com", "hashedpassword", Rol.NINO);
        String token = expiredTokenService.generarToken(usuario);

        // Act
        String subject = tokenService.getSubject(token);

        // Assert
        assertThat(subject).isNull();
    }
}
