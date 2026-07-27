package uk.jimsimrodev.pequenos_sanos.domain.perfil.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for partial update of a child profile.
 * All fields are optional — only non-null values are applied.
 *
 * @param nombre          new display name (optional)
 * @param avatarCodigo    new avatar code (optional)
 * @param screenTimeLimit new screen time limit in minutes 5–60 (optional)
 */
@Schema(description = "Datos opcionales para actualizar un perfil infantil")
public record DatosActualizacionPerfil(

        @Schema(description = "Nuevo nombre del perfil (opcional)", example = "Lucía M.")
        @Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
        String nombre,

        @Schema(description = "Nuevo código de avatar (opcional)", example = "AVATAR_03")
        String avatarCodigo,

        @Schema(description = "Nuevo límite diario en minutos (opcional, 5–60)", example = "45")
        @Min(value = 5, message = "El límite mínimo es 5 minutos")
        @Max(value = 60, message = "El límite máximo es 60 minutos")
        Short screenTimeLimit
) {
}
