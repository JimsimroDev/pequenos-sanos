---
name: swagger-resource-pattern
inclusion: always
---

# Swagger & OpenAPI Controller Architecture

When creating or modifying REST endpoints, apply the **Interface Resource pattern** to separate OpenAPI documentation from controller logic.

## 1. Directory Structure

All OpenAPI/Swagger documentation MUST reside in an interface within the `resource` subpackage:

```
uk.jimsimrodev.pequenos_sanos.controller.resource.<Nombre>Resource.java
```

The concrete controller resides directly in the `controller` package:

```
uk.jimsimrodev.pequenos_sanos.controller.<Nombre>Controller.java
```

## 2. Interface Resource Rules

1. **Class annotation:** The interface MUST have `@Tag(name = "...", description = "...")` specifying the endpoint group.

2. **Endpoint annotations:** Each method MUST include:
   - `@Operation(description = "...")` describing the operation.
   - `@ApiResponse` for all possible HTTP responses:
     - `200` / `201` for success (with corresponding DTO in `@Schema`).
     - `400` for validation errors.
     - `401` / `403` if JWT authentication is required.
     - `404` if the endpoint looks up resources by ID.
     - `500` for uncontrolled errors.
   - Path parameters MUST include `@Parameter(in = ParameterIn.PATH, name = "...", example = "...")`.
   - Request body MUST use `@io.swagger.v3.oas.annotations.parameters.RequestBody` with a realistic example object.

## 3. Concrete Controller Rules

1. The controller MUST implement the corresponding Resource interface:

   ```java
   public class UsuarioController implements UsuarioResource
   ```

2. **Zero Swagger annotations in the Controller.** The controller only contains Spring annotations (`@RestController`, `@RequestMapping`, `@Validated`) and service delegation logic.

## 4. Documentation Redirect Controller

Add a redirect controller in the root of `controller` package decorated with `@Hidden` so the redirect does not pollute the API docs:

```java
package uk.jimsimrodev.pequenos_sanos.controller;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;

@Hidden
@Controller
@RequestMapping("/documentation")
public class DocumentationController {

    @ResponseBody
    @GetMapping
    public void redirectToDocumentation(HttpServletResponse response) {
        try {
            response.sendRedirect("/swagger-ui.html");
        } catch (IOException e) {
            // Redirect failed silently
        }
    }
}
```

## 5. Example Structure

```
controller/
├── resource/
│   ├── AuthResource.java          ← @Tag + @Operation + @ApiResponse
│   ├── PerfilResource.java
│   ├── ConsumoResource.java
│   └── RecompensaResource.java
├── AuthController.java            ← implements AuthResource (zero Swagger annotations)
├── PerfilController.java
├── ConsumoController.java
├── RecompensaController.java
└── DocumentationController.java   ← @Hidden redirect to /swagger-ui.html
```
