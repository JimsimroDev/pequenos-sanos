package uk.jimsimrodev.pequenos_sanos.domain.consumo.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.repositories.IAlimentoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRespuestaConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.model.RegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.services.IConsumoService;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.services.IRecompensaService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import java.time.LocalDate;
import java.util.List;

/**
 * Implementation of food consumption registration with integrated reward accrual.
 * The entire flow (validate → persist → reward) runs in a single ACID transaction.
 */
@Service
public class ConsumoServiceImpl implements IConsumoService {

    private final IRegistroConsumoRepository consumoRepository;
    private final IAlimentoRepository alimentoRepository;
    private final IPerfilInfantilRepository perfilRepository;
    private final IRecompensaService recompensaService;

    /**
     * Creates the service with required dependencies.
     *
     * @param consumoRepository  consumption record repository
     * @param alimentoRepository food item repository
     * @param perfilRepository   child profile repository
     * @param recompensaService  reward accrual service
     */
    public ConsumoServiceImpl(IRegistroConsumoRepository consumoRepository,
                               IAlimentoRepository alimentoRepository,
                               IPerfilInfantilRepository perfilRepository,
                               IRecompensaService recompensaService) {
        this.consumoRepository = consumoRepository;
        this.alimentoRepository = alimentoRepository;
        this.perfilRepository = perfilRepository;
        this.recompensaService = recompensaService;
    }

    @Override
    @Transactional
    public Result<DatosRespuestaConsumo> registrar(DatosRegistroConsumo datos, Long usuarioId) {
        // Validate alimento exists
        final var alimentoOpt = alimentoRepository.findById(datos.alimentoId());
        if (alimentoOpt.isEmpty() || !alimentoOpt.get().getActivo()) {
            return Result.error(CodigosError.ALIMENTO_NO_ENCONTRADO,
                    "El alimento no existe en el catálogo");
        }

        // Validate perfil belongs to authenticated parent
        final var perfilOpt = perfilRepository.findByIdAndActivoTrue(datos.perfilId());
        if (perfilOpt.isEmpty()
                || !perfilOpt.get().getUsuario().getId().equals(usuarioId)) {
            return Result.error(CodigosError.PERFIL_NO_ENCONTRADO,
                    "El perfil no existe o no pertenece al usuario autenticado");
        }

        final var alimento = alimentoOpt.get();
        final var perfil = perfilOpt.get();

        // Prevent daily duplicate
        if (consumoRepository.existsByPerfilIdAndAlimentoIdAndFechaConsumo(
                perfil.getId(), alimento.getId(), LocalDate.now())) {
            return Result.error(CodigosError.CONSUMO_DUPLICADO,
                    "Este alimento ya fue registrado hoy para este perfil");
        }

        // Persist the consumption record
        final var registro = new RegistroConsumo(perfil, alimento, perfil.getUsuario());
        final var savedRegistro = consumoRepository.save(registro);

        // Accredit reward within the same transaction
        recompensaService.acreditar(savedRegistro.getId());

        final var response = new DatosRespuestaConsumo(
                savedRegistro.getId(),
                alimento.getNombre(),
                savedRegistro.getFechaConsumo(),
                alimento.getPuntosReward(),
                false
        );

        return Result.success(response);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DatosRespuestaConsumo> listarPorPerfil(Long perfilId) {
        return consumoRepository.findByPerfilIdOrderByCreatedAtDesc(perfilId)
                .stream()
                .map(r -> new DatosRespuestaConsumo(
                        r.getId(),
                        r.getAlimento().getNombre(),
                        r.getFechaConsumo(),
                        r.getAlimento().getPuntosReward(),
                        r.getProcesado()
                ))
                .toList();
    }
}
