package uk.jimsimrodev.pequenos_sanos.domain.alimento.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Alimento} entity.
 */
public interface IAlimentoRepository extends JpaRepository<Alimento, Long> {

    /**
     * Returns all active food items.
     *
     * @return list of active alimentos
     */
    List<Alimento> findByActivoTrue();

    /**
     * Returns all active food items filtered by category.
     *
     * @param categoria the food category to filter by
     * @return list of active alimentos in that category
     */
    List<Alimento> findByCategoriaAndActivoTrue(CategoriaAlimento categoria);
}
