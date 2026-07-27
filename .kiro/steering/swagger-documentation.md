---
name: swagger-documentation
inclusion: fileMatch
fileMatchPattern: "**/controller/**"
---

# Swagger / OpenAPI 3 Documentation Standards

## Dependency

Every module that exposes REST endpoints must include SpringDoc OpenAPI:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

## General Rules

- All Swagger annotation **descriptions and summaries must be written in Spanish**.
- Annotations go on the **Controller methods** and on **DTO record components** — never on service or repository classes.
- Every endpoint **must** have at minimum: one `@Operation` and the relevant `@ApiResponse` entries.
- Never expose internal stack traces or technical details in `@ApiResponse` descriptions.

## Controller Documentation

Every public endpoint must include `@Operation` and `@ApiResponses`.

```java
@Operation(
    summary = "Registra el consumo de un alimento",
    description = "Valida el alimento, lo asocia al perfil infantil y acredita la recompensa correspondiente."
)
@ApiResponses(value = {
    @ApiResponse(responseCode = "201", description = "Consumo registrado exitosamente"),
    @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o faltantes"),
    @ApiResponse(responseCode = "401", description = "Token de autenticación ausente o inválido"),
    @ApiResponse(responseCode = "403", description = "Sin permiso para registrar en este perfil"),
    @ApiResponse(responseCode = "422", description = "Error de negocio: alimento duplicado o perfil no encontrado")
})
@PostMapping
public ResponseEntity<DatosRespuestaConsumo> registrar(
        @RequestBody @Valid DatosRegistroConsumo datos) { ... }
```

### Required responses by HTTP method

| Method | Required codes |
|--------|---------------|
| POST (create) | 201, 400, 401, 403 |
| GET (list / by id) | 200, 401, 403, 404 |
| PUT / PATCH | 200, 400, 401, 403, 404 |
| DELETE | 204, 401, 403, 404 |

Add `422` whenever the endpoint can return a `Result.Error` from the service layer.

## DTO Documentation

Use `@Schema` on every field of request and response record types.

```java
public record DatosRegistroConsumo(
    @Schema(description = "ID del perfil infantil que consumió el alimento", example = "1")
    @NotNull Long perfilId,

    @Schema(description = "ID del alimento consumido según el catálogo", example = "5")
    @NotNull Long alimentoId
) {}
```

## Global OpenAPI Configuration

Place this in `config/SwaggerConfig.java`:

```java
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Pequeños Sanos API")
                        .description("API de gamificación nutricional para niños de 2 a 4 años")
                        .version("1.0.0"))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components().addSecuritySchemes(securitySchemeName,
                        new SecurityScheme().name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer").bearerFormat("JWT")));
    }
}
```

## application.yml

```yaml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha
```

## What NOT to Do

- Do **not** use `@Tag` at method level — use it at class level only.
- Do **not** write descriptions in English in user-facing API descriptions.
- Do **not** skip `@Schema` on response records.
- Do **not** document internal DTOs not exposed via HTTP.
