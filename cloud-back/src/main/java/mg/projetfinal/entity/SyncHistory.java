package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import mg.projetfinal.enums.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "sync_history", indexes = {
        @Index(name = "idx_sync_history_entity", columnList = "entity_type, entity_id, synced_at DESC"),
        @Index(name = "idx_sync_history_status", columnList = "status, synced_at DESC"),
        @Index(name = "idx_sync_history_date", columnList = "synced_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sync_queue_id")
    private Long syncQueueId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 50)
    private EntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private SyncAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 20)
    private SyncDirection direction;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SyncStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "firebase_response", columnDefinition = "jsonb")
    private Map<String, Object> firebaseResponse;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "synced_by")
    private User syncedBy;

    @Column(name = "synced_at")
    @Builder.Default
    private LocalDateTime syncedAt = LocalDateTime.now();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public static SyncHistory fromSyncQueue(SyncQueue queue, SyncStatus finalStatus,
                                            Map<String, Object> response, Integer duration) {
        return SyncHistory.builder()
                .syncQueueId(queue.getId())
                .entityType(queue.getEntityType())
                .entityId(queue.getEntityId())
                .action(queue.getAction())
                .direction(queue.getDirection())
                .status(finalStatus)
                .errorMessage(queue.getErrorMessage())
                .firebaseResponse(response)
                .durationMs(duration)
                .syncedBy(queue.getSyncedBy())
                .build();
    }
}