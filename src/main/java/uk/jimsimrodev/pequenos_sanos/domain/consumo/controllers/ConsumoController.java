package uk.jimsimrodev.pequenos_sanos.domain.consumo.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.controllers.resource.ConsumoResource;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.dto.DatosRespuestaConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.services.IConsumoService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;

import java.util.List;

/**
 * Thin REST controller for food consumption registration.
 * Delegates all business logic to {@link IConsumoService}.
 */
@RestController
@RequestMapping("/api/v1/consumos")
public class ConsumoController implements ConsumoResource {

    private final IConsumoService consumoService;

    /**
     * Creates the controller with the consumo service.
     *
     * @param consumoService food consumption service contract
     */
    public ConsumoController(IConsumoService consumoService) {
        this.consumoService = consumoService;
    }

    @Override
    public ResponseEntity<DatosRespuestaConsumo> registrar(
            @RequestBody @Valid DatosRegistroConsumo datos,
            @AuthenticationPrincipal Usuario usuario) {

        final var result = consumoService.registrar(datos, usuario.getId());

        if (result instanceof Result.Success<DatosRespuestaConsumo> success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(success.value());
        }

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();
    }

    @Override
    public ResponseEntity<List<DatosRespuestaConsumo>> listarPorPerfil(
            @PathVariable Long perfilId) {
        return ResponseEntity.ok(consumoService.listarPorPerfil(perfilId));
    }
}
