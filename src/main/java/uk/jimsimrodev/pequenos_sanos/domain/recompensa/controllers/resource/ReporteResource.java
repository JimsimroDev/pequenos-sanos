package uk.jimsimrodev.pequenos_sanos.domain.recompensa.controllers.resource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosResumenDiario;

/**
 * OpenAPI documentation for daily report endpoints.
 */
@Tag(name = "Reportes", description = "Resúmenes diarios de actividad nutricional")
public interface ReporteResource {

    @Operation(
            summary = "Resumen diario del perfil",
            description = "Retorna los alimentos consumidos hoy, monedas ganadas hoy y saldo total. Solo para el padre autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resumen diario",
                    content = @Content(schema = @Schema(implementation = DatosResumenDiario.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "403", description = "El perfil no pertenece al padre autenticado"),
            @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @GetMapping("/perfil/{perfilId}/resumen")
    ResponseEntity<DatosResumenDiario> resumenDiario(
            @Parameter(in = ParameterIn.PATH, name = "perfilId",
                    description = "ID del perfil", example = "1")
            @PathVariable Long perfilId,
            @AuthenticationPrincipal Usuario usuario);
}
