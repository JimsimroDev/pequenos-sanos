package uk.jimsimrodev.pequenos_sanos.infra.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import uk.jimsimrodev.pequenos_sanos.domain.auth.repositories.IUsuarioRepository;

/**
 * Spring Security {@link UserDetailsService} implementation that loads users
 * from the database by email address.
 */
@Service
public class AutenticacionService implements UserDetailsService {

    private final IUsuarioRepository usuarioRepository;

    /**
     * Creates the service with the usuario repository.
     *
     * @param usuarioRepository repository to load user data
     */
    public AutenticacionService(IUsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Loads a user by their email (used as username in this system).
     *
     * @param email the email address to look up
     * @return the UserDetails for the found user
     * @throws UsernameNotFoundException if no user with that email exists
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con email: " + email));
    }
}
