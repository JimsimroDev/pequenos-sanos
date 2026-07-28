package uk.jimsimrodev.pequenos_sanos.domain.alimento.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.dto.DatosRespuestaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.repositories.IAlimentoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.services.IAlimentoService;

import java.util.List;
import java.util.Optional;

/**
 * Implementation of food catalogue retrieval operations.
 */
@Service
public class AlimentoServiceImpl implements IAlimentoService {

    private final IAlimentoRepository alimentoRepository;

    /**
     * Creates the service with the alimento repository.
     *
     * @param alimentoRepository food catalogue repository
     */
    public AlimentoServiceImpl(IAlimentoRepository alimentoRepository) {
        this.alimentoRepository = alimentoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DatosRespuestaAlimento> listar(CategoriaAlimento categoria) {
        var alimentos = (categoria != null)
                ? alimentoRepository.findByCategoriaAndActivoTrue(categoria)
                : alimentoRepository.findByActivoTrue();

        return alimentos.stream()
                .map(DatosRespuestaAlimento::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DatosRespuestaAlimento> buscarPorId(Long id) {
        return alimentoRepository.findById(id)
                .filter(a -> a.getActivo())
                .map(DatosRespuestaAlimento::from);
    }
}
