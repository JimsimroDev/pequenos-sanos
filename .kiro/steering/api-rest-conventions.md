---
name: api-rest-conventions
inclusion: fileMatch
fileMatchPattern: "**/controller/**"
---

# REST API & Controller Standards

- **Thin Controllers:** Controllers handle HTTP concerns only (status codes, request/response models).
- **Delegation:** Delegate all business logic execution to services.
- **Dependency Injection:** Prefer constructor injection (single constructor; do not use field injection).
- **HTTP Responses:** Use `ResponseEntity` when explicit status codes or response headers are required.
- **DTO Usage:** Always use request/response DTO records. **Never expose JPA entities directly via endpoints.**
