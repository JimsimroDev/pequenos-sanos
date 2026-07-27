# Test Utilities — Builders y Helpers Comunes

Clases de utilidad reutilizables en todas las pruebas del proyecto Pequeños Sanos.
Úbicalas en `src/test/java/uk/jimsimrodev/pequenos_sanos/util/`.

---

## TestDataBuilder — builders fluidos para entidades

```java
package uk.jimsimrodev.pequenos_sanos.util;

import uk.jimsimrodev.pequenos_sanos.domain.alimento.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.RegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.SesionJuego;
import uk.jimsimrodev.pequenos_sanos.domain.usuario.Usuario;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Fábrica de datos de prueba para evitar duplicación en tests.
 * Todos los métodos devuelven objetos transient (sin ID) listos
 * para ser persistidos con TestEntityManager o save().
 */
public final class TestDataBuilder {

    private TestDataBuilder() {}

    public static Usuario buildUsuario() {
        return Usuario.builder()
                .nombre("Padre Test")
                .email("padre@test.com")
                .passwordHash("$2a$10$hasheado")
                .activo(true)
                .build();
    }

    public static Usuario buildUsuario(String email) {
        return Usuario.builder()
                .nombre("Padre Test")
                .email(email)
                .passwordHash("$2a$10$hasheado")
                .activo(true)
                .build();
    }

    public static PerfilInfantil buildPerfil(Usuario usuario) {
        return PerfilInfantil.builder()
                .usuario(usuario)
                .nombre("Niño Test")
                .edadAnios(3)
                .avatarCodigo("avatar_01")
                .screenTimeLimit(15)
                .monedasSaldo(0)
                .activo(true)
                .build();
    }

    public static PerfilInfantil buildPerfil(Usuario usuario, int screenTimeLimit) {
        return PerfilInfantil.builder()
                .usuario(usuario)
                .nombre("Niño Test")
                .edadAnios(3)
                .screenTimeLimit(screenTimeLimit)
                .monedasSaldo(0)
                .activo(true)
                .build();
    }

    public static Alimento buildAlimento() {
        return Alimento.builder()
                .nombre("Brócoli")
                .categoria(CategoriaAlimento.VERDURA)
                .descripcion("Verdura verde rica en nutrientes")
                .puntosReward(10)
                .activo(true)
                .build();
    }

    public static Alimento buildAlimento(String nombre, CategoriaAlimento categoria, int puntos) {
        return Alimento.builder()
                .nombre(nombre)
                .categoria(categoria)
                .puntosReward(puntos)
                .activo(true)
                .build();
    }

    public static RegistroConsumo buildRegistroConsumo(PerfilInfantil perfil,
                                                        Alimento alimento,
                                                        Usuario registradoPor) {
        return RegistroConsumo.builder()
                .perfil(perfil)
                .alimento(alimento)
                .registradoPor(registradoPor)
                .fechaConsumo(LocalDate.now())
                .horaConsumo(LocalTime.of(12, 0))
                .procesado(false)
                .build();
    }

    public static RegistroConsumo buildRegistroConsumo(PerfilInfantil perfil,
                                                        Alimento alimento,
                                                        Usuario registradoPor,
                                                        LocalDate fecha) {
        return RegistroConsumo.builder()
                .perfil(perfil)
                .alimento(alimento)
                .registradoPor(registradoPor)
                .fechaConsumo(fecha)
                .horaConsumo(LocalTime.of(12, 0))
                .procesado(false)
                .build();
    }

    public static SesionJuego buildSesionJuego(PerfilInfantil perfil) {
        return SesionJuego.builder()
                .perfil(perfil)
                .fechaSesion(LocalDate.now())
                .minutosJugados(0)
                .build();
    }
}
```

---

## JwtTestHelper — generar tokens JWT para pruebas de integración

```java
package uk.jimsimrodev.pequenos_sanos.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utilidad para generar tokens JWT válidos en pruebas de integración
 * (@SpringBootTest). No usar en @WebMvcTest — allí usa @WithMockUser.
 */
public final class JwtTestHelper {

    /** Debe coincidir con jwt.secret en application-test.yml */
    private static final String TEST_SECRET =
            "test-secret-key-for-testing-only-256-bits-min";

    private JwtTestHelper() {}

    public static String buildToken(String email, String role) {
        SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3_600_000))
                .signWith(key)
                .compact();
    }

    public static String buildPadreToken(String email) {
        return buildToken(email, "PADRE");
    }

    public static String buildNinoToken(String email) {
        return buildToken(email, "NINO");
    }

    public static String buildExpiredToken(String email) {
        SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis() - 7_200_000))
                .expiration(new Date(System.currentTimeMillis() - 3_600_000))
                .signWith(key)
                .compact();
    }
}
```

---

## SecurityTestConfig — desactivar JWT en @WebMvcTest

```java
package uk.jimsimrodev.pequenos_sanos.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad para pruebas de slice (@WebMvcTest).
 * Deshabilita JWT y CSRF. Úsala con @Import(SecurityTestConfig.class).
 */
@TestConfiguration
public class SecurityTestConfig {

    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .build();
    }
}
```

---

## application-test.yml — propiedades para el perfil de pruebas

Crea este archivo en `src/test/resources/`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect

jwt:
  secret: test-secret-key-for-testing-only-256-bits-min
  access-token-expiration: 3600000
  refresh-token-expiration: 86400000
  issuer: pequenos-sanos-test

logging:
  level:
    org.springframework.security: WARN
    org.hibernate.SQL: WARN
```

---

## Convenciones de nomenclatura

| Patrón              | Ejemplo                                                          |
| ------------------- | ---------------------------------------------------------------- |
| Flujo feliz         | `shouldReturn201WhenConsumoIsRegisteredSuccessfully`             |
| Error de validación | `shouldReturn400WhenPerfilIdIsNull`                              |
| Error de negocio    | `shouldReturnConsumoDuplicadoWhenAlimentoAlreadyRegisteredToday` |
| No autorizado       | `shouldReturn401WhenRequestHasNoAuthentication`                  |
| Sin permiso         | `shouldReturn403WhenUserRoleIsNotAuthorized`                     |
| No encontrado       | `shouldReturn404WhenResourceDoesNotExist`                        |
| Constraint BD       | `shouldThrowExceptionWhenUniqueConstraintIsViolated`             |

## Checklist antes de hacer commit con tests

- [ ] Todos los tests tienen `@DisplayName` descriptivo
- [ ] Cada test tiene los tres bloques AAA con comentarios
- [ ] Los tests son independientes (no dependen de orden de ejecución)
- [ ] No hay datos hardcodeados sin explicación
- [ ] Los tests de error cubren todos los `Result.Error` posibles del servicio
- [ ] `mvn test` pasa sin errores
