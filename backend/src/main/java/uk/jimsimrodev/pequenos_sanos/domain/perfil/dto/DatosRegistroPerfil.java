package uk.jimsimrodev.pequenos_sanos.domain.perfil.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new child profile.
 *
 * @param nombre          the child's display name
 * @param edadAnios       the child's age in years (2–4)
 * @param avatarCodigo    optional avatar code identifier
 * @param screenTimeLimit daily screen time limit in minutes (5–60)
 */
@Schema(description = "Datos requeridos para registrar un nuevo perfil infantil")
public record DatosRegistroPerfil(

        @Schema(description = "Nombre del perfil infantil", example = "Lucía")
        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
        String nombre,

        @Schema(description = "Edad del niño en años (2 a 4)", example = "3")
        @NotNull(message = "La edad es obligatoria")
        @Min(value = 2, message = "La edad mínima es 2 años")
        @Max(value = 4, message = "La edad máxima es 4 años")
        Short edadAnios,

        @Schema(description = "Código del avatar seleccionado (opcional)", example = "AVATAR_01")
        String avatarCodigo,

        @Schema(description = "Límite diario de tiempo de pantalla en minutos (5 a 60)", example = "30")
        @NotNull(message = "El límite de tiempo es obligatorio")
        @Min(value = 5, message = "El límite mínimo es 5 minutos")
        @Max(value = 60, message = "El límite máximo es 60 minutos")
        Short screenTimeLimit
) {
}
