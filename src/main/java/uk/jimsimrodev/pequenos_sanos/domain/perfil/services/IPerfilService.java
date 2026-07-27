package uk.jimsimrodev.pequenos_sanos.domain.perfil.services;

import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosActualizacionPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRegistroPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRespuestaPerfil;
import uk.jimsimrodev.pequenos_sanos.infra.Result;

import java.util.List;

/**
 * Service contract for child profile management (CRUD operations).
 */
public interface IPerfilService {

    /**
     * Creates a new child profile linked to the authenticated parent.
     *
     * @param datos     registration data
     * @param usuarioId the authenticated parent's user ID
     * @return Result.Success with the created profile, or Result.Error if validation fails
     */
    Result<DatosRespuestaPerfil> crear(DatosRegistroPerfil datos, Long usuarioId);

    /**
     * Lists all active child profiles for the authenticated parent.
     *
     * @param usuarioId the authenticated parent's user ID
     * @return list of active profiles for this parent
     */
    List<DatosRespuestaPerfil> listar(Long usuarioId);

    /**
     * Updates a child profile. Only allowed if the profile belongs to the parent.
     *
     * @param perfilId  the ID of the profile to update
     * @param datos     fields to update (nulls are ignored)
     * @param usuarioId the authenticated parent's user ID
     * @return Result.Success with updated data, or Result.Error if not found / not owner
     */
    Result<DatosRespuestaPerfil> actualizar(Long perfilId, DatosActualizacionPerfil datos, Long usuarioId);

    /**
     * Soft-deletes (deactivates) a child profile. Only allowed if the profile belongs to the parent.
     *
     * @param perfilId  the ID of the profile to deactivate
     * @param usuarioId the authenticated parent's user ID
     * @return Result.Success with no payload, or Result.Error if not found / not owner
     */
    Result<Void> desactivar(Long perfilId, Long usuarioId);
}
