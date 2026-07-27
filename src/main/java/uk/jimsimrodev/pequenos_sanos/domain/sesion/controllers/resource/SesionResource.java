package uk.jimsimrodev.pequenos_sanos.domain.sesion.controllers.resource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.dto.DatosRespuestaSesion;

/**
 * OpenAPI documentation for game session status endpoints.
 */
@Tag(name = "Sesiones de Juego", description = "Estado de la sesión de juego diaria del perfil")
public interface SesionResource {

    @Operation(
            summary = "Estado de sesión de hoy",
            description = "Retorna los minutos jugados, el límite diario y los minutos restantes para el perfil hoy."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado de la sesión",
                    content = @Content(schema = @Schema(implementation = DatosRespuestaSesion.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @GetMapping("/perfil/{perfilId}/hoy")
    ResponseEntity<DatosRespuestaSesion> sesionDeHoy(
            @Parameter(in = ParameterIn.PATH, name = "perfilId",
                    description = "ID del perfil infantil", example = "1")
            @PathVariable Long perfilId);
}
