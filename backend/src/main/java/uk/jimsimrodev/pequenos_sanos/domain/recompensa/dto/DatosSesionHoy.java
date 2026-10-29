package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO with today's game session status for a child profile.
 *
 * @param minutosJugados   minutes played today
 * @param limiteMinutos    the daily screen time limit for this profile
 * @param minutosRestantes remaining minutes available today
 * @param estado           session state: ACTIVA, CERRADA, SIN_SESION
 */
@Schema(description = "Estado de la sesión de juego del día en el dashboard")
public record DatosSesionHoy(

        @Schema(description = "Minutos jugados hoy", example = "25")
        Short minutosJugados,

        @Schema(description = "Límite diario de pantalla en minutos", example = "60")
        Short limiteMinutos,

        @Schema(description = "Minutos restantes disponibles", example = "35")
        Short minutosRestantes,

        @Schema(description = "Estado: ACTIVA, CERRADA o SIN_SESION", example = "ACTIVA")
        String estado
) {
}
