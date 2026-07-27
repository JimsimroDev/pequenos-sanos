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
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosRespuestaRecompensa;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosSaldoRecompensa;

import java.util.List;

/**
 * OpenAPI documentation for reward history and balance endpoints.
 */
@Tag(name = "Recompensas", description = "Historial de monedas y saldo por perfil infantil")
public interface RecompensaResource {

        @Operation(summary = "Historial de recompensas de un perfil", description = "Retorna las transacciones de monedas del perfil ordenadas por más reciente. Solo permitido si el perfil pertenece al padre autenticado.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Historial de transacciones", content = @Content(schema = @Schema(implementation = DatosRespuestaRecompensa.class))),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
                        @ApiResponse(responseCode = "403", description = "El perfil no pertenece al padre autenticado")
        })
        @GetMapping("/perfil/{perfilId}")
        ResponseEntity<List<DatosRespuestaRecompensa>> historial(
                        @Parameter(in = ParameterIn.PATH, name = "perfilId", example = "1") @PathVariable Long perfilId,
                        @AuthenticationPrincipal Usuario usuario);

        @Operation(summary = "Saldo de monedas de un perfil", description = "Retorna el saldo actual de monedas del perfil. Solo permitido si pertenece al padre autenticado.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Saldo actual", content = @Content(schema = @Schema(implementation = DatosSaldoRecompensa.class))),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
                        @ApiResponse(responseCode = "403", description = "El perfil no pertenece al padre autenticado")
        })
        @GetMapping("/perfil/{perfilId}/saldo")
        ResponseEntity<DatosSaldoRecompensa> saldo(
                        @Parameter(in = ParameterIn.PATH, name = "perfilId", example = "1") @PathVariable Long perfilId,
                        @AuthenticationPrincipal Usuario usuario);
}
