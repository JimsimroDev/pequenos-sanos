---
name: dto-guidelines
inclusion: fileMatch
fileMatchPattern: "**/domain/**"
---

# DTO Guidelines

- **Record Implementation:** All DTOs must be implemented as Java `record` types.
- **Location:** Place DTO records inside the `domain/[entity]/` folder alongside the entity they belong to.
- **Validation:** Use Jakarta Validation annotations (`@NotNull`, `@NotBlank`, `@Size`, etc.) on record components for request DTOs.
- **Logic Boundary:** Keep DTOs purely data-focused with no business logic.
- **Mapping:** Map DTOs to/from domain entities in the service layer (never inside controllers).
