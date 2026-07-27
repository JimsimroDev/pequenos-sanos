package uk.jimsimrodev.pequenos_sanos.infra.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.Usuario;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * Service responsible for generating and validating JWT tokens.
 * Uses JJWT library with HMAC-SHA256 signing.
 */
@Service
public class TokenService {

    private static final Logger log = LoggerFactory.getLogger(TokenService.class);

    private final SecretKey secretKey;
    private final long expirationMillis;

    /**
     * Creates a TokenService with the configured secret and expiration.
     *
     * @param secret           JWT signing secret from environment variable
     *                         JWT_SECRET
     * @param expirationMillis token expiration time in milliseconds
     */
    public TokenService(
            @Value("${api.security.token.secret}") String secret,
            @Value("${api.security.token.expiration}") long expirationMillis) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expirationMillis;
    }

    /**
     * Generates a signed JWT token for the given user.
     *
     * @param usuario the authenticated user
     * @return a signed JWT string with the user's email as subject
     */
    public String generarToken(Usuario usuario) {
        final Instant now = Instant.now();
        final Instant expiration = now.plusMillis(expirationMillis);

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("id", usuario.getId())
                .claim("nombre", usuario.getNombre())
                .claim("rol", usuario.getRol().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Extracts and validates the subject (email) from a JWT token.
     *
     * @param token the JWT string to validate
     * @return the subject (email) if the token is valid, or null if invalid/expired
     */
    public String getSubject(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getSubject();
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return null;
        }
    }
}
