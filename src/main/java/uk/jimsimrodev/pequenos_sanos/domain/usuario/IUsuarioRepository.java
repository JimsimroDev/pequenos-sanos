package uk.jimsimrodev.pequenos_sanos.domain.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Usuario} entity.
 */
public interface IUsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Finds a user by their email address.
     *
     * @param email the email to search for
     * @return an Optional containing the user if found
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Checks whether a user with the given email already exists.
     *
     * @param email the email to check
     * @return true if a user with that email exists
     */
    boolean existsByEmail(String email);
}
