package uk.jimsimrodev.pequenos_sanos.domain.consumo.controllers.resource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRespuestaConsumo;

import java.util.List;

/**
 * OpenAPI documentation for food consumption registration endpoints.
 */
@Tag(name = "Consumo", description = "Registro y consulta de consumo de alimentos")
public interface ConsumoResource {

        @Operation(summary = "Registrar consumo de alimento", description = "Valida el alimento y perfil, persiste el registro y acredita la recompensa en una sola transacción.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Consumo registrado y recompensa acreditada", content = @Content(schema = @Schema(implementation = DatosRespuestaConsumo.class))),
                        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
                        @ApiResponse(responseCode = "422", description = "Error de negocio: alimento no encontrado, perfil no pertenece al padre, o consumo duplicado")
        })
        @PostMapping
        @PreAuthorize("hasRole('PADRE')")
        ResponseEntity<DatosRespuestaConsumo> registrar(
                        @RequestBody @Valid DatosRegistroConsumo datos,
                        @AuthenticationPrincipal Usuario usuario);

        @Operation(summary = "Historial de consumo de un perfil", description = "Retorna todos los registros de consumo de un perfil, ordenados por más reciente primero.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Historial de consumo"),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido")
        })
        @GetMapping("/perfil/{perfilId}")
        @PreAuthorize("hasRole('PADRE')")
        ResponseEntity<List<DatosRespuestaConsumo>> listarPorPerfil(
                        @Parameter(in = ParameterIn.PATH, name = "perfilId", description = "ID del perfil infantil", example = "1") @PathVariable Long perfilId);
}
