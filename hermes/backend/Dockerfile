# ======================
# Stage 1: Build the app
# ======================
FROM eclipse-temurin:17-jdk AS builder

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Maven configuration first (better layer caching)
COPY pom.xml .
COPY src ./src

# Build the JAR (skip tests for faster build in prod)
RUN mvn clean package -DskipTests

# ===========================
# Stage 2: Runtime container
# ===========================
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/chatapp-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Pass active profile at runtime (default prod)
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
