package uk.jimsimrodev.pequenos_sanos.domain.auth.services;

import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosJWTToken;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosLoginUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosRegistroUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosRespuestaUsuario;
import uk.jimsimrodev.pequenos_sanos.infra.Result;

/**
 * Service contract for authentication operations (registration and login).
 */
public interface IAuthService {

    /**
     * Registers a new parent/tutor user.
     *
     * @param datos registration data with name, email, and password
     * @return Result.Success with user data, or Result.Error if email already exists
     */
    Result<DatosRespuestaUsuario> registrar(DatosRegistroUsuario datos);

    /**
     * Authenticates a user and generates a JWT token.
     *
     * @param datos login data with email and password
     * @return Result.Success with JWT token, or Result.Error if credentials are invalid
     */
    Result<DatosJWTToken> login(DatosLoginUsuario datos);
}
