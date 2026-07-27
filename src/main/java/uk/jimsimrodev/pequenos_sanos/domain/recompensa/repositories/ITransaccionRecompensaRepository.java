package uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.model.TransaccionRecompensa;

import java.util.List;

/**
 * Spring Data JPA repository for {@link TransaccionRecompensa} entity.
 */
public interface ITransaccionRecompensaRepository extends JpaRepository<TransaccionRecompensa, Long> {

    /**
     * Returns all reward transactions for a child profile, ordered by most recent first.
     *
     * @param perfilId the child profile ID
     * @return ordered list of reward transactions
     */
    List<TransaccionRecompensa> findByPerfilIdOrderByCreatedAtDesc(Long perfilId);

    /**
     * Checks whether a reward transaction already exists for a given consumption record.
     * Used to prevent duplicate reward credits.
     *
     * @param registroConsumoId the consumption record ID
     * @return true if a transaction already exists for that record
     */
    boolean existsByRegistroConsumoId(Long registroConsumoId);
}
