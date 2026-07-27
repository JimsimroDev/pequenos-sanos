package uk.jimsimrodev.pequenos_sanos.domain.consumo.services;

import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRespuestaConsumo;
import uk.jimsimrodev.pequenos_sanos.infra.Result;

/**
 * Service contract for food consumption registration.
 */
public interface IConsumoService {

    /**
     * Registers a food consumption for a child profile and triggers the reward engine.
     * The entire operation runs within a single ACID transaction.
     *
     * @param datos     registration data (perfilId, alimentoId)
     * @param usuarioId the authenticated parent's user ID (for ownership validation)
     * @return Result.Success with the created record, or Result.Error with a business code
     */
    Result<DatosRespuestaConsumo> registrar(DatosRegistroConsumo datos, Long usuarioId);

    /**
     * Returns the consumption history for a child profile, ordered by most recent first.
     *
     * @param perfilId the child profile ID
     * @return list of consumption records
     */
    java.util.List<DatosRespuestaConsumo> listarPorPerfil(Long perfilId);
}
