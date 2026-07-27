---
name: core-standards
inclusion: always
---

# Java 21 & General Coding Standards

## Language & Naming

- All names in English (classes, methods, variables, packages).
- Standard Java conventions:
  - Classes/Records/Enums: `PascalCase`
  - Methods/Variables/Fields: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Packages: `lowercase`
- Target Java 21 features and idioms.

## Principles & Immutability

- Prefer immutability: use `final` variables and avoid mutable shared state.
- Prefer composition over inheritance.
- Keep methods small and single-purpose. Return early to avoid deep nesting.
- Use `Objects.requireNonNull` for internal invariants.
- Prefer `java.time` types over `Date`/`Calendar`.
- Use `var` only when it explicitly improves readability.

## Documentation & Javadoc

- Every `public` method must have up-to-date Javadoc describing intent and behavior.
- Include `@param`, `@return`, and `@throws` tags where applicable.
- Public types (controllers, services, DTOs) require brief class/record-level Javadoc.

## Logging

- Use SLF4J (`private static final Logger log = LoggerFactory.getLogger(...)`).
- Log at appropriate levels; never log sensitive data.
