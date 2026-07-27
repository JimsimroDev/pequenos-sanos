package uk.jimsimrodev.pequenos_sanos.domain.perfil.controllers.resource;

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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosActualizacionPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRegistroPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRespuestaPerfil;

import java.util.List;

/**
 * OpenAPI documentation for child profile management endpoints.
 */
@Tag(name = "Perfiles Infantiles", description = "Gestión de perfiles infantiles del padre autenticado")
public interface PerfilResource {

        @Operation(summary = "Crear perfil infantil", description = "Crea un nuevo perfil infantil vinculado al padre autenticado.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Perfil creado exitosamente", content = @Content(schema = @Schema(implementation = DatosRespuestaPerfil.class))),
                        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
                        @ApiResponse(responseCode = "422", description = "Error de negocio: límite de tiempo inválido")
        })
        @PostMapping
        ResponseEntity<DatosRespuestaPerfil> crear(
                        @RequestBody @Valid DatosRegistroPerfil datos,
                        @AuthenticationPrincipal Usuario usuario);

        @Operation(summary = "Listar perfiles del padre autenticado", description = "Retorna todos los perfiles activos vinculados al padre autenticado.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista de perfiles activos"),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido")
        })
        @GetMapping
        ResponseEntity<List<DatosRespuestaPerfil>> listar(
                        @AuthenticationPrincipal Usuario usuario);

        @Operation(summary = "Actualizar perfil infantil", description = "Actualiza campos de un perfil. Solo permitido si el perfil pertenece al padre autenticado.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Perfil actualizado", content = @Content(schema = @Schema(implementation = DatosRespuestaPerfil.class))),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
                        @ApiResponse(responseCode = "403", description = "El perfil no pertenece al padre autenticado"),
                        @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
        })
        @PutMapping("/{id}")
        ResponseEntity<DatosRespuestaPerfil> actualizar(
                        @Parameter(in = ParameterIn.PATH, name = "id", description = "ID del perfil", example = "1") @PathVariable Long id,
                        @RequestBody @Valid DatosActualizacionPerfil datos,
                        @AuthenticationPrincipal Usuario usuario);

        @Operation(summary = "Desactivar perfil infantil", description = "Realiza un borrado lógico del perfil. Solo permitido si pertenece al padre autenticado.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Perfil desactivado"),
                        @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
                        @ApiResponse(responseCode = "403", description = "El perfil no pertenece al padre autenticado"),
                        @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
        })
        @DeleteMapping("/{id}")
        ResponseEntity<Void> desactivar(
                        @Parameter(in = ParameterIn.PATH, name = "id", description = "ID del perfil", example = "1") @PathVariable Long id,
                        @AuthenticationPrincipal Usuario usuario);
}
