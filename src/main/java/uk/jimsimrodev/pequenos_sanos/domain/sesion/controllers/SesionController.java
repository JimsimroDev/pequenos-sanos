package uk.jimsimrodev.pequenos_sanos.domain.sesion.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.controllers.resource.SesionResource;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.dto.DatosRespuestaSesion;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;

import java.time.LocalDate;

/**
 * Thin REST controller for game session status queries.
 * Delegates all Swagger documentation to {@link SesionResource}.
 */
@RestController
@RequestMapping("/api/v1/sesiones")
public class SesionController implements SesionResource {

        private final ISesionJuegoRepository sesionRepository;
        private final IPerfilInfantilRepository perfilRepository;

        /**
         * Creates the controller with required repositories.
         *
         * @param sesionRepository game session repository
         * @param perfilRepository child profile repository
         */
        public SesionController(ISesionJuegoRepository sesionRepository,
                        IPerfilInfantilRepository perfilRepository) {
                this.sesionRepository = sesionRepository;
                this.perfilRepository = perfilRepository;
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
}
