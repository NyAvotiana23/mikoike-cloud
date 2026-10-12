# Guide Complet Module Authentification - Spring Boot
## Projet Cloud P17 - Promotion 17

---

## 📋 Table des matières
1. [Setup Docker](#1-setup-docker)
2. [Setup Projet Spring Boot Maven](#2-setup-projet-spring-boot-maven)
3. [Configuration application.properties](#3-configuration-applicationproperties)
4. [Configuration Swagger](#4-configuration-swagger)
5. [Configuration Firebase et PostgreSQL](#5-configuration-firebase-et-postgresql)
6. [Setup API REST](#6-setup-api-rest)
7. [MCD Utilisateurs](#7-mcd-utilisateurs)
8. [Création Entités](#8-création-entités)
9. [Création Repositories](#9-création-repositories)
10. [Créer Table User PostgreSQL](#10-créer-table-user-postgresql)
11. [Setup Firebase Authentication](#11-setup-firebase-authentication)
12. [Logique Switch Firebase + PostgreSQL](#12-logique-switch-firebase--postgresql)
13. [API Inscription Utilisateur](#13-api-inscription-utilisateur)
14. [API Login](#14-api-login)
15. [API Modification User](#15-api-modification-user)
16. [Gestion Durée de Vie Sessions](#16-gestion-durée-de-vie-sessions)
17. [Limite des Tentatives à 3](#17-limite-des-tentatives-à-3)
18. [API Débloquer User](#18-api-débloquer-user)
19. [Config des Paramètres de Tentatives](#19-config-des-paramètres-de-tentatives)
20. [Test des API avec Postman](#20-test-des-api-avec-postman)
21. [Test Intégration Firebase](#21-test-intégration-firebase)
22. [Test Fallback PostgreSQL Hors Ligne](#22-test-fallback-postgresql-hors-ligne)
23. [Sécurisation du Module](#23-sécurisation-du-module)
24. [Intégration Swagger](#24-intégration-swagger)

---

## 1. Setup Docker

### 📁 Fichier: `docker-compose.yml` (racine du projet)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: auth-postgres
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - auth-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  auth-api:
    build: .
    container_name: auth-spring-api
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/auth_db
      SPRING_DATASOURCE_USERNAME: admin
      SPRING_DATASOURCE_PASSWORD: admin123
      SPRING_PROFILES_ACTIVE: dev
    networks:
      - auth-network

volumes:
  postgres_data:

networks:
  auth-network:
    driver: bridge
```

### 📁 Fichier: `Dockerfile` (racine du projet)

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 📁 Fichier: `.dockerignore` (racine du projet)

```
target/
.git/
.gitignore
*.md
.env
*.log
```

### 🔧 Commandes Docker

```bash
# Démarrer les conteneurs
docker-compose up -d

# Vérifier les conteneurs
docker ps

# Voir les logs
docker logs auth-spring-api

# Arrêter les conteneurs
docker-compose down
```

---

## 2. Setup Projet Spring Boot Maven

### 📁 Fichier: `pom.xml` (racine du projet)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.projet.cloud</groupId>
    <artifactId>auth-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <properties>
        <java.version>17</java.version>
        <firebase.version>9.2.0</firebase.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- PostgreSQL -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
        
        <!-- Firebase Admin SDK -->
        <dependency>
            <groupId>com.google.firebase</groupId>
            <artifactId>firebase-admin</artifactId>
            <version>${firebase.version}</version>
        </dependency>
        
        <!-- Swagger/OpenAPI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- BCrypt for password -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-crypto</artifactId>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 🔧 Commandes Maven

```bash
# Nettoyer et compiler
mvn clean install

# Lancer l'application
mvn spring-boot:run

# Package JAR
mvn clean package
```

---

## 3. Configuration application.properties

### 📁 Fichier: `src/main/resources/application.properties`

```properties
# Application Name
spring.application.name=auth-service

# Server Configuration
server.port=8080

# Active Profile
spring.profiles.active=dev

# JPA/Hibernate
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Logging
logging.level.root=INFO
logging.level.com.projet.cloud=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# Swagger/OpenAPI
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true

# Auth Configuration
auth.max-login-attempts=3
auth.account-lock-duration-minutes=30
auth.session-timeout-minutes=60
auth.jwt.secret=VotreCleSecreteTresLongueEtSecurisee12345678901234567890
auth.jwt.expiration-ms=3600000

# Firebase Configuration
firebase.enabled=true
firebase.config-file=firebase-service-account.json
```

### 📁 Fichier: `src/main/resources/application-dev.properties`

```properties
# Development Profile
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/auth_db
spring.datasource.username=admin
spring.datasource.password=admin123
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# Auto-create tables
spring.jpa.hibernate.ddl-auto=update

# Debug
logging.level.org.springframework.web=DEBUG
```

### 📁 Fichier: `src/main/resources/application-prod.properties`

```properties
# Production Profile
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://postgres:5432/auth_db
spring.datasource.username=admin
spring.datasource.password=admin123

# No DDL auto in production
spring.jpa.hibernate.ddl-auto=validate

# Logging
logging.level.root=WARN
logging.level.com.projet.cloud=INFO
spring.jpa.show-sql=false
```

---

## 4. Configuration Swagger

### 📁 Fichier: `src/main/java/com/projet/cloud/config/OpenApiConfig.java`

```java
package com.projet.cloud.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Authentification - Projet Cloud P17")
                        .version("1.0.0")
                        .description("API REST pour l'authentification avec Firebase et PostgreSQL (fallback)")
                        .contact(new Contact()
                                .name("Promotion 17")
                                .email("support@projet-cloud.mg")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Serveur de développement"),
                        new Server().url("http://auth-api:8080").description("Serveur Docker")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT token authentication")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}
```

**Accès Swagger**: `http://localhost:8080/swagger-ui.html`

---

## 5. Configuration Firebase et PostgreSQL

### 📁 Fichier: `src/main/java/com/projet/cloud/config/FirebaseConfig.java`

```java
package com.projet.cloud.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.enabled:true}")
    private boolean firebaseEnabled;

    @Value("${firebase.config-file:firebase-service-account.json}")
    private String firebaseConfigFile;

    @PostConstruct
    public void initialize() {
        if (!firebaseEnabled) {
            log.warn("Firebase is disabled in configuration");
            return;
        }

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                ClassPathResource resource = new ClassPathResource(firebaseConfigFile);
                
                if (!resource.exists()) {
                    log.warn("Firebase config file not found: {}. Firebase will be disabled.", firebaseConfigFile);
                    return;
                }

                InputStream serviceAccount = resource.getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized successfully");
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase: {}. Falling back to PostgreSQL only.", e.getMessage());
        }
    }
}
```

### 📁 Fichier: `src/main/java/com/projet/cloud/util/ConnectionChecker.java`

```java
package com.projet.cloud.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;
import java.net.Socket;

@Slf4j
@Component
public class ConnectionChecker {

    private static final String FIREBASE_HOST = "firebase.googleapis.com";
    private static final int FIREBASE_PORT = 443;
    private static final int TIMEOUT_MS = 3000;

    public boolean isInternetAvailable() {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(FIREBASE_HOST, FIREBASE_PORT), TIMEOUT_MS);
            log.debug("Internet connection available");
            return true;
        } catch (Exception e) {
            log.warn("No internet connection. Falling back to PostgreSQL");
            return false;
        }
    }
    
    public boolean isFirebaseAvailable() {
        return isInternetAvailable() && com.google.firebase.FirebaseApp.getApps().size() > 0;
    }
}
```

### 🔧 Obtenir le fichier Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un projet ou sélectionnez un projet existant
3. Allez dans **Project Settings** > **Service Accounts**
4. Cliquez sur **Generate New Private Key**
5. Téléchargez le fichier JSON
6. Renommez-le `firebase-service-account.json`
7. Placez-le dans `src/main/resources/`

---

## 6. Setup API REST

### 📁 Fichier: `src/main/java/com/projet/cloud/AuthServiceApplication.java`

```java
package com.projet.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
```

### 📁 Fichier: `src/main/java/com/projet/cloud/config/CorsConfig.java`

```java
package com.projet.cloud.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
```

---

## 7. MCD Utilisateurs

### Modèle Conceptuel de Données

```
┌─────────────────────────────────┐
│          USER                   │
├─────────────────────────────────┤
│ id: BIGINT (PK)                 │
│ email: VARCHAR(255) UNIQUE      │
│ password: VARCHAR(255)          │
│ name: VARCHAR(100)              │
│ role: VARCHAR(20)               │
│ is_locked: BOOLEAN              │
│ locked_until: TIMESTAMP         │
│ failed_attempts: INT            │
│ created_at: TIMESTAMP           │
│ updated_at: TIMESTAMP           │
└─────────────────────────────────┘
           │
           │ 1:N
           │
┌─────────────────────────────────┐
│        SESSION                  │
├─────────────────────────────────┤
│ id: BIGINT (PK)                 │
│ user_id: BIGINT (FK)            │
│ token: VARCHAR(500)             │
│ created_at: TIMESTAMP           │
│ expires_at: TIMESTAMP           │
│ is_active: BOOLEAN              │
└─────────────────────────────────┘
           │
┌─────────────────────────────────┐
│      LOGIN_ATTEMPT              │
├─────────────────────────────────┤
│ id: BIGINT (PK)                 │
│ user_id: BIGINT (FK)            │
│ email: VARCHAR(255)             │
│ success: BOOLEAN                │
│ ip_address: VARCHAR(50)         │
│ attempted_at: TIMESTAMP         │
└─────────────────────────────────┘
```

**Relations:**
- Un USER peut avoir plusieurs SESSIONS (1:N)
- Un USER peut avoir plusieurs LOGIN_ATTEMPT (1:N)

---

## 8. Création Entités

### 📁 Fichier: `src/main/java/com/projet/cloud/entity/User.java`

```java
package com.projet.cloud.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String role = "UTILISATEUR"; // VISITEUR, UTILISATEUR, MANAGER

    @Column(name = "is_locked")
    private boolean isLocked = false;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "failed_attempts")
    private int failedAttempts = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 📁 Fichier: `src/main/java/com/projet/cloud/entity/Session.java`

```java
package com.projet.cloud.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 500)
    private String token;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_active")
    private boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 📁 Fichier: `src/main/java/com/projet/cloud/entity/LoginAttempt.java`

```java
package com.projet.cloud.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt;

    @PrePersist
    protected void onCreate() {
        attemptedAt = LocalDateTime.now();
    }
}
```

---

## 9. Création Repositories

### 📁 Fichier: `src/main/java/com/projet/cloud/repository/UserRepository.java`

```java
package com.projet.cloud.repository;

import com.projet.cloud.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
}
```

### 📁 Fichier: `src/main/java/com/projet/cloud/repository/SessionRepository.java`

```java
package com.projet.cloud.repository;

import com.projet.cloud.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    
    Optional<Session> findByTokenAndIsActiveTrue(String token);
    
    List<Session> findByUserIdAndIsActiveTrue(Long userId);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    
    void deleteByUserIdAndIsActiveTrue(Long userId);
}
```

### 📁 Fichier: `src/main/java/com/projet/cloud/repository/LoginAttemptRepository.java`

```java
package com.projet.cloud.repository;

import com.projet.cloud.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    
    List<LoginAttempt> findByEmailAndAttemptedAtAfter(String email, LocalDateTime dateTime);
    
    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.email = ?1 AND la.success = false AND la.attemptedAt > ?2")
    long countFailedAttemptsSince(String email, LocalDateTime since);
    
    void deleteByAttemptedAtBefore(LocalDateTime dateTime);
}
```

---

## 10. Créer Table User PostgreSQL

### 📁 Fichier: `src/main/resources/schema.sql` (optionnel)

```sql
-- Tables créées automatiquement par Hibernate avec ddl-auto=update
-- Ce fichier est fourni à titre de référence

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'UTILISATEUR',
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP,
    failed_attempts INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    email VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(50),
    attempted_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);
```

### 🔧 Vérification des tables

```sql
-- Se connecter à PostgreSQL
docker exec -it auth-postgres psql -U admin -d auth_db

-- Lister les tables
\dt

-- Voir la structure de la table users
\d users

-- Quitter
\q
```

---

## 11. Setup Firebase Authentication

### 📁 Fichier: `src/main/java/com/projet/cloud/service/FirebaseAuthService.java`

```java
package com.projet.cloud.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FirebaseAuthService {

    public UserRecord createUser(String email, String password, String displayName) throws FirebaseAuthException {
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(displayName)
                .setEmailVerified(false);

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
        log.info("Successfully created Firebase user: {}", userRecord.getUid());
        return userRecord;
    }

    public UserRecord getUserByEmail(String email) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().getUserByEmail(email);
    }

    public void updateUser(String uid, String displayName, String password) throws FirebaseAuthException {
        UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(uid)
                .setDisplayName(displayName);
        
        if (password != null && !password.isEmpty()) {
            request.setPassword(password);
        }

        FirebaseAuth.getInstance().updateUser(request);
        log.info("Successfully updated Firebase user: {}", uid);
    }

    public void deleteUser(String uid) throws FirebaseAuthException {
        FirebaseAuth.getInstance().deleteUser(uid);
        log.info("Successfully deleted Firebase user: {}", uid);
    }

    public FirebaseToken verifyIdToken(String idToken) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().verifyIdToken(idToken);
    }

    public String createCustomToken(String uid) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().createCustomToken(uid);
    }
}
```

---

## 12. Logique Switch Firebase + PostgreSQL

### 📁 Fichier: `src/main/java/com/projet/cloud/service/AuthService.java`

```java
package com.projet.cloud.service;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.projet.cloud.dto.*;
import com.projet.cloud.entity.LoginAttempt;
import com.projet.cloud.entity