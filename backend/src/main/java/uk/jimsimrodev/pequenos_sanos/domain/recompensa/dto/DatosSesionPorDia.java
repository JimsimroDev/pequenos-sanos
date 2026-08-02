package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

/**
 * Response DTO with the minutes a profile played on a given session date.
 *
 * @param fecha          the session date
 * @param minutosJugados minutes played that day
 */
@Schema(description = "Minutos jugados por día por un perfil")
public record DatosSesionPorDia(

        @Schema(description = "Fecha de la sesión", example = "2026-07-30")
        LocalDate fecha,

        @Schema(description = "Minutos jugados ese día", example = "25")
        Short minutosJugados
) {
}
