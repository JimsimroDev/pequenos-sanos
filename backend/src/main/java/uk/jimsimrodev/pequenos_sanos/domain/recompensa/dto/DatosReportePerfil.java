package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Response DTO with aggregate metrics and history for a single child profile.
 *
 * @param perfilId               the child profile's ID
 * @param nombrePerfil           the child's display name
 * @param edadAnios              the child's age in years
 * @param avatarCodigo           the selected avatar code
 * @param saldoTotal             current total coin balance
 * @param monedasGanadasHoy      coins earned today
 * @param alimentosDelDia        foods consumed today
 * @param sesionHoy              today's session status
 * @param sesionesExtraHoy       extra sessions granted for today
 * @param sesionesExtraCompradas total extra sessions purchased
 * @param monedasTotalesGanadas  total coins earned across all history
 * @param diasActivos            number of distinct days with sessions or consumptions
 * @param historialMonedas       coins earned per day, most recent first
 * @param historialSesiones      minutes played per session day, most recent first
 * @param alimentosFrecuentes    most consumed foods, top 5 by count descending
 */
@Schema(description = "Métricas e historial de un perfil infantil en el dashboard")
public record DatosReportePerfil(

        @Schema(description = "ID del perfil", example = "1")
        Long perfilId,

        @Schema(description = "Nombre del perfil", example = "Lucía")
        String nombrePerfil,

        @Schema(description = "Edad del niño en años", example = "7")
        Short edadAnios,

        @Schema(description = "Código del avatar asignado", example = "EXPLORER")
        String avatarCodigo,

        @Schema(description = "Saldo total de monedas", example = "150")
        Integer saldoTotal,

        @Schema(description = "Monedas ganadas hoy", example = "30")
        Integer monedasGanadasHoy,

        @Schema(description = "Alimentos consumidos hoy")
        List<String> alimentosDelDia,

        @Schema(description = "Estado de la sesión de juego del día")
        DatosSesionHoy sesionHoy,

        @Schema(description = "Sesiones extra disponibles hoy", example = "1")
        Short sesionesExtraHoy,

        @Schema(description = "Sesiones extra compradas (total acumulado)", example = "2")
        Short sesionesExtraCompradas,

        @Schema(description = "Monedas totales ganadas en todo el historial", example = "820")
        Integer monedasTotalesGanadas,

        @Schema(description = "Cantidad de días distintos con sesiones o consumos", example = "12")
        Long diasActivos,

        @Schema(description = "Monedas ganadas por día (más reciente primero)")
        List<DatosMonedasPorDia> historialMonedas,

        @Schema(description = "Minutos jugados por día (más reciente primero)")
        List<DatosSesionPorDia> historialSesiones,

        @Schema(description = "Alimentos más consumidos, top 5 por frecuencia")
        List<DatosAlimentoFrecuente> alimentosFrecuentes
) {
}
