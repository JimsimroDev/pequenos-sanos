---
name: service-layer-pattern
inclusion: always
---

# Service Layer Architecture Standard

## Rule

Controllers (`@RestController`) MUST NOT contain business logic, domain validation rules, or direct repository interaction. They only delegate execution to the service layer.

## 1. Package Structure

```
uk.jimsimrodev.pequenos_sanos.service
├── I<Nombre>Service.java          ← Interface (contract)
└── impl/
    └── <Nombre>ServiceImpl.java   ← Concrete implementation
```

## 2. Design Conventions

1. **Interface name:** `I<Nombre>Service.java` (e.g., `IAuthService`, `IPerfilService`, `IConsumoService`).
2. **Implementation location:** Inside `service/impl/` with suffix `Impl` (e.g., `AuthServiceImpl`).
3. **Controller injection:** Controllers MUST inject only the interface `I<Nombre>Service`, NEVER the concrete `ServiceImpl` class.
4. **Error handling:** When a business rule fails (e.g., duplicate email), the service layer returns `Result.error(code, message)` per the Result pattern. Reserve exceptions for unexpected/technical failures only. The controller maps `Result.Error` to the appropriate HTTP status (typically 422 or 409).
5. **Transactions:** Write operations MUST be annotated with `@Transactional`. Read-only operations MUST use `@Transactional(readOnly = true)`.

## 3. Controller Pattern

```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController implements AuthResource {

    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

    @Override
    public ResponseEntity<DatosRespuestaUsuario> registrar(@RequestBody @Valid DatosRegistroUsuario datos) {
        var response = authService.registrar(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

## 4. What NOT to Do

- Do NOT inject repositories into controllers.
- Do NOT put `AuthenticationManager`, `PasswordEncoder`, or `TokenService` in controllers.
- Do NOT throw HTTP-specific exceptions from services (use domain exceptions).
- Do NOT call multiple services from a controller for a single logical operation — compose in the service layer.
