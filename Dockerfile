# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy dependencies manifest
COPY frontend/hospital-management-frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy frontend source and build
COPY frontend/hospital-management-frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Package the Spring Boot Backend
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17 AS backend-builder
WORKDIR /app/backend

# Copy backend pom.xml
COPY backend/hospital/pom.xml ./
# Resolve dependencies to cache them in Docker layers
RUN mvn dependency:go-offline -B

# Copy backend source
COPY backend/hospital/src ./src

# Copy built React frontend assets from Stage 1 into Spring Boot's static folder
COPY --from=frontend-builder /app/frontend/build/ ./src/main/resources/static/HealthCare/

# Package Spring Boot application jar (skip tests for faster deployment build)
RUN mvn clean package -DskipTests -B

# ==========================================
# Stage 3: Runtime
# ==========================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy packaged jar from Stage 2
COPY --from=backend-builder /app/backend/target/*.jar ./app.jar

# Expose server port (configured to 8080)
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
