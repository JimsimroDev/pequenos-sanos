package uk.jimsimrodev.pequenos_sanos.domain.recompensa.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosRespuestaRecompensa;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.model.TransaccionRecompensa;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.services.IRecompensaService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

/**
 * Implementation of reward accrual logic.
 * Must execute within the caller's transaction to ensure ACID guarantees.
 */
@Service
public class RecompensaServiceImpl implements IRecompensaService {

    private final IRegistroConsumoRepository consumoRepository;
    private final ITransaccionRecompensaRepository recompensaRepository;

    /**
     * Creates the service with required repositories.
     *
     * @param consumoRepository    consumption record repository
     * @param recompensaRepository reward transaction repository
     */
    public RecompensaServiceImpl(IRegistroConsumoRepository consumoRepository,
                                  ITransaccionRecompensaRepository recompensaRepository) {
        this.consumoRepository = consumoRepository;
        this.recompensaRepository = recompensaRepository;
    }

    @Override
    @Transactional
    public Result<DatosRespuestaRecompensa> acreditar(Long registroConsumoId) {
        // Verify record exists
        final var registroOpt = consumoRepository.findById(registroConsumoId);
        if (registroOpt.isEmpty()) {
            return Result.error(CodigosError.CONSUMO_DUPLICADO,
                    "Registro de consumo no encontrado");
        }

        final var registro = registroOpt.get();

        // Prevent double credit
        if (registro.getProcesado()) {
            return Result.error(CodigosError.CONSUMO_DUPLICADO,
                    "El consumo ya fue procesado y su recompensa acreditada");
        }

        final var perfil = registro.getPerfil();
        final var alimento = registro.getAlimento();
        final var monedas = alimento.getPuntosReward();

        // Create immutable ledger entry
        final var transaccion = new TransaccionRecompensa(perfil, registro, monedas);
        recompensaRepository.save(transaccion);

        // Update child profile balance
        perfil.setMonedasSaldo(perfil.getMonedasSaldo() + monedas);

        // Mark consumption as processed to prevent duplicate rewards
        registro.setProcesado(true);

        final var response = new DatosRespuestaRecompensa(
                transaccion.getId(),
                monedas,
                transaccion.getTipo(),
                transaccion.getCreatedAt(),
                alimento.getNombre()
        );

        return Result.success(response);
    }
}
