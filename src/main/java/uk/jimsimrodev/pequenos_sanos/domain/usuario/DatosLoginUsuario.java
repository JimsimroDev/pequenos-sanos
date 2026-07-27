package uk.jimsimrodev.pequenos_sanos.domain.usuario;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for user authentication (login).
 *
 * @param email    registered email address
 * @param password plain text password
 */
@Schema(description = "Datos requeridos para iniciar sesión")
public record DatosLoginUsuario(

        @Schema(description = "Correo electrónico registrado", example = "juan@example.com")
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email debe tener un formato válido")
        String email,

        @Schema(description = "Contraseña del usuario", example = "miPassword123")
        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
