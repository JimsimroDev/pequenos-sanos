package uk.jimsimrodev.pequenos_sanos.domain.alimento.controllers.resource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.dto.DatosRespuestaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;

import java.util.List;

/**
 * OpenAPI documentation for the nutritional food catalogue endpoints.
 */
@Tag(name = "Catálogo de Alimentos", description = "Consulta del catálogo de alimentos saludables")
public interface AlimentoResource {

        @Operation(summary = "Listar alimentos del catálogo", description = "Retorna todos los alimentos activos. Se puede filtrar opcionalmente por categoría.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista de alimentos", content = @Content(schema = @Schema(implementation = DatosRespuestaAlimento.class))),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido")
        })
        @GetMapping
        @PreAuthorize("hasAnyRole('PADRE', 'NINO')")
        ResponseEntity<List<DatosRespuestaAlimento>> listar(
                        @Parameter(description = "Filtrar por categoría (opcional)", example = "FRUTA") @RequestParam(required = false) CategoriaAlimento categoria);

        @Operation(summary = "Obtener alimento por ID", description = "Retorna el detalle de un alimento activo por su ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Alimento encontrado", content = @Content(schema = @Schema(implementation = DatosRespuestaAlimento.class))),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
                        @ApiResponse(responseCode = "404", description = "Alimento no encontrado")
        })
        @GetMapping("/{id}")
        @PreAuthorize("hasAnyRole('PADRE', 'NINO')")
        ResponseEntity<DatosRespuestaAlimento> buscarPorId(
                        @Parameter(in = ParameterIn.PATH, name = "id", description = "ID del alimento", example = "1") @PathVariable Long id);
}
