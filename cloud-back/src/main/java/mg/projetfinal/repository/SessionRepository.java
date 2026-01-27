package mg.projetfinal.repository;


import mg.projetfinal.entity.Session;
import mg.projetfinal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findByToken(String token);
    List<Session> findByUserAndIsActiveTrue(User user);

    @Query("SELECT s FROM Session s WHERE s.expiresAt < :now")
    List<Session> findExpiredSessions(LocalDateTime now);

    @Modifying
    @Query("UPDATE Session s SET s.isActive = false WHERE s.user = :user")
    void invalidateAllUserSessions(User user);

    @Modifying
    @Query("DELETE FROM Session s WHERE s.expiresAt < :expirationDate")
    void deleteExpiredSessions(LocalDateTime expirationDate);
}