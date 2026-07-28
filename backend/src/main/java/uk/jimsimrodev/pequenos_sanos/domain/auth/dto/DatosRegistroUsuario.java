package uk.jimsimrodev.pequenos_sanos.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for user registration.
 *
 * @param nombre   full name of the parent/tutor
 * @param email    unique email address
 * @param password plain text password (will be hashed with BCrypt)
 */
@Schema(description = "Datos requeridos para registrar un nuevo usuario padre/tutor")
public record DatosRegistroUsuario(

        @Schema(description = "Nombre completo del padre o tutor", example = "Juan Perez")
        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String nombre,

        @Schema(description = "Correo electrónico único del usuario", example = "juan@example.com")
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email debe tener un formato válido")
        String email,

        @Schema(description = "Contraseña del usuario (mínimo 6 caracteres)", example = "miPassword123")
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
        String password
) {
}
