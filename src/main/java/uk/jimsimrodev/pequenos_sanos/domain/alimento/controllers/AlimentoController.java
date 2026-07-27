package uk.jimsimrodev.pequenos_sanos.domain.alimento.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.controllers.resource.AlimentoResource;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.dto.DatosRespuestaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.services.IAlimentoService;

import java.util.List;

/**
 * Thin REST controller for the nutritional food catalogue.
 * Delegates all logic to {@link IAlimentoService}.
 */
@RestController
@RequestMapping("/api/v1/alimentos")
public class AlimentoController implements AlimentoResource {

    private final IAlimentoService alimentoService;

    /**
     * Creates the controller with the alimento service.
     *
     * @param alimentoService food catalogue service contract
     */
    public AlimentoController(IAlimentoService alimentoService) {
        this.alimentoService = alimentoService;
    }

    @Override
    public ResponseEntity<List<DatosRespuestaAlimento>> listar(
            @RequestParam(required = false) CategoriaAlimento categoria) {
        return ResponseEntity.ok(alimentoService.listar(categoria));
    }

    @Override
    public ResponseEntity<DatosRespuestaAlimento> buscarPorId(@PathVariable Long id) {
        return alimentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
