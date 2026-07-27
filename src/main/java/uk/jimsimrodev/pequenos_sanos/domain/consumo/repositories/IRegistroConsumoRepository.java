package uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.model.RegistroConsumo;

import java.time.LocalDate;
import java.util.List;

/**
 * Spring Data JPA repository for {@link RegistroConsumo} entity.
 */
public interface IRegistroConsumoRepository extends JpaRepository<RegistroConsumo, Long> {

    /**
     * Returns all consumption records for a child profile, ordered by most recent first.
     *
     * @param perfilId the child profile ID
     * @return ordered list of consumption records
     */
    List<RegistroConsumo> findByPerfilIdOrderByCreatedAtDesc(Long perfilId);

    /**
     * Checks whether a food item was already registered for a child profile on a given date.
     * Used to enforce the daily uniqueness constraint at the application layer.
     *
     * @param perfilId     the child profile ID
     * @param alimentoId   the food item ID
     * @param fechaConsumo the date of consumption
     * @return true if a record already exists for that combination
     */
    boolean existsByPerfilIdAndAlimentoIdAndFechaConsumo(
            Long perfilId, Long alimentoId, LocalDate fechaConsumo);
}
