package uk.jimsimrodev.pequenos_sanos.domain.recompensa.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.controllers.resource.ReporteResource;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosReporteDashboard;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosResumenDiario;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.services.ReporteService;

import java.time.LocalDate;

/**
 * Thin REST controller providing daily summary reports for child profiles.
 * Delegates all Swagger documentation to {@link ReporteResource}.
 */
@RestController
@RequestMapping("/api/v1/reportes")
public class ReporteController implements ReporteResource {

        private final IPerfilInfantilRepository perfilRepository;
        private final IRegistroConsumoRepository consumoRepository;
        private final ITransaccionRecompensaRepository recompensaRepository;
        private final ReporteService reporteService;

        /**
         * Creates the controller with required repositories.
         *
         * @param perfilRepository     child profile repository
         * @param consumoRepository    consumption record repository
         * @param recompensaRepository reward transaction repository
         * @param reporteService       aggregate dashboard report service
         */
        public ReporteController(IPerfilInfantilRepository perfilRepository,
                        IRegistroConsumoRepository consumoRepository,
                        ITransaccionRecompensaRepository recompensaRepository,
                        ReporteService reporteService) {
                this.perfilRepository = perfilRepository;
                this.consumoRepository = consumoRepository;
                this.recompensaRepository = recompensaRepository;
                this.reporteService = reporteService;
        }

        @Override
        public ResponseEntity<DatosReporteDashboard> dashboard(
                        @AuthenticationPrincipal Usuario usuario) {

                return ResponseEntity.ok(reporteService.obtenerDashboardDelPadre(usuario.getId()));
        }

        @Override
        public ResponseEntity<DatosResumenDiario> resumenDiario(
                        @PathVariable Long perfilId,
                        @AuthenticationPrincipal Usuario usuario) {

                final var perfilOpt = perfilRepository.findByIdAndActivoTrue(perfilId);
                if (perfilOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                final var perfil = perfilOpt.get();
                if (!perfil.getUsuario().getId().equals(usuario.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                final var hoy = LocalDate.now();

                final var alimentosHoy = consumoRepository
                                .findByPerfilIdOrderByCreatedAtDesc(perfilId)
                                .stream()
                                .filter(r -> r.getFechaConsumo().equals(hoy))
                                .map(r -> r.getAlimento().getNombre())
                                .toList();

                final var monedasHoy = recompensaRepository
                                .findByPerfilIdOrderByCreatedAtDesc(perfilId)
                                .stream()
                                .filter(t -> t.getCreatedAt().toLocalDate().equals(hoy))
                                .mapToInt(t -> t.getMonedasAcreditadas())
                                .sum();

                return ResponseEntity.ok(new DatosResumenDiario(
                                perfil.getId(),
                                perfil.getNombre(),
                                alimentosHoy,
                                monedasHoy,
                                perfil.getMonedasSaldo()));
        }
}
