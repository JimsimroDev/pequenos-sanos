package uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.model.SesionJuego;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link SesionJuego} entity.
 */
public interface ISesionJuegoRepository extends JpaRepository<SesionJuego, Long> {

    /**
     * Finds a session for a given profile and date.
     *
     * @param perfilId    the child profile ID
     * @param fechaSesion the session date
     * @return the session if it exists
     */
    Optional<SesionJuego> findByPerfilIdAndFechaSesion(Long perfilId, LocalDate fechaSesion);

    /**
     * Finds an open (not yet closed) session for a given profile and date.
     *
     * @param perfilId    the child profile ID
     * @param fechaSesion the session date
     * @return the open session if it exists
     */
    Optional<SesionJuego> findByPerfilIdAndFechaSesionAndFinIsNull(Long perfilId, LocalDate fechaSesion);
}
