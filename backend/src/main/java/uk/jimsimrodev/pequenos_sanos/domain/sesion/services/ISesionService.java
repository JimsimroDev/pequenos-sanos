package uk.jimsimrodev.pequenos_sanos.domain.sesion.services;

import uk.jimsimrodev.pequenos_sanos.domain.sesion.dto.DatosRespuestaSesion;
import uk.jimsimrodev.pequenos_sanos.infra.Result;

/**
 * Service contract for game session management.
 */
public interface ISesionService {

    /**
     * Starts a new game session for a child profile.
     * Validates that the daily time limit has not been reached and no active session exists.
     *
     * @param perfilId the child profile ID
     * @return Result.Success with the session data, or Result.Error with TIEMPO_AGOTADO or SESION_ACTIVA
     */
    Result<DatosRespuestaSesion> iniciar(Long perfilId);
}
