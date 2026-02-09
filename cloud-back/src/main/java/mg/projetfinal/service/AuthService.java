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
import java.util.List;
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
    private final FailedLoginTrackingService failedLoginTrackingService;

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
//        if (isOnline()) {
//            try {
//                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
//                        .setEmail(email)
//                        .setPassword(password)
//                        .setDisplayName(name);
//
//                UserRecord firebaseUser = FirebaseAuth.getInstance().createUser(request);
//                user.setFirebaseUid(firebaseUser.getUid());
//                user.setFirebaseSynced(true);
//                user.setSyncedAt(LocalDateTime.now());
//
//                log.info("User créé dans Firebase: {}", firebaseUser.getUid());
//            } catch (FirebaseAuthException e) {
//                user.setFirebaseSyncError(e.getMessage());
//                log.error("Erreur création Firebase: {}", e.getMessage());
//            }
//        }

        return userRepository.save(user);
    }

    @Transactional
    public User registerAdmin(String email, String password, String name) {
        // Vérifier si email existe déjà
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Récupérer le rôle MANAGER
        Role managerRole = roleRepository.findByCode("MANAGER")
                .orElseThrow(() -> new RuntimeException("Rôle MANAGER introuvable"));

        // Créer l'utilisateur admin
        User admin = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .name(name)
                .role(managerRole)
                .firebaseSynced(false)
                .isLocked(false)
                .failedAttempts(0)
                .build();

        // Synchronisation Firebase si mode online
        if (isOnline()) {
            try {
                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setEmail(email)
                        .setPassword(password)
                        .setDisplayName(name);

                UserRecord firebaseUser = FirebaseAuth.getInstance().createUser(request);
                admin.setFirebaseUid(firebaseUser.getUid());
                admin.setFirebaseSynced(true);
                admin.setSyncedAt(LocalDateTime.now());

                log.info("Admin créé dans Firebase: {}", firebaseUser.getUid());
            } catch (FirebaseAuthException e) {
                admin.setFirebaseSyncError(e.getMessage());
                log.error("Erreur création Firebase admin: {}", e.getMessage());
            }
        }

        User savedAdmin = userRepository.save(admin);
        log.info("Admin créé avec succès: {}", email);
        return savedAdmin;
    }

    // ==================== CONNEXION ====================

    @Transactional
    public Session login(String email, String password, HttpServletRequest request) {
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        // Étape 1: Vérifier blocage dans failed_login_tracking
        Optional<FailedLoginTracking> trackingOpt = failedLoginTrackingRepository.findByEmail(email);
        if (trackingOpt.isPresent()) {
            FailedLoginTracking tracking = trackingOpt.get();
            if (tracking.isCurrentlyBlocked()) {
                recordLoginAttempt(email, null, false, FailureReason.ACCOUNT_LOCKED, ipAddress, userAgent);
                throw new RuntimeException("Compte bloqué jusqu'à " + tracking.getBlockedUntil());
            }
        }

        // Étape 2: Chercher l'utilisateur
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            recordLoginAttempt(email, null, false, FailureReason.USER_NOT_FOUND, ipAddress, userAgent);
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        User user = userOpt.get();

        // Étape 3: Vérifier blocage dans users
        if (user.isAccountLocked()) {
            recordLoginAttempt(email, user, false, FailureReason.ACCOUNT_LOCKED, ipAddress, userAgent);
            throw new RuntimeException("Compte verrouillé jusqu'à " + user.getLockedUntil());
        }

        // Étape 4: Vérifier le mot de passe
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            recordLoginAttempt(email, user, false, FailureReason.INVALID_PASSWORD, ipAddress, userAgent);

            // Utiliser le service avec REQUIRES_NEW pour persister même si exception
            int remainingAttempts = failedLoginTrackingService.handleFailedLogin(email, user, maxAttempts, lockoutDurationMinutes);

            if (remainingAttempts <= 0) {
                throw new RuntimeException("Compte bloqué pour " + lockoutDurationMinutes + " minutes suite à trop de tentatives échouées");
            }

            throw new RuntimeException("Email ou mot de passe incorrect. Tentatives restantes: " + remainingAttempts);
        }

        // Étape 5: Vérifier si déjà connecté
        List<Session> activeSessions = sessionRepository.findByUserAndIsActiveTrue(user);
        for (Session activeSession : activeSessions) {
            if (activeSession.isValid()) {
                throw new RuntimeException("Utilisateur déjà connecté. Veuillez vous déconnecter d'abord ou utiliser /logout-all");
            }
        }

        // Étape 6: Vérifier Firebase si online
