package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

/**
 * Response DTO with the total coins earned by a profile on a given date.
 *
 * @param fecha   the date of the earnings
 * @param monedas coins earned that day
 */
@Schema(description = "Monedas ganadas por día por un perfil")
public record DatosMonedasPorDia(

        @Schema(description = "Fecha del movimiento", example = "2026-07-30")
        LocalDate fecha,

        @Schema(description = "Monedas ganadas ese día", example = "30")
        Integer monedas
) {
}
