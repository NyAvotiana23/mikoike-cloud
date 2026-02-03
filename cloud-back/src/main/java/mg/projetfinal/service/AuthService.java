package mg.projetfinal.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.*;
import mg.projetfinal.enums.FailureReason;
import mg.projetfinal.repository.*;
import mg.projetfinal.utils.NetworkUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SessionRepository sessionRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final FailedLoginTrackingRepository failedLoginTrackingRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${auth.max-attempts:3}")
    private int maxAttempts;

    @Value("${session.expiry-minutes:30}")
    private int sessionExpiryMinutes;

    @Value("${auth.lockout-duration-minutes:30}")
    private int lockoutDurationMinutes;

    @Value("${app.mode:online}")
    private String appMode;

    // ==================== INSCRIPTION ====================

    @Transactional
    public User register(String email, String password, String name, User createdBy) {
        // Vérifier si email existe déjà
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Récupérer le rôle par défaut (UTILISATEUR)
        Role defaultRole = roleRepository.findByCode("UTILISATEUR")
                .orElseThrow(() -> new RuntimeException("Rôle UTILISATEUR introuvable"));

        // Créer l'utilisateur
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .name(name)
                .role(defaultRole)
                .firebaseSynced(false)
                .isLocked(false)
                .failedAttempts(0)
                .createdBy(createdBy)
                .build();

        // Synchronisation Firebase si mode online
        if (isOnline()) {
            try {
                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setEmail(email)
                        .setPassword(password)
                        .setDisplayName(name);

                UserRecord firebaseUser = FirebaseAuth.getInstance().createUser(request);
                user.setFirebaseUid(firebaseUser.getUid());
                user.setFirebaseSynced(true);
                user.setSyncedAt(LocalDateTime.now());

                log.info("User créé dans Firebase: {}", firebaseUser.getUid());
            } catch (FirebaseAuthException e) {
                user.setFirebaseSyncError(e.getMessage());
                log.error("Erreur création Firebase: {}", e.getMessage());
            }
        }

        return userRepository.save(user);
    }

    // ==================== CONNEXION ====================

    @Transactional
    public Session login(String email, String password, HttpServletRequest request) {
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        // Vérifier blocage par email
        Optional<FailedLoginTracking> trackingOpt = failedLoginTrackingRepository.findByEmail(email);
        if (trackingOpt.isPresent() && trackingOpt.get().isCurrentlyBlocked()) {
            recordLoginAttempt(email, null, false, FailureReason.ACCOUNT_LOCKED, ipAddress, userAgent);
            throw new RuntimeException("Compte bloqué jusqu'à " + trackingOpt.get().getBlockedUntil());
        }

        // Chercher l'utilisateur
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            recordLoginAttempt(email, null, false, FailureReason.USER_NOT_FOUND, ipAddress, userAgent);
            handleFailedLogin(email, null);
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        User user = userOpt.get();

        // Vérifier si le compte est verrouillé
        if (user.isAccountLocked()) {
            recordLoginAttempt(email, user, false, FailureReason.ACCOUNT_LOCKED, ipAddress, userAgent);
            throw new RuntimeException("Compte verrouillé jusqu'à " + user.getLockedUntil());
        }

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            recordLoginAttempt(email, user, false, FailureReason.INVALID_PASSWORD, ipAddress, userAgent);
            handleFailedLogin(email, user);
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        // Vérifier Firebase si online
//        if (isOnline()) {
//            try {
//                FirebaseAuth.getInstance().getUserByEmail(email);
//            } catch (FirebaseAuthException e) {
//                recordLoginAttempt(email, user, false, FailureReason.FIREBASE_ERROR, ipAddress, userAgent);
//                log.error("Erreur Firebase lors du login: {}", e.getMessage());
//                throw new RuntimeException("Erreur de synchronisation Firebase");
//            }
//        }

        // Connexion réussie
        recordLoginAttempt(email, user, true, null, ipAddress, userAgent);
        resetFailedAttempts(email, user);

        // Créer une session
        return createSession(user, ipAddress, userAgent);
    }

    // ==================== MODIFICATION USER ====================

    @Transactional
    public User updateUser(Long userId, String name, String password, User modifiedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Vérifier les permissions (seul le user lui-même ou un manager peut modifier)
        if (!modifiedBy.getId().equals(userId) && !modifiedBy.isManager()) {
            throw new RuntimeException("Permission refusée");
        }

        // Mettre à jour les infos
        if (name != null && !name.isEmpty()) {
            user.setName(name);
        }

        if (password != null && !password.isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }

        // Synchroniser avec Firebase si online
        if (isOnline() && user.getFirebaseUid() != null) {
            try {
                UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(user.getFirebaseUid());

                if (name != null && !name.isEmpty()) {
                    request.setDisplayName(name);
                }
                if (password != null && !password.isEmpty()) {
                    request.setPassword(password);
                }

                FirebaseAuth.getInstance().updateUser(request);
                user.setFirebaseSynced(true);
                user.setSyncedAt(LocalDateTime.now());
                user.setFirebaseSyncError(null);

                log.info("User mis à jour dans Firebase: {}", user.getFirebaseUid());
            } catch (FirebaseAuthException e) {
                user.setFirebaseSynced(false);
                user.setFirebaseSyncError(e.getMessage());
                log.error("Erreur mise à jour Firebase: {}", e.getMessage());
            }
        }

        return userRepository.save(user);
    }

    // ==================== GESTION SESSION ====================

    private Session createSession(User user, String ipAddress, String deviceInfo) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(sessionExpiryMinutes);

        Session session = Session.builder()
                .user(user)
                .token(token)
                .ipAddress(ipAddress)
                .deviceInfo(deviceInfo)
                .expiresAt(expiresAt)
                .isActive(true)
                .build();

        return sessionRepository.save(session);
    }

    public Optional<Session> validateSession(String token) {
        Optional<Session> sessionOpt = sessionRepository.findByToken(token);

        if (sessionOpt.isEmpty()) {
            return Optional.empty();
        }

        Session session = sessionOpt.get();

        if (!session.isValid()) {
            return Optional.empty();
        }

        // Mettre à jour l'activité
        session.updateActivity();
        sessionRepository.save(session);

        return Optional.of(session);
    }

    @Transactional
    public void logout(String token) {
        sessionRepository.findByToken(token).ifPresent(session -> {
            session.invalidate();
            sessionRepository.save(session);
        });
    }

    @Transactional
    public void logoutAllUserSessions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        sessionRepository.invalidateAllUserSessions(user);
    }

    // ==================== GESTION TENTATIVES ÉCHOUÉES ====================

    private void recordLoginAttempt(String email, User user, boolean success,
                                    FailureReason reason, String ipAddress, String userAgent) {
        LoginAttempt attempt = LoginAttempt.builder()
                .email(email)
                .user(user)
                .success(success)
                .failureReason(reason)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        loginAttemptRepository.save(attempt);
    }

    @Transactional
    public void handleFailedLogin(String email, User user) {
        // Récupérer ou créer le tracking
        FailedLoginTracking tracking = failedLoginTrackingRepository.findByEmail(email)
                .orElse(FailedLoginTracking.builder()
                        .email(email)
                        .failedCount(0)
                        .isBlocked(false)
                        .build());

        tracking.recordFailedAttempt();

        // Bloquer si nombre max d'essais atteint
        if (tracking.getFailedCount() >= maxAttempts) {
            tracking.blockAccount(lockoutDurationMinutes,
                    "Trop de tentatives de connexion échouées (" + maxAttempts + ")");

            // Bloquer aussi l'utilisateur dans la table users si il existe
            if (user != null) {
                user.lockAccount(lockoutDurationMinutes);
                userRepository.save(user);
            }

            log.warn("Compte bloqué pour {}: {} tentatives échouées", email, tracking.getFailedCount());
        }

        failedLoginTrackingRepository.save(tracking);
    }

    @Transactional
    public void resetFailedAttempts(String email, User user) {
        // Reset tracking
        failedLoginTrackingRepository.findByEmail(email).ifPresent(tracking -> {
            tracking.reset();
            failedLoginTrackingRepository.save(tracking);
        });

        // Reset user
        if (user != null) {
            user.resetFailedAttempts();
            user.unlockAccount();
            userRepository.save(user);
        }
    }

    // ==================== API DÉBLOCAGE (MANAGER) ====================

    @Transactional
    public void unlockAccount(String email, User unlockedBy) {
        if (!unlockedBy.isManager()) {
            throw new RuntimeException("Seul un Manager peut débloquer un compte");
        }

        // Débloquer dans failed_login_tracking
        FailedLoginTracking tracking = failedLoginTrackingRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun blocage trouvé pour cet email"));

        tracking.unblock(unlockedBy);
        failedLoginTrackingRepository.save(tracking);

        // Débloquer dans users
        userRepository.findByEmail(email).ifPresent(user -> {
            user.unlockAccount();
            userRepository.save(user);
        });

        log.info("Compte {} débloqué par le Manager {}", email, unlockedBy.getEmail());
    }

    // ==================== UTILITAIRES ====================

    private boolean isOnline() {
        return "online".equalsIgnoreCase(appMode) && NetworkUtils.isInternetAvailable();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    // ==================== NETTOYAGE SESSIONS EXPIRÉES ====================

    @Transactional
    public void cleanupExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expirationDate = now.minusDays(7); // Garder 7 jours d'historique
        sessionRepository.deleteExpiredSessions(expirationDate);
        log.info("Sessions expirées nettoyées");
    }
}