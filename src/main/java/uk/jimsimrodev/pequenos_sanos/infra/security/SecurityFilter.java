package uk.jimsimrodev.pequenos_sanos.infra.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.IUsuarioRepository;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.Usuario;

import java.io.IOException;

/**
 * JWT authentication filter that intercepts every request, extracts the Bearer token
 * from the Authorization header, validates it, and sets the SecurityContext.
 */
@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final IUsuarioRepository usuarioRepository;

    /**
     * Creates a SecurityFilter with required dependencies.
     *
     * @param tokenService      service to validate JWT tokens
     * @param usuarioRepository repository to load user details
     */
    public SecurityFilter(TokenService tokenService, IUsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String token = extractToken(request);

        if (token != null) {
            final String subject = tokenService.getSubject(token);
            if (subject != null) {
                usuarioRepository.findByEmail(subject).ifPresent(this::authenticateUser);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void authenticateUser(Usuario usuario) {
        var authentication = new UsernamePasswordAuthenticationToken(
                usuario,
                null,
                usuario.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String extractToken(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
