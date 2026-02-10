package mg.projetfinal.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.dto.PushNotificationRequest;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.SignalementAction;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebasePushNotificationService {

    private final UserRepository userRepository;

    /**
     * Vérifie si Firebase est disponible pour les notifications
     */
    private boolean isFirebaseAvailable() {
        return !FirebaseApp.getApps().isEmpty();
    }

    /**
     * Envoie une notification push à un utilisateur spécifique
     */
    public void sendNotificationToUser(User user, String title, String body, Map<String, String> data) {
        if (!isFirebaseAvailable()) {
            log.info("Firebase non disponible - Notification non envoyée à l'utilisateur {}", user.getId());
            return;
        }

        if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
            log.warn("Aucun token FCM pour l'utilisateur ID: {}", user.getId());
            return;
        }

        try {
            PushNotificationRequest request = PushNotificationRequest.builder()
                    .token(user.getFcmToken())
                    .title(title)
                    .body(body)
                    .data(data)
                    .build();

            sendNotificationToToken(request);
            log.info("Notification envoyée à l'utilisateur ID: {}", user.getId());
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de la notification à l'utilisateur {}: {}", user.getId(), e.getMessage());
        }
    }

    /**
     * Envoie une notification push à un token spécifique
     */
    public String sendNotificationToToken(PushNotificationRequest request) {
        if (!isFirebaseAvailable()) {
            log.info("Firebase non disponible - Notification non envoyée");
            return null;
        }

        try {
            Message.Builder messageBuilder = Message.builder()
                    .setToken(request.getToken())
                    .setNotification(Notification.builder()
                            .setTitle(request.getTitle())
                            .setBody(request.getBody())
                            .build());

            // Ajouter les données personnalisées si présentes
            if (request.getData() != null && !request.getData().isEmpty()) {
                messageBuilder.putAllData(request.getData());
            }

            // Configuration Android
            messageBuilder.setAndroidConfig(AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .setNotification(AndroidNotification.builder()
                            .setSound("default")
                            .setClickAction("OPEN_SIGNALEMENT")
                            .build())
                    .build());

            // Configuration iOS (APNs)
            messageBuilder.setApnsConfig(ApnsConfig.builder()
                    .setAps(Aps.builder()
                            .setSound("default")
                            .setBadge(1)
                            .build())
                    .build());

            Message message = messageBuilder.build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Notification envoyée avec succès. Response: {}", response);
            return response;

        } catch (FirebaseMessagingException e) {
            log.error("Erreur Firebase lors de l'envoi de la notification: {}", e.getMessage());

            // Si le token est invalide, on le supprime
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED ||
                e.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT) {
                log.warn("Token FCM invalide, suppression recommandée");
            }
            return null;
        }
    }

    /**
     * Envoie une notification à tous les managers
     */
    public void notifyAllManagers(String title, String body, Map<String, String> data) {
        if (!isFirebaseAvailable()) {
            log.info("Firebase non disponible - Notifications managers non envoyées");
            return;
        }

        List<User> managers = userRepository.findAll().stream()
                .filter(User::isManager)
                .filter(user -> user.getFcmToken() != null && !user.getFcmToken().isEmpty())
                .collect(Collectors.toList());

        log.info("Envoi de notifications à {} managers", managers.size());

        for (User manager : managers) {
            sendNotificationToUser(manager, title, body, data);
        }
    }

    /**
     * Notification lors de la création d'un nouveau signalement
     */
    public void notifyNewSignalement(Signalement signalement) {
        Map<String, String> data = new HashMap<>();
        data.put("type", "NEW_SIGNALEMENT");
        data.put("signalementId", signalement.getId().toString());

        String title = "Nouveau signalement";
        String body = String.format("Un nouveau signalement a été créé : %s",
                truncateText(signalement.getDescription(), 50));

        notifyAllManagers(title, body, data);
    }

    /**
     * Notification lors du changement de statut d'un signalement
     */
    public void notifyStatusChange(Signalement signalement, String oldStatus, String newStatus) {
        // Notifier le propriétaire du signalement
        User owner = signalement.getUser();

        Map<String, String> data = new HashMap<>();
        data.put("type", "STATUS_CHANGE");
        data.put("signalementId", signalement.getId().toString());
        data.put("oldStatus", oldStatus);
        data.put("newStatus", newStatus);

        String title = "Mise à jour de votre signalement";
        String body = String.format("Le statut de votre signalement est passé de '%s' à '%s'",
                oldStatus, newStatus);

        sendNotificationToUser(owner, title, body, data);

        // Notifier aussi tous les managers
        String managerTitle = "Changement de statut";
        String managerBody = String.format("Le signalement #%d est passé de '%s' à '%s'",
                signalement.getId(), oldStatus, newStatus);

        notifyAllManagers(managerTitle, managerBody, data);
    }

    /**
     * Notification lors de la création d'une action sur un signalement
     */
    public void notifyNewAction(SignalementAction action) {
        Signalement signalement = action.getSignalement();
        User owner = signalement.getUser();

        Map<String, String> data = new HashMap<>();
        data.put("type", "NEW_ACTION");
        data.put("signalementId", signalement.getId().toString());
        data.put("actionId", action.getId().toString());

        String title = "Action sur votre signalement";
        String body = String.format("Une action a été créée : %s",
                truncateText(action.getDescriptionTravaux(), 50));

        sendNotificationToUser(owner, title, body, data);
    }

    /**
     * Notification lors de l'assignation d'une entreprise à une action
     */
    public void notifyEntrepriseAssigned(SignalementAction action) {
        Signalement signalement = action.getSignalement();
        User owner = signalement.getUser();

        Map<String, String> data = new HashMap<>();
        data.put("type", "ENTREPRISE_ASSIGNED");
        data.put("signalementId", signalement.getId().toString());
        data.put("actionId", action.getId().toString());
        data.put("entrepriseId", action.getEntreprise().getId().toString());

        String title = "Entreprise assignée";
        String body = String.format("L'entreprise '%s' a été assignée à votre signalement",
                action.getEntreprise().getNom());

        sendNotificationToUser(owner, title, body, data);
    }

    /**
     * Notification lors du démarrage des travaux
     */
    public void notifyTravauxStarted(SignalementAction action) {
        Signalement signalement = action.getSignalement();
        User owner = signalement.getUser();

        Map<String, String> data = new HashMap<>();
        data.put("type", "TRAVAUX_STARTED");
        data.put("signalementId", signalement.getId().toString());
        data.put("actionId", action.getId().toString());

        String title = "Travaux démarrés";
        String body = "Les travaux ont commencé sur votre signalement";

        sendNotificationToUser(owner, title, body, data);
    }

    /**
     * Notification lors de la fin des travaux
     */
    public void notifyTravauxFinished(SignalementAction action) {
        Signalement signalement = action.getSignalement();
        User owner = signalement.getUser();

        Map<String, String> data = new HashMap<>();
        data.put("type", "TRAVAUX_FINISHED");
        data.put("signalementId", signalement.getId().toString());
        data.put("actionId", action.getId().toString());

        String title = "Travaux terminés";
        String body = "Les travaux sont terminés sur votre signalement";

        sendNotificationToUser(owner, title, body, data);
    }

    /**
     * Met à jour le token FCM d'un utilisateur
     */
    public void updateUserFcmToken(Long userId, String fcmToken) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setFcmToken(fcmToken);
            userRepository.save(user);
            log.info("Token FCM mis à jour pour l'utilisateur ID: {}", userId);
        });
    }

    /**
     * Supprime le token FCM d'un utilisateur (lors de la déconnexion)
     */
    public void removeUserFcmToken(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setFcmToken(null);
            userRepository.save(user);
            log.info("Token FCM supprimé pour l'utilisateur ID: {}", userId);
        });
    }

    /**
     * Tronque le texte à une longueur maximale
     */
    private String truncateText(String text, int maxLength) {
        if (text == null) {
            return "";
        }
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + "...";
    }
}
