package uk.jimsimrodev.pequenos_sanos.domain.consumo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for registering a food consumption record.
 *
 * @param perfilId   the ID of the child profile that consumed the food
 * @param alimentoId the ID of the food item consumed
 */
@Schema(description = "Datos para registrar el consumo de un alimento por un perfil infantil")
public record DatosRegistroConsumo(

        @Schema(description = "ID del perfil infantil que consumió el alimento", example = "1")
        @NotNull(message = "El perfil es obligatorio")
        Long perfilId,

        @Schema(description = "ID del alimento consumido", example = "3")
        @NotNull(message = "El alimento es obligatorio")
        Long alimentoId
) {
}
