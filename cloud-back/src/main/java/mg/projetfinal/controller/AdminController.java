package mg.projetfinal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.dto.AuthResponse;
import mg.projetfinal.dto.LoginManagerRequest;
import mg.projetfinal.dto.LoginResponse;
import mg.projetfinal.dto.RegisterAdminRequest;
import mg.projetfinal.entity.Session;
import mg.projetfinal.entity.User;
import mg.projetfinal.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Administration", description = "API de gestion des administrateurs")
public class AdminController {

    private final AuthService authService;

    @Value("${admin.secret-key}")
    private String adminSecretKey;

    @PostMapping("/register")
    @Operation(summary = "Créer un compte administrateur (MANAGER)")
    public ResponseEntity<AuthResponse> registerAdmin(@RequestBody RegisterAdminRequest request) {
        try {
            // Vérifier la clé secrète
            if (request.getSecretKey() == null || !request.getSecretKey().equals(adminSecretKey)) {
                log.warn("Tentative de création admin avec clé secrète invalide");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        AuthResponse.builder()
                                .success(false)
                                .message("Clé secrète invalide")
                                .build()
                );
            }

            // Créer l'admin
            User admin = authService.registerAdmin(
                    request.getEmail(),
                    request.getPassword(),
                    request.getName()
            );

            log.info("Admin créé avec succès: {}", admin.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    AuthResponse.builder()
                            .success(true)
                            .message("Compte administrateur créé avec succès")
                            .userId(admin.getId())
                            .email(admin.getEmail())
                            .name(admin.getName())
                            .role(admin.getRole().getCode())
                            .build()
            );

        } catch (Exception e) {
            log.error("Erreur lors de la création admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    AuthResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Connexion manager (sans blocage)")
    public ResponseEntity<LoginResponse> loginManager(@RequestBody LoginManagerRequest request, HttpServletRequest httpRequest) {
        try {
            Session session = authService.loginManager(request.getEmail(), request.getPassword(), httpRequest);

            return ResponseEntity.ok(
                    LoginResponse.builder()
                            .success(true)
                            .message("Connexion manager réussie")
                            .token(session.getToken())
                            .userId(session.getUser().getId())
                            .email(session.getUser().getEmail())
                            .name(session.getUser().getName())
                            .role(session.getUser().getRole().getCode())
                            .expiresAt(session.getExpiresAt())
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    LoginResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }
}