package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Response DTO with the aggregate report of all the authenticated parent's
 * active child profiles in a single call.
 *
 * @param perfiles aggregate metrics and history for each active profile
 */
@Schema(description = "Dashboard de reportes de todos los perfiles del padre autenticado")
public record DatosReporteDashboard(

        @Schema(description = "Métricas e historial de cada perfil activo del padre")
        List<DatosReportePerfil> perfiles
) {
}
