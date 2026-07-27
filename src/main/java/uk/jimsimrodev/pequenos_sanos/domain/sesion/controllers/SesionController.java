package uk.jimsimrodev.pequenos_sanos.domain.sesion.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.dto.DatosRespuestaSesion;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;

import java.time.LocalDate;

/**
 * REST controller for game session status queries.
 */
@RestController
@RequestMapping("/api/v1/sesiones")
@Tag(name = "Sesiones de Juego", description = "Estado de la sesión de juego diaria del perfil")
public class SesionController {

    private final ISesionJuegoRepository sesionRepository;
    private final IPerfilInfantilRepository perfilRepository;

    /**
     * Creates the controller with required repositories.
     *
     * @param sesionRepository  game session repository
     * @param perfilRepository  child profile repository
     */
    public SesionController(ISesionJuegoRepository sesionRepository,
                             IPerfilInfantilRepository perfilRepository) {
        this.sesionRepository = sesionRepository;
        this.perfilRepository = perfilRepository;
    }

    /**
     * Returns today's session status for a child profile.
     *
     * @param perfilId the child profile ID
     * @return 200 with session data, 404 if profile not found
     */
    @Operation(
            summary = "Estado de sesión de hoy",
            description = "Retorna los minutos jugados, el límite diario y los minutos restantes para el perfil hoy."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado de la sesión"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @GetMapping("/perfil/{perfilId}/hoy")
    public ResponseEntity<DatosRespuestaSesion> sesionDeHoy(
            @Parameter(in = ParameterIn.PATH, name = "perfilId", example = "1")
            @PathVariable Long perfilId) {

        return perfilRepository.findByIdAndActivoTrue(perfilId)
                .map(perfil -> {
                    final var sesionOpt = sesionRepository
                            .findByPerfilIdAndFechaSesion(perfilId, LocalDate.now());

                    final short jugados = sesionOpt.map(s -> s.getMinutosJugados()).orElse((short) 0);
                    final short limite = perfil.getScreenTimeLimit();
                    final short restantes = (short) Math.max(0, limite - jugados);
                    final String estado = sesionOpt.map(s ->
                            s.getFin() == null ? "ACTIVA" : "CERRADA"
                    ).orElse("SIN_SESION");

                    final var response = new DatosRespuestaSesion(
                            sesionOpt.map(s -> s.getId()).orElse(null),
                            perfil.getId(),
                            jugados,
                            limite,
                            restantes,
                            estado
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
