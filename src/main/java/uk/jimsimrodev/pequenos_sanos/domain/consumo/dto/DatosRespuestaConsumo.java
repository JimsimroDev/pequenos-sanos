package uk.jimsimrodev.pequenos_sanos.domain.consumo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

/**
 * Response DTO for a consumption record.
 *
 * @param id            the record's unique identifier
 * @param nombreAlimento the name of the consumed food
 * @param fechaConsumo  the date when the food was consumed
 * @param puntosReward  the reward points credited for this consumption
 * @param procesado     whether the reward has been credited
 */
@Schema(description = "Datos del registro de consumo de alimento")
public record DatosRespuestaConsumo(

        @Schema(description = "ID del registro", example = "1")
        Long id,

        @Schema(description = "Nombre del alimento consumido", example = "Brócoli")
        String nombreAlimento,

        @Schema(description = "Fecha de consumo", example = "2025-01-15")
        LocalDate fechaConsumo,

        @Schema(description = "Puntos de recompensa acreditados", example = "15")
        Short puntosReward,

        @Schema(description = "Indica si la recompensa fue procesada", example = "true")
        Boolean procesado
) {
}
