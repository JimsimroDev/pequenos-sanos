package uk.jimsimrodev.pequenos_sanos.domain.sesion.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO with game session status for a child profile.
 *
 * @param id                session unique identifier
 * @param perfilId          the child profile ID
 * @param minutosJugados    minutes played in the current/last session
 * @param limitMinutos      the daily screen time limit for this profile
 * @param minutosRestantes  remaining minutes available today
 * @param estado            session state: ACTIVA, CERRADA, SIN_SESION
 */
@Schema(description = "Estado de la sesión de juego del día")
public record DatosRespuestaSesion(

        @Schema(description = "ID de la sesión (null si no hay sesión hoy)", example = "1")
        Long id,

        @Schema(description = "ID del perfil", example = "1")
        Long perfilId,

        @Schema(description = "Minutos jugados hoy", example = "15")
        Short minutosJugados,

        @Schema(description = "Límite diario en minutos", example = "30")
        Short limitMinutos,

        @Schema(description = "Minutos restantes disponibles", example = "15")
        Short minutosRestantes,

        @Schema(description = "Estado: ACTIVA, CERRADA o SIN_SESION", example = "ACTIVA")
        String estado
) {
}
