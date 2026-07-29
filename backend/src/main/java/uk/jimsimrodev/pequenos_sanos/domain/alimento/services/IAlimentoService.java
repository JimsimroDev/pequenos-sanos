package uk.jimsimrodev.pequenos_sanos.domain.alimento.services;

import uk.jimsimrodev.pequenos_sanos.domain.alimento.dto.DatosRespuestaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;

import java.util.List;
import java.util.Optional;

/**
 * Service contract for the food catalogue.
 */
public interface IAlimentoService {

    /**
     * Returns all active food items, optionally filtered by category.
     *
     * @param categoria optional category filter; null returns all active items
     * @return list of active food items
     */
    List<DatosRespuestaAlimento> listar(CategoriaAlimento categoria);

    /**
     * Returns a single active food item by its ID.
     *
     * @param id the food item ID
     * @return the food item if found and active, empty otherwise
     */
    Optional<DatosRespuestaAlimento> buscarPorId(Long id);
}
