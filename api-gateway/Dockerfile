# 1. Aşama: Build (Derleme)
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
# Multi-module projesinin derlenebilmesi için tüm içeriği kopyalıyoruz
COPY . .
# Sadece bu modülü ve bağımlılıklarını derle
RUN mvn clean package -pl api-gateway -am -DskipTests

# 2. Aşama: Run (Çalıştırma)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Modül altında üretilen jar dosyasını alıyoruz
COPY --from=builder /app/api-gateway/target/*.jar app.jar



# Sağlık kontrolü
HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget -q --spider http://localhost:${SERVER_PORT:-8080}/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
