---
name: testing-standards
inclusion: fileMatch
fileMatchPattern: "src/test/**"
---

# Testing Standards

- **Behavior Verification:** Focus tests on verifying behavior rather than implementation details.
- **Test Types:**
  - **Unit Tests:** For isolated service logic.
  - **Slice Tests:** Use `@WebMvcTest` for controller/web layer testing and `@DataJpaTest` for persistence testing.
  - **Integration Tests:** Reserve full integration tests (`@SpringBootTest`) for complete end-to-end flows.
- **Structure & Naming:** Use clear, descriptive test method names and follow the **Arrange-Act-Assert (AAA)** pattern.
