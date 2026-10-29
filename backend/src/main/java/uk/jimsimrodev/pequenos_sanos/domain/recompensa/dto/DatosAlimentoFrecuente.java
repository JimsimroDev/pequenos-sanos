package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO with the number of times a profile consumed a food item.
 *
 * @param alimento the food name
 * @param veces    how many times the food was consumed
 */
@Schema(description = "Alimento frecuente con su conteo de consumo")
public record DatosAlimentoFrecuente(

        @Schema(description = "Nombre del alimento", example = "Brócoli")
        String alimento,

        @Schema(description = "Veces consumido", example = "8")
        Long veces
) {
}
