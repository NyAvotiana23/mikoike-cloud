package mg.projetfinal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.User;
import mg.projetfinal.service.FirebasePushNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final FirebasePushNotificationService pushNotificationService;

    /**
     * POST /api/notifications/fcm-token
     * Enregistre ou met à jour le token FCM de l'utilisateur connecté
     */
    @PostMapping("/fcm-token")
    public ResponseEntity<Map<String, String>> registerFcmToken(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {

        String fcmToken = body.get("fcmToken");
        if (fcmToken == null || fcmToken.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le token FCM est requis"));
        }

        log.info("POST /api/notifications/fcm-token - Enregistrement du token FCM pour l'utilisateur {}", currentUser.getId());
        pushNotificationService.updateUserFcmToken(currentUser.getId(), fcmToken);

        return ResponseEntity.ok(Map.of("message", "Token FCM enregistré avec succès"));
    }

    /**
     * DELETE /api/notifications/fcm-token
     * Supprime le token FCM de l'utilisateur connecté (déconnexion)
     */
    @DeleteMapping("/fcm-token")
    public ResponseEntity<Map<String, String>> removeFcmToken(
            @AuthenticationPrincipal User currentUser) {

        log.info("DELETE /api/notifications/fcm-token - Suppression du token FCM pour l'utilisateur {}", currentUser.getId());
        pushNotificationService.removeUserFcmToken(currentUser.getId());

        return ResponseEntity.ok(Map.of("message", "Token FCM supprimé avec succès"));
    }
}
