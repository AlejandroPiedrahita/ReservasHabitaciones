# ----------------------------------------------------------------------------
# ReserveHub Enterprise Backend - Multi-Stage Production Dockerfile
# Build context: repository root (see docker-compose.yml)
# ----------------------------------------------------------------------------

# Stage 1: Build the Spring Boot artifact with Maven + Temurin 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Cache dependencies first for faster rebuilds
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package (skip tests here; the QA suite runs in CI)
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal runtime image (non-root, JRE only)
FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/v1/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseG1GC", "-jar", "app.jar"]
