package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Response DTO with the daily summary for a child profile.
 *
 * @param perfilId          the child profile's ID
 * @param nombrePerfil      the child's display name
 * @param alimentosDelDia   list of foods consumed today
 * @param monedasGanadasHoy coins earned today
 * @param saldoTotal        total current coin balance
 */
@Schema(description = "Resumen diario del perfil infantil")
public record DatosResumenDiario(

        @Schema(description = "ID del perfil", example = "1")
        Long perfilId,

        @Schema(description = "Nombre del perfil", example = "Lucía")
        String nombrePerfil,

        @Schema(description = "Alimentos consumidos hoy")
        List<String> alimentosDelDia,

        @Schema(description = "Monedas ganadas hoy", example = "30")
        Integer monedasGanadasHoy,

        @Schema(description = "Saldo total de monedas", example = "150")
        Integer saldoTotal
) {
}
