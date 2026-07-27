package uk.jimsimrodev.pequenos_sanos.domain.recompensa.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosResumenDiario;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;

import java.time.LocalDate;

/**
 * REST controller providing daily summary reports for child profiles.
 * All endpoints validate that the profile belongs to the authenticated parent.
 */
@RestController
@RequestMapping("/api/v1/reportes")
@Tag(name = "Reportes", description = "Resúmenes diarios de actividad nutricional")
public class ReporteController {

    private final IPerfilInfantilRepository perfilRepository;
    private final IRegistroConsumoRepository consumoRepository;
    private final ITransaccionRecompensaRepository recompensaRepository;

    /**
     * Creates the controller with required repositories.
     *
     * @param perfilRepository     child profile repository
     * @param consumoRepository    consumption record repository
     * @param recompensaRepository reward transaction repository
     */
    public ReporteController(IPerfilInfantilRepository perfilRepository,
                              IRegistroConsumoRepository consumoRepository,
                              ITransaccionRecompensaRepository recompensaRepository) {
        this.perfilRepository = perfilRepository;
        this.consumoRepository = consumoRepository;
        this.recompensaRepository = recompensaRepository;
    }

    /**
     * Returns a daily summary for a child profile: foods consumed today, coins earned, total balance.
     *
     * @param perfilId the child profile ID
     * @param usuario  the authenticated parent
     * @return 200 with the daily summary, 403 if not owner, 404 if profile not found
     */
    @Operation(
            summary = "Resumen diario del perfil",
            description = "Retorna los alimentos consumidos hoy, monedas ganadas hoy y saldo total. Solo para el padre autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resumen diario"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "403", description = "El perfil no pertenece al padre autenticado"),
            @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @GetMapping("/perfil/{perfilId}/resumen")
    public ResponseEntity<DatosResumenDiario> resumenDiario(
            @Parameter(in = ParameterIn.PATH, name = "perfilId", description = "ID del perfil", example = "1")
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

        // Foods consumed today
        final var hoy = LocalDate.now();
        final var alimentosHoy = consumoRepository
                .findByPerfilIdOrderByCreatedAtDesc(perfilId)
                .stream()
                .filter(r -> r.getFechaConsumo().equals(hoy))
                .map(r -> r.getAlimento().getNombre())
                .toList();

        // Coins earned today
        final var monedasHoy = recompensaRepository
                .findByPerfilIdOrderByCreatedAtDesc(perfilId)
                .stream()
                .filter(t -> t.getCreatedAt().toLocalDate().equals(hoy))
                .mapToInt(t -> t.getMonedasAcreditadas())
                .sum();

        final var resumen = new DatosResumenDiario(
                perfil.getId(),
                perfil.getNombre(),
                alimentosHoy,
                monedasHoy,
                perfil.getMonedasSaldo()
        );

        return ResponseEntity.ok(resumen);
    }
}
