# ==============================================
# Stage 1: Build - Compilation avec Maven
# ==============================================
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copier le fichier pom.xml pour télécharger les dépendances
COPY pom.xml .

# Télécharger les dépendances (cache layer)
RUN mvn dependency:go-offline -B

# Copier le code source
COPY src ./src

# Build de l'application (sans les tests pour accélérer)
RUN mvn clean package -DskipTests -B

# ==============================================
# Stage 2: Development - Environnement de dev
# ==============================================
FROM maven:3.9-eclipse-temurin-17 AS development

WORKDIR /app

# Copier les fichiers du projet
COPY pom.xml .
COPY src ./src

# Exposer le port Spring Boot
EXPOSE 8002

# Commande pour lancer en mode dev avec hot-reload
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dserver.port=8002"]

# ==============================================
# Stage 3: Production - Runtime JRE optimisé
# ==============================================
FROM eclipse-temurin:17-jre AS production

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN groupadd -r spring && useradd -r -g spring spring

# Copier le JAR depuis le stage builder
COPY --from=builder /app/target/*.jar app.jar

# Copier le fichier de configuration Firebase
COPY src/main/resources/firebase-service-account.json /app/firebase-service-account.json

# Changer le propriétaire des fichiers
RUN chown -R spring:spring /app

# Utiliser l'utilisateur non-root
USER spring

# Exposer le port Spring Boot
EXPOSE 8002

# Variables d'environnement par défaut
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENV SPRING_PROFILES_ACTIVE=prod

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8002/actuator/health || exit 1

# Démarrer l'application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
