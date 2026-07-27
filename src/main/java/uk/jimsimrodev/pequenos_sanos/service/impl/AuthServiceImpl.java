package uk.jimsimrodev.pequenos_sanos.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosJWTToken;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosLoginUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosRegistroUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.dto.DatosRespuestaUsuario;
import uk.jimsimrodev.pequenos_sanos.domain.auth.repositories.IUsuarioRepository;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Rol;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.infra.Result;
import uk.jimsimrodev.pequenos_sanos.infra.errores.CodigosError;
import uk.jimsimrodev.pequenos_sanos.infra.security.TokenService;
import uk.jimsimrodev.pequenos_sanos.service.IAuthService;

/**
 * Implementation of authentication operations including user registration and
 * login.
 */
@Service
public class AuthServiceImpl implements IAuthService {

    private final IUsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    /**
     * Creates the AuthServiceImpl with required dependencies.
     *
     * @param usuarioRepository     user persistence repository
     * @param passwordEncoder       BCrypt password encoder
     * @param authenticationManager Spring Security authentication manager
     * @param tokenService          JWT token generation service
     */
    public AuthServiceImpl(IUsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            TokenService tokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @Override
    @Transactional
    public Result<DatosRespuestaUsuario> registrar(DatosRegistroUsuario datos) {
        if (usuarioRepository.existsByEmail(datos.email())) {
            return Result.error(CodigosError.EMAIL_DUPLICADO,
                    "El correo electrónico ya se encuentra registrado");
        }

        final var usuario = new Usuario(
                datos.nombre(),
                datos.email(),
                passwordEncoder.encode(datos.password()),
                Rol.PADRE);

        final var saved = usuarioRepository.save(usuario);

        final var response = new DatosRespuestaUsuario(
                saved.getId(),
                saved.getNombre(),
                saved.getEmail());

        return Result.success(response);
    }

    @Override
    public Result<DatosJWTToken> login(DatosLoginUsuario datos) {
        try {
            final var authToken = new UsernamePasswordAuthenticationToken(
                    datos.email(), datos.password());
            final var authentication = authenticationManager.authenticate(authToken);
            final var usuario = (Usuario) authentication.getPrincipal();
            final var jwt = tokenService.generarToken(usuario);

            return Result.success(new DatosJWTToken(jwt));
        } catch (BadCredentialsException e) {
            return Result.error("CREDENCIALES_INVALIDAS", "Credenciales incorrectas");
        }
    }
}
