package mg.projetfinal.repository;

import mg.projetfinal.entity.SyncQueue;
import mg.projetfinal.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SyncQueueRepository extends JpaRepository<SyncQueue, Long> {

    @Query("SELECT sq FROM SyncQueue sq WHERE sq.status = 'PENDING' AND sq.scheduledAt <= :now ORDER BY sq.priority ASC, sq.scheduledAt ASC")
    List<SyncQueue> findPendingSync(LocalDateTime now);

    Optional<SyncQueue> findByEntityTypeAndEntityIdAndStatus(EntityType entityType, Long entityId, SyncStatus status);

    List<SyncQueue> findByStatusAndRetryCountLessThan(SyncStatus status, Integer maxRetries);

    @Query("SELECT sq FROM SyncQueue sq WHERE sq.status = 'PROCESSING' AND sq.processingStartedAt < :timeout")
    List<SyncQueue> findStuckProcessing(LocalDateTime timeout);
}