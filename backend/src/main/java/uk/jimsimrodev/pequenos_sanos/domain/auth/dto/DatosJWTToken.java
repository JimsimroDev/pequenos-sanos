package uk.jimsimrodev.pequenos_sanos.domain.auth.dto;

/**
 * Response DTO containing the JWT access token issued after successful authentication.
 *
 * @param token the signed JWT string
 */
public record DatosJWTToken(String token) {
}
