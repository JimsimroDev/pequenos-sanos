package uk.jimsimrodev.pequenos_sanos.domain.recompensa.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.controllers.resource.RecompensaResource;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosRespuestaRecompensa;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosSaldoRecompensa;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;

import java.util.List;

/**
 * Thin REST controller for reward history and balance endpoints.
 * Validates profile ownership before returning data.
 */
@RestController
@RequestMapping("/api/v1/recompensas")
public class RecompensaController implements RecompensaResource {

    private final ITransaccionRecompensaRepository recompensaRepository;
    private final IPerfilInfantilRepository perfilRepository;

    /**
     * Creates the controller with required repositories.
     *
     * @param recompensaRepository reward transaction repository
     * @param perfilRepository     child profile repository
     */
    public RecompensaController(ITransaccionRecompensaRepository recompensaRepository,
                                 IPerfilInfantilRepository perfilRepository) {
        this.recompensaRepository = recompensaRepository;
        this.perfilRepository = perfilRepository;
    }

    @Override
    public ResponseEntity<List<DatosRespuestaRecompensa>> historial(
            @PathVariable Long perfilId,
            @AuthenticationPrincipal Usuario usuario) {

        if (!isOwner(perfilId, usuario.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        final var historial = recompensaRepository
                .findByPerfilIdOrderByCreatedAtDesc(perfilId)
                .stream()
                .map(t -> new DatosRespuestaRecompensa(
                        t.getId(),
                        t.getMonedasAcreditadas(),
                        t.getTipo(),
                        t.getCreatedAt(),
                        t.getRegistroConsumo().getAlimento().getNombre()
                ))
                .toList();

        return ResponseEntity.ok(historial);
    }

    @Override
    public ResponseEntity<DatosSaldoRecompensa> saldo(
            @PathVariable Long perfilId,
            @AuthenticationPrincipal Usuario usuario) {

        if (!isOwner(perfilId, usuario.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return perfilRepository.findByIdAndActivoTrue(perfilId)
                .map(p -> ResponseEntity.ok(
                        new DatosSaldoRecompensa(p.getId(), p.getNombre(), p.getMonedasSaldo())))
                .orElse(ResponseEntity.notFound().build());
    }

    private boolean isOwner(Long perfilId, Long usuarioId) {
        return perfilRepository.findByIdAndActivoTrue(perfilId)
                .map(p -> p.getUsuario().getId().equals(usuarioId))
                .orElse(false);
    }
}