//        if (isOnline()) {
//            try {
//                FirebaseAuth.getInstance().getUserByEmail(email);
//            } catch (FirebaseAuthException e) {
//                recordLoginAttempt(email, user, false, FailureReason.FIREBASE_ERROR, ipAddress, userAgent);
//                log.error("Erreur Firebase lors du login: {}", e.getMessage());
//                throw new RuntimeException("Erreur de synchronisation Firebase");
//            }
//        }

        // Étape 7: Connexion réussie - Reset des tentatives échouées
        recordLoginAttempt(email, user, true, null, ipAddress, userAgent);

        // Reset tracking
        if (trackingOpt.isPresent()) {
            FailedLoginTracking tracking = trackingOpt.get();
            tracking.reset();
            failedLoginTrackingRepository.save(tracking);
        }

        // Reset user
        user.resetFailedAttempts();
        userRepository.save(user);

        // Créer une session
        return createSession(user, ipAddress, userAgent);
    }

    @Transactional
    public Session loginManager(String email, String password, HttpServletRequest request) {
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        // Chercher l'utilisateur
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            recordLoginAttempt(email, null, false, FailureReason.USER_NOT_FOUND, ipAddress, userAgent);
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        User user = userOpt.get();

        // Vérifier que c'est un manager
        if (!user.isManager()) {
            recordLoginAttempt(email, user, false, FailureReason.INVALID_PASSWORD, ipAddress, userAgent);
            throw new RuntimeException("Accès réservé aux managers");
        }

        // Vérifier le mot de passe (SANS blocage)
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            recordLoginAttempt(email, user, false, FailureReason.INVALID_PASSWORD, ipAddress, userAgent);
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        // Vérifier si déjà connecté
        List<Session> activeSessions = sessionRepository.findByUserAndIsActiveTrue(user);
        for (Session activeSession : activeSessions) {
            if (activeSession.isValid()) {
                throw new RuntimeException("Utilisateur déjà connecté. Veuillez vous déconnecter d'abord");
            }
        }

        // Vérifier Firebase si online
//        if (isOnline()) {
//            try {
//                FirebaseAuth.getInstance().getUserByEmail(email);
//            } catch (FirebaseAuthException e) {
//                recordLoginAttempt(email, user, false, FailureReason.FIREBASE_ERROR, ipAddress, userAgent);
//                log.error("Erreur Firebase lors du login manager: {}", e.getMessage());
//                throw new RuntimeException("Erreur de synchronisation Firebase");
//            }
//        }

        // Connexion réussie
        recordLoginAttempt(email, user, true, null, ipAddress, userAgent);

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
    public Session logout(String token) {
        Optional<Session> sessionOpt = sessionRepository.findByToken(token);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();

            // Vérifier si la session est déjà invalide
            if (!session.isValid()) {
                throw new RuntimeException("Session déjà déconnectée ou expirée");
            }

            session.invalidate();
            sessionRepository.save(session);
            return session;
        }
        throw new RuntimeException("Session introuvable");
    }

    @Transactional
    public void logoutAllUserSessions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        sessionRepository.invalidateAllUserSessions(user);
    }

    // ==================== UTILITAIRE TEST - LOGOUT ALL ====================

    @Transactional
    public int logoutAllSessions() {
        List<Session> allSessions = sessionRepository.findAll();
        int count = 0;
        for (Session session : allSessions) {
            if (session.getIsActive()) {
                session.invalidate();
                sessionRepository.save(session);
                count++;
            }
        }
        log.info("Toutes les sessions déconnectées: {} sessions", count);
        return count;
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

    // ==================== RESET TENTATIVES ====================

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