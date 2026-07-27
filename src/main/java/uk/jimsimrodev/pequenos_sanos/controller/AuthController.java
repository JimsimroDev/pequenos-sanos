package uk.jimsimrodev.pequenos_sanos.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.controller.resource.AuthResource;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosJWTToken;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosLoginUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosRegistroUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosRespuestaUsuario;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.service.IAuthService;

/**
 * Thin REST controller for authentication endpoints.
 * Delegates all business logic to {@link IAuthService}.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController implements AuthResource {

    private final IAuthService authService;

    /**
     * Creates the AuthController with the auth service.
     *
     * @param authService authentication service contract
     */
    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

    @Override
    public ResponseEntity<DatosRespuestaUsuario> registrar(
            @RequestBody @Valid DatosRegistroUsuario datos) {

        final var result = authService.registrar(datos);

        if (result instanceof Result.Success<DatosRespuestaUsuario> success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(success.value());
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @Override
    public ResponseEntity<DatosJWTToken> login(
            @RequestBody @Valid DatosLoginUsuario datos) {

        final var result = authService.login(datos);

        if (result instanceof Result.Success<DatosJWTToken> success) {
            return ResponseEntity.ok(success.value());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
