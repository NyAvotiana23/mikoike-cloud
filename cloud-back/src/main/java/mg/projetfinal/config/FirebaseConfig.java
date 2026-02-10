package mg.projetfinal.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.config.enabled:true}")
    private boolean firebaseEnabled;

    @Value("${firebase.config.file:firebase-service-account.json}")
    private String firebaseConfigFile;

    @Value("${app.mode:offline}")
    private String appMode;

    @PostConstruct
    public void initFirebase() {
        // Si le mode est offline, on peut skip Firebase
//        if ("offline".equalsIgnoreCase(appMode)) {
//            logger.info("Application en mode OFFLINE - Firebase désactivé");
//            return;
//        }

        if (!firebaseEnabled) {
            logger.info("Firebase désactivé via configuration");
            return;
        }

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                Resource resource = new ClassPathResource(firebaseConfigFile);

                if (!resource.exists()) {
                    logger.warn("Fichier Firebase '{}' introuvable. Firebase ne sera pas disponible.", firebaseConfigFile);
                    logger.warn("Pour activer Firebase, placez votre fichier JSON dans src/main/resources/");
                    return;
                }

                try (InputStream serviceAccount = resource.getInputStream()) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();

                    FirebaseApp.initializeApp(options);
                    logger.info("✓ Firebase initialisé avec succès !");
                }
            } else {
                logger.info("Firebase déjà initialisé");
            }
        } catch (FileNotFoundException e) {
            logger.warn("Fichier de configuration Firebase non trouvé: {}", e.getMessage());
            logger.warn("L'application continuera sans Firebase.");
        } catch (IOException e) {
            logger.error("Erreur lors de la lecture du fichier Firebase: {}", e.getMessage());
            logger.warn("L'application continuera sans Firebase.");
        } catch (Exception e) {
            logger.error("Erreur lors de l'initialisation Firebase: {}", e.getMessage(), e);
            logger.warn("L'application continuera sans Firebase.");
        }
    }

    /**
     * Méthode utilitaire pour accéder à Firestore
     * Retourne null si Firebase n'est pas initialisé
     */
    public static com.google.cloud.firestore.Firestore getFirestore() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return FirestoreClient.getFirestore();
            }
            logger.warn("Firebase n'est pas initialisé - Firestore non disponible");
            return null;
        } catch (Exception e) {
            logger.error("Erreur lors de l'accès à Firestore: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Vérifie si Firebase est initialisé
     */
    public static boolean isInitialized() {
        return !FirebaseApp.getApps().isEmpty();
    }

    /**
     * Retourne le mode de l'application
     */
    public String getAppMode() {
        return appMode;
    }
}