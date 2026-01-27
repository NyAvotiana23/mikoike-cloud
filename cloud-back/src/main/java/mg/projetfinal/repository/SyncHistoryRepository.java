package mg.projetfinal.repository;

import mg.projetfinal.entity.SyncHistory;
import mg.projetfinal.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SyncHistoryRepository extends JpaRepository<SyncHistory, Long> {

    List<SyncHistory> findByEntityTypeAndEntityIdOrderBySyncedAtDesc(EntityType entityType, Long entityId);

    List<SyncHistory> findByStatusOrderBySyncedAtDesc(SyncStatus status);

    @Query("SELECT sh FROM SyncHistory sh WHERE sh.syncedAt < :date")
    List<SyncHistory> findOlderThan(LocalDateTime date);

    @Query("SELECT COUNT(sh) FROM SyncHistory sh WHERE sh.status = :status AND sh.syncedAt > :since")
    Long countByStatusSince(SyncStatus status, LocalDateTime since);
}