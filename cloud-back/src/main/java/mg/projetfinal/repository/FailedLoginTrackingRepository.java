package mg.projetfinal.repository;

import mg.projetfinal.entity.FailedLoginTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FailedLoginTrackingRepository extends JpaRepository<FailedLoginTracking, Long> {
    Optional<FailedLoginTracking> findByEmail(String email);

    @Query("SELECT f FROM FailedLoginTracking f WHERE f.isBlocked = true AND (f.blockedUntil IS NULL OR f.blockedUntil > :now)")
    List<FailedLoginTracking> findCurrentlyBlocked(LocalDateTime now);

    @Query("SELECT f FROM FailedLoginTracking f WHERE f.isBlocked = true AND f.blockedUntil < :now")
    List<FailedLoginTracking> findExpiredBlocks(LocalDateTime now);
}