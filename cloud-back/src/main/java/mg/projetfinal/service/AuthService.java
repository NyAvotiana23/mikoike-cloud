package mg.projetfinal.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.UserRepository;
import mg.projetfinal.utils.NetworkUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired private UserRepository userRepo;
    @Autowired private BCryptPasswordEncoder encoder;
    @Autowired private FailedLoginTrackingService trackingService;  // Pour blocage

    private boolean isOnline = NetworkUtils.isInternetAvailable();

    public User register(User user) {
        user.setPasswordHash(encoder.encode(user.getPasswordHash()));
        if (isOnline) {
            try {
                // Créer dans Firebase
                String uid = FirebaseAuth.getInstance().createUser(...).getUid();
                user.setFirebaseUid(uid);
                user.setFirebaseSynced(true);
            } catch (FirebaseAuthException e) {
                user.setFirebaseSyncError(e.getMessage());
            }
        }
        return userRepo.save(user);
    }

    public String login(String email, String pwd) {
        if (trackingService.isBlocked(email)) throw new RuntimeException("Compte bloqué");

        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null || !encoder.matches(pwd, user.getPasswordHash())) {
            trackingService.recordFailedAttempt(email);
            throw new RuntimeException("Invalid credentials");
        }

        if (isOnline) {
            // Vérifier Firebase
            FirebaseAuth.getInstance().getUserByEmail(email);
        }

        trackingService.resetAttempts(email);
        // Générer token JWT ou session
        return "token";  // Implémentez JWT avec spring-security-jwt
    }

    public void updateUser(Long id, User updates) {
        // Logique update, sync Firebase si online
    }

    // Limite tentatives : Utilisez FailedLoginTracking
    // Durée sessions : Configurez dans Security (ou custom SessionListener)
    // API reset blocage : Endpoint pour Manager
}