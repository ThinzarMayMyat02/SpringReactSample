# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 - build the fat jar
# ---------------------------------------------------------------------------
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /workspace

# Temurin ships the JDK but not Maven, so install it (kept out of the runtime image).
RUN apk add --no-cache maven

# Resolve dependencies first so Docker can cache them between builds.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Now copy the sources and build the jar (tests are run in CI, not at image build).
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---------------------------------------------------------------------------
# Stage 2 - slim runtime image
# ---------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Never run as root.
RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=build /workspace/target/app.jar app.jar
RUN chown -R spring:spring /app
USER spring:spring

# Render/Railway inject their own $PORT at runtime; 8080 is the local default.
ENV PORT=8080
EXPOSE 8080

# Respect the platform-provided PORT while keeping sane container defaults.
ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -jar app.jar --server.port=${PORT}"]
