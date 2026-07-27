---
name: service-error-handling
inclusion: fileMatch
fileMatchPattern: "**/service/**"
---

# Service Layer & Error Handling

## Service Architecture

- Services hold business rules and orchestrate repositories.
- Avoid overly generic "god services"; split responsibilities by bounded contexts.
- Use `@Transactional` at the service layer:
  - Apply `@Transactional(readOnly = true)` for read-only operations.

## Result Pattern for Business Errors

- Use the **Result pattern** for expected/controlled failures (business rule violations, domain validation).
- Services must return `Result<T>` instead of throwing custom exceptions for business failures.
- Centralize error codes/messages and return them as `Result.Error`.
- Reserve custom exception types solely for unexpected, technical, or infrastructure failures.
- Global exception handling (`@RestControllerAdvice`) handles unhandled exceptions for consistent HTTP error responses.
