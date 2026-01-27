package mg.projetfinal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import mg.projetfinal.dto.*;
import mg.projetfinal.entity.Session;
import mg.projetfinal.entity.User;
import mg.projetfinal.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "API de gestion de l'authentification")
public class AuthController {

    private final AuthService authService;

    // ==================== INSCRIPTION ====================

    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel utilisateur")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        try {
            // Récupérer le créateur depuis la session (si Manager crée le compte)
            User createdBy = getCurrentUser(httpRequest);

            User user = authService.register(
                    request.getEmail(),
                    request.getPassword(),
                    request.getName(),
                    createdBy
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    AuthResponse.builder()
                            .success(true)
                            .message("Compte créé avec succès")
                            .userId(user.getId())
                            .email(user.getEmail())
                            .name(user.getName())
                            .role(user.getRole().getCode())
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ErrorResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    // ==================== CONNEXION ====================

    @PostMapping("/login")
    @Operation(summary = "Connexion d'un utilisateur")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Session session = authService.login(request.getEmail(), request.getPassword(), httpRequest);

            return ResponseEntity.ok(
                    LoginResponse.builder()
                            .success(true)
                            .message("Connexion réussie")
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
                    ErrorResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    // ==================== DÉCONNEXION ====================

    @PostMapping("/logout")
    @Operation(summary = "Déconnexion d'un utilisateur")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);
            authService.logout(token);

            return ResponseEntity.ok(
                    AuthResponse.builder()
                            .success(true)
                            .message("Déconnexion réussie")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ErrorResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    // ==================== MODIFICATION USER ====================

    @PutMapping("/update/{userId}")
    @Operation(summary = "Modification des informations utilisateur")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        try {
            User modifiedBy = getCurrentUser(httpRequest);

            User updatedUser = authService.updateUser(
                    userId,
                    request.getName(),
                    request.getPassword(),
                    modifiedBy
            );

            return ResponseEntity.ok(
                    AuthResponse.builder()
                            .success(true)
                            .message("Informations mises à jour avec succès")
                            .userId(updatedUser.getId())
                            .email(updatedUser.getEmail())
                            .name(updatedUser.getName())
                            .role(updatedUser.getRole().getCode())
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ErrorResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    // ==================== DÉBLOCAGE COMPTE (MANAGER ONLY) ====================

    @PostMapping("/unlock/{email}")
    @Operation(summary = "Débloquer un compte utilisateur (Manager uniquement)")
    public ResponseEntity<?> unlockAccount(
            @PathVariable String email,
            HttpServletRequest httpRequest) {
        try {
            User manager = getCurrentUser(httpRequest);

            if (manager == null || !manager.isManager()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        ErrorResponse.builder()
                                .success(false)
                                .message("Accès refusé. Seul un Manager peut débloquer un compte.")
                                .build()
                );
            }

            authService.unlockAccount(email, manager);

            return ResponseEntity.ok(
                    AuthResponse.builder()
                            .success(true)
                            .message("Compte " + email + " débloqué avec succès")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ErrorResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    // ==================== VALIDATION SESSION ====================

    @GetMapping("/validate")
    @Operation(summary = "Valider une session")
    public ResponseEntity<?> validateSession(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractToken(authHeader);

            return authService.validateSession(token)
                    .map(session -> ResponseEntity.ok(
                            SessionResponse.builder()
                                    .success(true)
                                    .valid(true)
                                    .userId(session.getUser().getId())
                                    .email(session.getUser().getEmail())
                                    .name(session.getUser().getName())
                                    .role(session.getUser().getRole().getCode())
                                    .expiresAt(session.getExpiresAt())
                                    .build()
                    ))
                    .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                            SessionResponse.builder()
                                    .success(false)
                                    .valid(false)
                                    .message("Session invalide ou expirée")
                                    .build()
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ErrorResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    // ==================== DÉCONNEXION DE TOUTES LES SESSIONS ====================

    @PostMapping("/logout-all/{userId}")
    @Operation(summary = "Déconnecter toutes les sessions d'un utilisateur")
    public ResponseEntity<?> logoutAllSessions(
            @PathVariable Long userId,
            HttpServletRequest httpRequest) {
        try {
            User currentUser = getCurrentUser(httpRequest);

            // Vérifier permissions
            if (!currentUser.getId().equals(userId) && !currentUser.isManager()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        ErrorResponse.builder()
                                .success(false)
                                .message("Permission refusée")
                                .build()
                );
            }

            authService.logoutAllUserSessions(userId);

            return ResponseEntity.ok(
                    AuthResponse.builder()
                            .success(true)
                            .message("Toutes les sessions ont été fermées")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ErrorResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    // ==================== UTILITAIRES ====================

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token manquant ou invalide");
        }
        return authHeader.substring(7);
    }

    private User getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        return authService.validateSession(token)
                .map(Session::getUser)
                .orElse(null);
    }
}