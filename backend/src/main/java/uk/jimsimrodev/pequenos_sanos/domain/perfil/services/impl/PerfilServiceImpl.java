package uk.jimsimrodev.pequenos_sanos.domain.perfil.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.auth.repositories.IUsuarioRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosActualizacionPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRegistroPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.dto.DatosRespuestaPerfil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.services.IPerfilService;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;

import java.util.List;

/**
 * Implementation of child profile CRUD operations.
 */
@Service
public class PerfilServiceImpl implements IPerfilService {

    private final IPerfilInfantilRepository perfilRepository;
    private final IUsuarioRepository usuarioRepository;

    /**
     * Creates the service with required repositories.
     *
     * @param perfilRepository  child profile repository
     * @param usuarioRepository user repository to resolve the parent
     */
    public PerfilServiceImpl(IPerfilInfantilRepository perfilRepository,
                             IUsuarioRepository usuarioRepository) {
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public Result<DatosRespuestaPerfil> crear(DatosRegistroPerfil datos, Long usuarioId) {
        final var usuarioOpt = usuarioRepository.findById(usuarioId);
        if (usuarioOpt.isEmpty()) {
            return Result.error(CodigosError.PERFIL_NO_ENCONTRADO,
                    "Usuario autenticado no encontrado");
        }

        final var perfil = new PerfilInfantil(
                usuarioOpt.get(),
                datos.nombre(),
                datos.edadAnios(),
                datos.screenTimeLimit()
        );

        if (datos.avatarCodigo() != null) {
            perfil.setAvatarCodigo(datos.avatarCodigo());
        }

        final var saved = perfilRepository.save(perfil);
        return Result.success(DatosRespuestaPerfil.from(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DatosRespuestaPerfil> listar(Long usuarioId) {
        return perfilRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .stream()
                .map(DatosRespuestaPerfil::from)
                .toList();
    }

    @Override
    @Transactional
    public Result<DatosRespuestaPerfil> actualizar(Long perfilId,
                                                    DatosActualizacionPerfil datos,
                                                    Long usuarioId) {
        final var perfilOpt = perfilRepository.findByIdAndActivoTrue(perfilId);
        if (perfilOpt.isEmpty()) {
            return Result.error(CodigosError.PERFIL_NO_ENCONTRADO,
                    "Perfil no encontrado");
        }

        final var perfil = perfilOpt.get();

        if (!perfil.getUsuario().getId().equals(usuarioId)) {
            return Result.error(CodigosError.PERFIL_NO_ENCONTRADO,
                    "El perfil no pertenece al usuario autenticado");
        }

        if (datos.nombre() != null) {
            perfil.setNombre(datos.nombre());
        }
        if (datos.avatarCodigo() != null) {
            perfil.setAvatarCodigo(datos.avatarCodigo());
        }
        if (datos.screenTimeLimit() != null) {
            perfil.setScreenTimeLimit(datos.screenTimeLimit());
        }

        return Result.success(DatosRespuestaPerfil.from(perfil));
    }

    @Override
    @Transactional
    public Result<Void> desactivar(Long perfilId, Long usuarioId) {
        final var perfilOpt = perfilRepository.findByIdAndActivoTrue(perfilId);
        if (perfilOpt.isEmpty()) {
            return Result.error(CodigosError.PERFIL_NO_ENCONTRADO,
                    "Perfil no encontrado");
        }

        final var perfil = perfilOpt.get();

        if (!perfil.getUsuario().getId().equals(usuarioId)) {
            return Result.error(CodigosError.PERFIL_NO_ENCONTRADO,
                    "El perfil no pertenece al usuario autenticado");
        }

        perfil.setActivo(false);
        return Result.success(null);
    }
}
