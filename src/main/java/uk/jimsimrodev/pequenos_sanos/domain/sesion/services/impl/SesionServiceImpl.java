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

/**
 * Implementation of game session lifecycle management.
 * Validates daily screen time limits and registers timers in the in-memory engine.
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

            // If session is still open (active), reject
            if (sesion.getFin() == null) {
                return Result.error(CodigosError.SESION_ACTIVA,
                        "Ya existe una sesión activa para este perfil hoy");
            }

            // If session is closed and time was exhausted, reject
            if (sesion.getMinutosJugados() >= limite) {
                return Result.error(CodigosError.TIEMPO_AGOTADO,
                        "El perfil ha agotado su tiempo de pantalla para hoy");
            }
        }

        // Create new session
        final var nuevaSesion = new SesionJuego(perfil);
        final var savedSesion = sesionRepository.save(nuevaSesion);

        // Register timer in the in-memory engine
        final short minutosJugadosHoy = sesionExistente
                .map(SesionJuego::getMinutosJugados)
                .orElse((short) 0);
        final int segundosRestantes = (limite - minutosJugadosHoy) * 60;
        gameStateStore.registerTimer(perfilId, segundosRestantes);

        final short restantes = (short) (limite - minutosJugadosHoy);
        final var response = new DatosRespuestaSesion(
                savedSesion.getId(),
                perfilId,
                minutosJugadosHoy,
                limite,
                restantes,
                "ACTIVA"
        );

        return Result.success(response);
    }
}
