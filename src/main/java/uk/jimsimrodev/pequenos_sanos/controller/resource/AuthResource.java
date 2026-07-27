package uk.jimsimrodev.pequenos_sanos.controller.resource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.DatosJWTToken;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.DatosLoginUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.DatosRegistroUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.DatosRespuestaUsuario;

/**
 * OpenAPI documentation for authentication endpoints.
 */
@Tag(name = "Autenticación", description = "Endpoints de registro y login de usuarios")
public interface AuthResource {

    @Operation(
            summary = "Registrar nuevo usuario",
            description = "Crea una cuenta de padre/tutor con email único y contraseña hasheada con BCrypt."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente",
                    content = @Content(schema = @Schema(implementation = DatosRespuestaUsuario.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o faltantes"),
            @ApiResponse(responseCode = "409", description = "El email ya está registrado")
    })
    @PostMapping("/registro")
    ResponseEntity<DatosRespuestaUsuario> registrar(
            @RequestBody @Valid DatosRegistroUsuario datos);

    @Operation(
            summary = "Iniciar sesión",
            description = "Autentica al usuario con email y contraseña, retorna un token JWT válido por 2 horas."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Autenticación exitosa, token JWT generado",
                    content = @Content(schema = @Schema(implementation = DatosJWTToken.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas")
    })
    @PostMapping("/login")
    ResponseEntity<DatosJWTToken> login(
            @RequestBody @Valid DatosLoginUsuario datos);
}
