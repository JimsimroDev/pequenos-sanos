package uk.jimsimrodev.pequenos_sanos.domain.perfil.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.controllers.resource.PerfilResource;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosActualizacionPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRegistroPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRespuestaPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.services.IPerfilService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;

import java.util.List;

/**
 * Thin REST controller for child profile management.
 * Delegates all business logic to {@link IPerfilService}.
 */
@RestController
@RequestMapping("/api/v1/perfiles")
public class PerfilController implements PerfilResource {

    private final IPerfilService perfilService;

    /**
     * Creates the controller with the profile service.
     *
     * @param perfilService child profile service contract
     */
    public PerfilController(IPerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @Override
    public ResponseEntity<DatosRespuestaPerfil> crear(
            @RequestBody @Valid DatosRegistroPerfil datos,
            @AuthenticationPrincipal Usuario usuario) {

        final var result = perfilService.crear(datos, usuario.getId());

        if (result instanceof Result.Success<DatosRespuestaPerfil> success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(success.value());
        }

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();
    }

    @Override
    public ResponseEntity<List<DatosRespuestaPerfil>> listar(
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(perfilService.listar(usuario.getId()));
    }

    @Override
    public ResponseEntity<DatosRespuestaPerfil> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizacionPerfil datos,
            @AuthenticationPrincipal Usuario usuario) {

        final var result = perfilService.actualizar(id, datos, usuario.getId());

        if (result instanceof Result.Success<DatosRespuestaPerfil> success) {
            return ResponseEntity.ok(success.value());
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @Override
    public ResponseEntity<Void> desactivar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {

        final var result = perfilService.desactivar(id, usuario.getId());

        if (result instanceof Result.Success) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
