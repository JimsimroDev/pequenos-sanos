package uk.jimsimrodev.pequenos_sanos.domain.usuario;

/**
 * Enum representing the user roles in the system.
 * Used for authorization decisions in Spring Security.
 */
public enum Rol {

    /** Parent or tutor who manages child profiles and registers food intake. */
    PADRE,

    /** Child who plays in the virtual world within the allowed screen time. */
    NINO
}
