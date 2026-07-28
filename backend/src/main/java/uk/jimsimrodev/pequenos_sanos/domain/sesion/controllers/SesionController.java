package uk.jimsimrodev.pequenos_sanos.domain.sesion.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.controllers.resource.SesionResource;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.dto.DatosRespuestaSesion;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.services.ISesionService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;

import java.time.LocalDate;

/**
 * Thin REST controller for game session management.
 * Delegates all Swagger documentation to {@link SesionResource}.
 */
@RestController
@RequestMapping("/api/v1/sesiones")
public class SesionController implements SesionResource {

    private final ISesionJuegoRepository sesionRepository;
    private final IPerfilInfantilRepository perfilRepository;
    private final ISesionService sesionService;

    /**
     * Creates the controller with required dependencies.
     *
     * @param sesionRepository game session repository (for GET status query)
     * @param perfilRepository child profile repository (for GET status query)
     * @param sesionService    session service (for POST iniciar)
     */
    public SesionController(ISesionJuegoRepository sesionRepository,
                             IPerfilInfantilRepository perfilRepository,
                             ISesionService sesionService) {
        this.sesionRepository = sesionRepository;
        this.perfilRepository = perfilRepository;
        this.sesionService = sesionService;
    }

    @Override
    public ResponseEntity<DatosRespuestaSesion> sesionDeHoy(@PathVariable Long perfilId) {
        return perfilRepository.findByIdAndActivoTrue(perfilId)
                .map(perfil -> {
                    final var sesionOpt = sesionRepository
                            .findByPerfilIdAndFechaSesion(perfilId, LocalDate.now());

                    final short jugados = sesionOpt
                            .map(s -> s.getMinutosJugados()).orElse((short) 0);
                    final short limite = perfil.getScreenTimeLimit();
                    final short restantes = (short) Math.max(0, limite - jugados);
                    final String estado = sesionOpt
                            .map(s -> s.getFin() == null ? "ACTIVA" : "CERRADA")
                            .orElse("SIN_SESION");

                    return ResponseEntity.ok(new DatosRespuestaSesion(
                            sesionOpt.map(s -> s.getId()).orElse(null),
                            perfil.getId(),
                            jugados,
                            limite,
                            restantes,
                            estado));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<DatosRespuestaSesion> iniciar(Long perfilId) {
        final var result = sesionService.iniciar(perfilId);

        if (result instanceof Result.Success<DatosRespuestaSesion> success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(success.value());
        }

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();
    }
}
