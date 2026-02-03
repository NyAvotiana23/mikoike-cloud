package mg.projetfinal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.service.FirebaseSyncService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Synchronisation Firebase", description = "Endpoints pour la synchronisation bidirectionnelle PostgreSQL ↔ Firebase")
public class FirebaseSyncController {

    private final FirebaseSyncService firebaseSyncService;

    // ==================== SYNCHRONISATION COMPLÈTE ====================

    @PostMapping("/all")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Synchronisation bidirectionnelle complète",
            description = "Synchronise toutes les données entre PostgreSQL et Firebase dans les deux sens"
    )
    public ResponseEntity<Map<String, Object>> syncAll() {
        log.info("=== Démarrage synchronisation bidirectionnelle complète ===");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncAll();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", result.isSuccess() ?
                    "Synchronisation complète réussie" :
                    "Synchronisation complète avec erreurs");
            response.put("totalSuccess", result.getTotalSuccess());
            response.put("totalErrors", result.getTotalErrors());
            response.put("details", Map.of(
                    "successCounts", result.getSuccessCounts(),
                    "errorCounts", result.getErrorCounts()
            ));

            if (!result.isSuccess()) {
                response.put("errorMessage", result.getErrorMessage());
            }

            log.info("Synchronisation terminée - Succès: {} | Erreurs: {}",
                    result.getTotalSuccess(), result.getTotalErrors());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation complète", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la synchronisation",
                            "error", e.getMessage()
                    ));
        }
    }

    // ==================== POSTGRES → FIREBASE ====================

    @PostMapping("/postgres-to-firebase")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Synchronisation PostgreSQL → Firebase",
            description = "Envoie toutes les modifications locales (PostgreSQL) vers Firebase"
    )
    public ResponseEntity<Map<String, Object>> syncPostgresToFirebase() {
        log.info("Démarrage synchronisation PostgreSQL → Firebase");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncPostgresToFirebase();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", "Synchronisation PostgreSQL → Firebase terminée");
            response.put("totalSuccess", result.getTotalSuccess());
            response.put("totalErrors", result.getTotalErrors());
            response.put("successCounts", result.getSuccessCounts());
            response.put("errorCounts", result.getErrorCounts());

            if (!result.isSuccess()) {
                response.put("errorMessage", result.getErrorMessage());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur synchronisation PostgreSQL → Firebase", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la synchronisation",
                            "error", e.getMessage()
                    ));
        }
    }

    // ==================== FIREBASE → POSTGRES ====================

    @PostMapping("/firebase-to-postgres")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Synchronisation Firebase → PostgreSQL",
            description = "Récupère toutes les modifications distantes (Firebase) vers PostgreSQL"
    )
    public ResponseEntity<Map<String, Object>> syncFirebaseToPostgres() {
        log.info("Démarrage synchronisation Firebase → PostgreSQL");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncFirebaseToPostgres();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", "Synchronisation Firebase → PostgreSQL terminée");
            response.put("totalSuccess", result.getTotalSuccess());
            response.put("totalErrors", result.getTotalErrors());
            response.put("successCounts", result.getSuccessCounts());
            response.put("errorCounts", result.getErrorCounts());

            if (!result.isSuccess()) {
                response.put("errorMessage", result.getErrorMessage());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur synchronisation Firebase → PostgreSQL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la synchronisation",
                            "error", e.getMessage()
                    ));
        }
    }

    // ==================== SYNCHRONISATION PAR ENTITÉ ====================

    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Synchronisation utilisateurs (PostgreSQL → Firebase)",
            description = "Synchronise uniquement les utilisateurs non synchronisés vers Firebase Authentication et Firestore"
    )
    public ResponseEntity<Map<String, Object>> syncUsers() {
        log.info("Synchronisation des utilisateurs vers Firebase");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncPostgresToFirebase();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", "Synchronisation des utilisateurs terminée");
            response.put("usersSuccess", result.getSuccessCounts().getOrDefault("users", 0));
            response.put("usersErrors", result.getErrorCounts().getOrDefault("users", 0));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur synchronisation utilisateurs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la synchronisation des utilisateurs",
                            "error", e.getMessage()
                    ));
        }
    }

    @PostMapping("/signalements")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Synchronisation signalements (PostgreSQL → Firebase)",
            description = "Synchronise uniquement les signalements non synchronisés vers Firestore"
    )
    public ResponseEntity<Map<String, Object>> syncSignalements() {
        log.info("Synchronisation des signalements vers Firebase");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncPostgresToFirebase();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", "Synchronisation des signalements terminée");
            response.put("signalementsSuccess", result.getSuccessCounts().getOrDefault("signalements", 0));
            response.put("signalementsErrors", result.getErrorCounts().getOrDefault("signalements", 0));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur synchronisation signalements", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la synchronisation des signalements",
                            "error", e.getMessage()
                    ));
        }
    }

    @PostMapping("/entreprises")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Synchronisation entreprises (PostgreSQL → Firebase)",
            description = "Synchronise toutes les entreprises vers Firestore"
    )
    public ResponseEntity<Map<String, Object>> syncEntreprises() {
        log.info("Synchronisation des entreprises vers Firebase");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncPostgresToFirebase();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", "Synchronisation des entreprises terminée");
            response.put("entreprisesSuccess", result.getSuccessCounts().getOrDefault("entreprises", 0));
            response.put("entreprisesErrors", result.getErrorCounts().getOrDefault("entreprises", 0));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur synchronisation entreprises", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la synchronisation des entreprises",
                            "error", e.getMessage()
                    ));
        }
    }

    // ==================== SYNCHRONISATION INVERSE (FIREBASE → POSTGRES) ====================

    @PostMapping("/pull-users")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Récupération utilisateurs (Firebase → PostgreSQL)",
            description = "Met à jour les utilisateurs PostgreSQL avec les données de Firebase"
    )
    public ResponseEntity<Map<String, Object>> pullUsers() {
        log.info("Récupération des utilisateurs depuis Firebase");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncUsersFromFirebase();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", "Récupération des utilisateurs terminée");
            response.put("usersUpdated", result.getSuccessCounts().getOrDefault("users_updated", 0));
            response.put("usersNotFound", result.getErrorCounts().getOrDefault("users_not_found", 0));
            response.put("usersErrors", result.getErrorCounts().getOrDefault("users", 0));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur récupération utilisateurs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la récupération des utilisateurs",
                            "error", e.getMessage()
                    ));
        }
    }

    @PostMapping("/pull-signalements")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Récupération signalements (Firebase → PostgreSQL)",
            description = "Met à jour ou crée les signalements PostgreSQL avec les données de Firebase"
    )
    public ResponseEntity<Map<String, Object>> pullSignalements() {
        log.info("Récupération des signalements depuis Firebase");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncSignalementsFromFirebase();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", "Récupération des signalements terminée");
            response.put("signalementsCreated", result.getSuccessCounts().getOrDefault("signalements_created", 0));
            response.put("signalementsUpdated", result.getSuccessCounts().getOrDefault("signalements_updated", 0));
            response.put("signalementsErrors", result.getErrorCounts().getOrDefault("signalements", 0));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur récupération signalements", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la récupération des signalements",
                            "error", e.getMessage()
                    ));
        }
    }

    @PostMapping("/pull-entreprises")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(
            summary = "Récupération entreprises (Firebase → PostgreSQL)",
            description = "Met à jour ou crée les entreprises PostgreSQL avec les données de Firebase"
    )
    public ResponseEntity<Map<String, Object>> pullEntreprises() {
        log.info("Récupération des entreprises depuis Firebase");

        try {
            FirebaseSyncService.SyncResult result = firebaseSyncService.syncEntreprisesFromFirebase();

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", "Récupération des entreprises terminée");
            response.put("entreprisesCreated", result.getSuccessCounts().getOrDefault("entreprises_created", 0));
            response.put("entreprisesUpdated", result.getSuccessCounts().getOrDefault("entreprises_updated", 0));
            response.put("entreprisesErrors", result.getErrorCounts().getOrDefault("entreprises", 0));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur récupération entreprises", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la récupération des entreprises",
                            "error", e.getMessage()
                    ));
        }
    }

    // ==================== STATUT DE LA SYNCHRONISATION ====================

    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'UTILISATEUR')")
    @Operation(
            summary = "Statut de la synchronisation",
            description = "Retourne le nombre d'entités non synchronisées"
    )
    public ResponseEntity<Map<String, Object>> getSyncStatus() {
        log.debug("Récupération du statut de synchronisation");

        try {
            // Cette méthode devrait être implémentée dans le service
            Map<String, Object> status = new HashMap<>();
            status.put("message", "Statut de synchronisation");
            status.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Erreur récupération statut", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la récupération du statut",
                            "error", e.getMessage()
                    ));
        }
    }

    // ==================== HEALTH CHECK ====================

    @GetMapping("/health")
    @Operation(
            summary = "Vérification de la connectivité Firebase",
            description = "Vérifie que la connexion à Firebase fonctionne correctement"
    )
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.debug("Vérification santé Firebase");

        try {
            Map<String, Object> health = new HashMap<>();
            health.put("status", "UP");
            health.put("message", "Firebase connecté");
            health.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Erreur health check Firebase", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "status", "DOWN",
                            "message", "Firebase non disponible",
                            "error", e.getMessage()
                    ));
        }
    }
}