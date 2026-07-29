package uk.jimsimrodev.pequenos_sanos.domain.sesion.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.dto.DatosRespuestaSesion;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.model.SesionJuego;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.services.ISesionService;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.GameStateStore;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Implementation of game session lifecycle management.
 * Validates daily screen time limits and registers timers in the in-memory
 * engine. Supports extra sessions granted by the parent for additional play time.
 */
@Service
public class SesionServiceImpl implements ISesionService {

    private final IPerfilInfantilRepository perfilRepository;
    private final ISesionJuegoRepository sesionRepository;
    private final GameStateStore gameStateStore;

    /**
     * Creates the service with required dependencies.
     *
     * @param perfilRepository  child profile repository
     * @param sesionRepository  game session repository
     * @param gameStateStore    in-memory state store for timers
     */
    public SesionServiceImpl(IPerfilInfantilRepository perfilRepository,
                              ISesionJuegoRepository sesionRepository,
                              GameStateStore gameStateStore) {
        this.perfilRepository = perfilRepository;
        this.sesionRepository = sesionRepository;
        this.gameStateStore = gameStateStore;
    }

    @Override
    @Transactional
    public Result<DatosRespuestaSesion> iniciar(Long perfilId) {
        // Validate profile exists
        final var perfilOpt = perfilRepository.findByIdAndActivoTrue(perfilId);
        if (perfilOpt.isEmpty()) {
            return Result.error(CodigosError.PERFIL_NO_ENCONTRADO,
                    "Perfil no encontrado");
        }

        final var perfil = perfilOpt.get();
        final short limite = perfil.getScreenTimeLimit();
        final var hoy = LocalDate.now();

        // Check for existing session today
        final var sesionExistente = sesionRepository.findByPerfilIdAndFechaSesion(perfilId, hoy);

        if (sesionExistente.isPresent()) {
            final var sesion = sesionExistente.get();

            // If session is still open (active), return it so the client can resume
            if (sesion.getFin() == null) {
                final short jugados = sesion.getMinutosJugados();
                final short restantes = (short) Math.max(0, limite - jugados);
                gameStateStore.registerTimer(perfilId, restantes * 60);
                return Result.success(new DatosRespuestaSesion(
                        sesion.getId(), perfilId, jugados, limite, restantes, "ACTIVA"));
            }

            // Session is closed. Check if the child has remaining time (e.g. limit was increased).
            final short minutosJugados = sesion.getMinutosJugados();
            if (minutosJugados < limite) {
                // Limit was increased or there's unused time → reopen the existing session.
                return reabrirSesion(sesion, perfilId, limite, minutosJugados);
            }

            // Time is fully exhausted. Check for extra sessions granted by the parent.
            if (perfil.getSesionesExtraHoy() > 0) {
                // Consume one extra session and reopen with full screen_time_limit.
                perfil.setSesionesExtraHoy((short) (perfil.getSesionesExtraHoy() - 1));
                perfilRepository.save(perfil);
                return reabrirSesion(sesion, perfilId, limite, (short) 0);
            }

            // No time left and no extras → reject with premium teaser message.
            return Result.error(CodigosError.TIEMPO_AGOTADO,
                    "Este perfil ya agotó su tiempo de pantalla por hoy. " +
                    "Próximamente podrás comprar más tiempo de juego.");
        }

        // No session exists today → create one
        final var nuevaSesion = new SesionJuego(perfil);
        final var savedSesion = sesionRepository.save(nuevaSesion);

        final int segundosRestantes = limite * 60;
        gameStateStore.registerTimer(perfilId, segundosRestantes);

        final var response = new DatosRespuestaSesion(
                savedSesion.getId(),
                perfilId,
                (short) 0,
                limite,
                limite,
                "ACTIVA");

        return Result.success(response);
    }

    /**
     * Reopens a closed session instead of creating a new one (avoids UNIQUE constraint
     * violation on perfil_id + fecha_sesion). The timer is set to {@code limite - minutosYaJugados}.
     */
    private Result<DatosRespuestaSesion> reabrirSesion(SesionJuego sesion, Long perfilId,
                                                        short limite, short minutosYaJugados) {
        sesion.setFin(null);
        sesion.setInicio(LocalDateTime.now());
        sesion.setCerradaPor(null);
        sesionRepository.save(sesion);

        final short restantes = (short) Math.max(0, limite - minutosYaJugados);
        gameStateStore.registerTimer(perfilId, restantes * 60);

        return Result.success(new DatosRespuestaSesion(
                sesion.getId(), perfilId, minutosYaJugados, limite, restantes, "ACTIVA"));
    }
}
