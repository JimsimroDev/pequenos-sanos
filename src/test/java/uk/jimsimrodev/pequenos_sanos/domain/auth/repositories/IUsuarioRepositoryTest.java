package uk.jimsimrodev.pequenos_sanos.domain.auth.repositories;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class IUsuarioRepositoryTest {

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private TestEntityManager em;

    @Test
    @DisplayName("Should find user by email when user exists")
    void shouldFindUserByEmailWhenUserExists() {
        // Arrange
        var usuario = new Usuario("Maria Lopez", "maria@example.com", "hashedpwd123", Rol.PADRE);
        em.persistAndFlush(usuario);

        // Act
        Optional<Usuario> result = usuarioRepository.findByEmail("maria@example.com");

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getNombre()).isEqualTo("Maria Lopez");
        assertThat(result.get().getEmail()).isEqualTo("maria@example.com");
        assertThat(result.get().getRol()).isEqualTo(Rol.PADRE);
    }

    @Test
    @DisplayName("Should return empty when email does not exist")
    void shouldReturnEmptyWhenEmailDoesNotExist() {
        // Arrange — no user persisted

        // Act
        Optional<Usuario> result = usuarioRepository.findByEmail("noexiste@example.com");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return true when email already exists")
    void shouldReturnTrueWhenEmailAlreadyExists() {
        // Arrange
        var usuario = new Usuario("Pedro Garcia", "pedro@example.com", "hashedpwd456", Rol.PADRE);
        em.persistAndFlush(usuario);

        // Act
        boolean exists = usuarioRepository.existsByEmail("pedro@example.com");

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when email does not exist")
    void shouldReturnFalseWhenEmailDoesNotExist() {
        // Arrange — no user persisted

        // Act
        boolean exists = usuarioRepository.existsByEmail("inexistente@example.com");

        // Assert
        assertThat(exists).isFalse();
    }
}
