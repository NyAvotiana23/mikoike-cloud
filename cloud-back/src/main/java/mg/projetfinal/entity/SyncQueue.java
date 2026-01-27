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
@Table(name = "sync_queue", indexes = {
        @Index(name = "idx_sync_queue_status", columnList = "status, priority, scheduled_at"),
        @Index(name = "idx_sync_queue_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_sync_queue_created_at", columnList = "created_at"),
        @Index(name = "idx_sync_queue_retry", columnList = "retry_count, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 50)
    private EntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "firebase_id", length = 128)
    private String firebaseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private SyncAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 20)
    private SyncDirection direction;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SyncStatus status = SyncStatus.PENDING;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "max_retries")
    @Builder.Default
    private Integer maxRetries = 3;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data_snapshot", columnDefinition = "jsonb")
    private Map<String, Object> dataSnapshot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "synced_by")
    private User syncedBy;

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 5;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "scheduled_at")
    @Builder.Default
    private LocalDateTime scheduledAt = LocalDateTime.now();

    @Column(name = "processing_started_at")
    private LocalDateTime processingStartedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public boolean canRetry() {
        return this.retryCount < this.maxRetries;
    }

    public void incrementRetry() {
        this.retryCount++;
        this.status = SyncStatus.PENDING;
        this.scheduledAt = LocalDateTime.now().plusMinutes(this.retryCount * 5);
    }

    public void startProcessing() {
        this.status = SyncStatus.PROCESSING;
        this.processingStartedAt = LocalDateTime.now();
    }

    public void markSuccess() {
        this.status = SyncStatus.SUCCESS;
        this.processedAt = LocalDateTime.now();
        this.errorMessage = null;
    }

    public void markFailed(String error) {
        this.status = SyncStatus.FAILED;
        this.processedAt = LocalDateTime.now();
        this.errorMessage = error;
    }
}