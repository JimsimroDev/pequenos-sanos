package uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class IPerfilInfantilRepositoryTest {

    @Autowired
    private IPerfilInfantilRepository perfilRepository;

    @Autowired
    private TestEntityManager em;

    private Usuario padre;

    @BeforeEach
    void setUp() {
        // Arrange — shared parent user for all tests
        padre = new Usuario("Carlos Torres", "carlos@example.com", "hashedpwd", Rol.PADRE);
        em.persistAndFlush(padre);
    }

    @Test
    @DisplayName("Should return active profiles for a given parent user")
    void shouldReturnActiveProfilesForGivenParentUser() {
        // Arrange
        var perfil1 = new PerfilInfantil(padre, "Lucía", (short) 3, (short) 30);
        var perfil2 = new PerfilInfantil(padre, "Miguel", (short) 4, (short) 20);
        em.persistAndFlush(perfil1);
        em.persistAndFlush(perfil2);

        // Act
        List<PerfilInfantil> result = perfilRepository.findByUsuarioIdAndActivoTrue(padre.getId());

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).extracting(PerfilInfantil::getNombre)
                .containsExactlyInAnyOrder("Lucía", "Miguel");
    }

    @Test
    @DisplayName("Should not return inactive profiles")
    void shouldNotReturnInactiveProfiles() {
        // Arrange
        var perfil = new PerfilInfantil(padre, "Ana", (short) 2, (short) 15);
        em.persistAndFlush(perfil);
        perfil.setActivo(false);
        em.persistAndFlush(perfil);

        // Act
        List<PerfilInfantil> result = perfilRepository.findByUsuarioIdAndActivoTrue(padre.getId());

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when parent has no profiles")
    void shouldReturnEmptyListWhenParentHasNoProfiles() {
        // Arrange — padre has no profiles

        // Act
        List<PerfilInfantil> result = perfilRepository.findByUsuarioIdAndActivoTrue(padre.getId());

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find active profile by id")
    void shouldFindActiveProfileById() {
        // Arrange
        var perfil = new PerfilInfantil(padre, "Sofía", (short) 3, (short) 25);
        em.persistAndFlush(perfil);

        // Act
        var result = perfilRepository.findByIdAndActivoTrue(perfil.getId());

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getNombre()).isEqualTo("Sofía");
    }
}
