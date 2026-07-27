package uk.jimsimrodev.pequenos_sanos.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO with public user information (excludes password and sensitive data).
 *
 * @param id     the user's unique identifier
 * @param nombre the user's full name
 * @param email  the user's email address
 */
@Schema(description = "Datos públicos del usuario registrado")
public record DatosRespuestaUsuario(

        @Schema(description = "ID único del usuario", example = "1")
        Long id,

        @Schema(description = "Nombre completo del usuario", example = "Juan Perez")
        String nombre,

        @Schema(description = "Correo electrónico del usuario", example = "juan@example.com")
        String email
) {
}
