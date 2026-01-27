package mg.projetfinal.repository;

import mg.projetfinal.entity.LoginAttempt;
import mg.projetfinal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    List<LoginAttempt> findByEmailOrderByAttemptedAtDesc(String email);
    List<LoginAttempt> findByUserOrderByAttemptedAtDesc(User user);

    @Query("SELECT la FROM LoginAttempt la WHERE la.email = :email AND la.attemptedAt > :since ORDER BY la.attemptedAt DESC")
    List<LoginAttempt> findRecentAttemptsByEmail(String email, LocalDateTime since);

    @Query("SELECT la FROM LoginAttempt la WHERE la.email = :email AND la.success = false AND la.attemptedAt > :since")
    List<LoginAttempt> findFailedAttemptsSince(String email, LocalDateTime since);
}