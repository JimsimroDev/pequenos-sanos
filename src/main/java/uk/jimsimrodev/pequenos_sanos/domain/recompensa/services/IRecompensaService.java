package uk.jimsimrodev.pequenos_sanos.domain.recompensa.services;

import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosRespuestaRecompensa;
import uk.jimsimrodev.pequenos_sanos.infra.Result;

/**
 * Service contract for reward transaction operations.
 */
public interface IRecompensaService {

    /**
     * Credits coins to a child profile for a validated food consumption.
     * Must be called within an active transaction to guarantee ACID behavior.
     *
     * @param registroConsumoId the ID of the consumption record to reward
     * @return Result.Success with the created transaction, or Result.Error if already processed
     */
    Result<DatosRespuestaRecompensa> acreditar(Long registroConsumoId);
}
