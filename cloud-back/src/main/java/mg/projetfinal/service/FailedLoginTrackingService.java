package mg.projetfinal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.FailedLoginTracking;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.FailedLoginTrackingRepository;
import mg.projetfinal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FailedLoginTrackingService {

    private final FailedLoginTrackingRepository failedLoginTrackingRepository;
    private final UserRepository userRepository;

    /**
     * Gère l'échec de connexion dans une transaction séparée
     * Retourne le nombre de tentatives restantes
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int handleFailedLogin(String email, User user, int maxAttempts, int lockoutDurationMinutes) {
        // Récupérer ou créer le tracking
        FailedLoginTracking tracking = failedLoginTrackingRepository.findByEmail(email)
                .orElse(FailedLoginTracking.builder()
                        .email(email)
                        .failedCount(0)
                        .isBlocked(false)
                        .build());

        // Incrémenter
        tracking.recordFailedAttempt();
        failedLoginTrackingRepository.save(tracking);

        int remainingAttempts = maxAttempts - tracking.getFailedCount();

        // Bloquer si limite atteinte
        if (tracking.getFailedCount() >= maxAttempts) {
            tracking.blockAccount(lockoutDurationMinutes,
                    "Trop de tentatives de connexion échouées (" + maxAttempts + ")");
            failedLoginTrackingRepository.save(tracking);

            user.lockAccount(lockoutDurationMinutes);
            userRepository.save(user);

            log.warn("Compte bloqué pour {}: {} tentatives échouées", email, tracking.getFailedCount());
            return 0;
        }

        return remainingAttempts;
    }
}