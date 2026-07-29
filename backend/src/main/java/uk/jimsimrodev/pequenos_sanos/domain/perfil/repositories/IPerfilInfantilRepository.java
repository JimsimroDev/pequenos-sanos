package uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link PerfilInfantil} entity.
 */
public interface IPerfilInfantilRepository extends JpaRepository<PerfilInfantil, Long> {

    /**
     * Returns all active child profiles belonging to the given parent user.
     *
     * @param usuarioId the ID of the parent/tutor user
     * @return list of active profiles for that user
     */
    List<PerfilInfantil> findByUsuarioIdAndActivoTrue(Long usuarioId);

    /**
     * Finds an active profile by its ID.
     *
     * @param id     the profile ID
     * @param activo whether the profile is active
     * @return the profile if found
     */
    Optional<PerfilInfantil> findByIdAndActivoTrue(Long id);
}
