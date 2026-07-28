# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /workspace

COPY pom.xml .
COPY src ./src

# Build and package, skipping tests (run them in CI before building the image)
RUN mvn clean package -DskipTests

# Extract Spring Boot layers for optimised caching
RUN java -Djarmode=layertools -jar target/*.jar extract

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy layers in order of least → most volatile for Docker layer cache efficiency
COPY --from=builder /workspace/dependencies/ ./
COPY --from=builder /workspace/spring-boot-loader/ ./
COPY --from=builder /workspace/snapshot-dependencies/ ./
COPY --from=builder /workspace/application/ ./

# Use the Spring Boot JarLauncher with the Docker profile configuration
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher", \
            "--spring.config.location=classpath:/application-docker.yml"]
