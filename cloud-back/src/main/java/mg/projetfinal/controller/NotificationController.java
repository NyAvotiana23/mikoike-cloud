package mg.projetfinal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.dto.FcmTokenRequest;
import mg.projetfinal.dto.PushNotificationRequest;
import mg.projetfinal.entity.Session;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.SessionRepository;
import mg.projetfinal.service.FirebasePushNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "API de gestion des notifications push Firebase")
public class NotificationController {

    private final FirebasePushNotificationService pushNotificationService;
    private final SessionRepository sessionRepository;

    @PostMapping("/fcm-token")
    @Operation(summary = "Enregistrer un token FCM", description = "Enregistre le token FCM de l'appareil pour recevoir les notifications push")
    public ResponseEntity<?> registerFcmToken(
            @RequestHeader("X-Session-Token") String sessionToken,
            @RequestBody FcmTokenRequest request) {

        log.info("Enregistrement du token FCM pour la session: {}", sessionToken);

        Session session = sessionRepository.findByToken(sessionToken)
                .orElse(null);

        if (session == null || session.isExpired()) {
            return ResponseEntity.status(401).body(Map.of("error", "Session invalide ou expirée"));
        }

        User user = session.getUser();
        pushNotificationService.updateUserFcmToken(user.getId(), request.getFcmToken());

        return ResponseEntity.ok(Map.of(
                "message", "Token FCM enregistré avec succès",
                "userId", user.getId()
        ));
    }

    @DeleteMapping("/fcm-token")
    @Operation(summary = "Supprimer le token FCM", description = "Supprime le token FCM de l'utilisateur (utilisé lors de la déconnexion)")
    public ResponseEntity<?> removeFcmToken(
            @RequestHeader("X-Session-Token") String sessionToken) {

        log.info("Suppression du token FCM pour la session: {}", sessionToken);

        Session session = sessionRepository.findByToken(sessionToken)
                .orElse(null);

        if (session == null || session.isExpired()) {
            return ResponseEntity.status(401).body(Map.of("error", "Session invalide ou expirée"));
        }

        User user = session.getUser();
        pushNotificationService.removeUserFcmToken(user.getId());

        return ResponseEntity.ok(Map.of("message", "Token FCM supprimé avec succès"));
    }

    @PostMapping("/test")
    @Operation(summary = "Tester une notification", description = "Envoie une notification de test à l'utilisateur connecté")
    public ResponseEntity<?> testNotification(
            @RequestHeader("X-Session-Token") String sessionToken) {

        log.info("Test de notification pour la session: {}", sessionToken);

        Session session = sessionRepository.findByToken(sessionToken)
                .orElse(null);

        if (session == null || session.isExpired()) {
            return ResponseEntity.status(401).body(Map.of("error", "Session invalide ou expirée"));
        }

        User user = session.getUser();

        if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aucun token FCM enregistré pour cet utilisateur"));
        }

        Map<String, String> data = new HashMap<>();
        data.put("type", "TEST");
        data.put("timestamp", String.valueOf(System.currentTimeMillis()));

        pushNotificationService.sendNotificationToUser(
                user,
                "Test de notification",
                "Ceci est une notification de test",
                data
        );

        return ResponseEntity.ok(Map.of("message", "Notification de test envoyée"));
    }

    @PostMapping("/send")
    @Operation(summary = "Envoyer une notification personnalisée", description = "Envoie une notification personnalisée (réservé aux managers)")
    public ResponseEntity<?> sendCustomNotification(
            @RequestHeader("X-Session-Token") String sessionToken,
            @RequestBody PushNotificationRequest request) {

        log.info("Envoi de notification personnalisée");

        Session session = sessionRepository.findByToken(sessionToken)
                .orElse(null);

        if (session == null || session.isExpired()) {
            return ResponseEntity.status(401).body(Map.of("error", "Session invalide ou expirée"));
        }

        User user = session.getUser();

        if (!user.isManager()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé. Seuls les managers peuvent envoyer des notifications personnalisées."));
        }

        if (request.getToken() == null || request.getToken().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token FCM requis"));
        }

        String response = pushNotificationService.sendNotificationToToken(request);

        if (response != null) {
            return ResponseEntity.ok(Map.of(
                    "message", "Notification envoyée avec succès",
                    "response", response
            ));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Échec de l'envoi de la notification"));
        }
    }

    @PostMapping("/broadcast")
    @Operation(summary = "Diffuser une notification aux managers", description = "Envoie une notification à tous les managers (réservé aux admins)")
    public ResponseEntity<?> broadcastToManagers(
            @RequestHeader("X-Session-Token") String sessionToken,
            @RequestBody PushNotificationRequest request) {

        log.info("Diffusion de notification aux managers");

        Session session = sessionRepository.findByToken(sessionToken)
                .orElse(null);

        if (session == null || session.isExpired()) {
            return ResponseEntity.status(401).body(Map.of("error", "Session invalide ou expirée"));
        }

        User user = session.getUser();

        // Vérifier si l'utilisateur est admin
        if (user.getRole() == null || !"ADMIN".equalsIgnoreCase(user.getRole().getCode())) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé. Seuls les admins peuvent diffuser des notifications."));
        }

        pushNotificationService.notifyAllManagers(request.getTitle(), request.getBody(), request.getData());

        return ResponseEntity.ok(Map.of("message", "Notification diffusée aux managers"));
    }
}


