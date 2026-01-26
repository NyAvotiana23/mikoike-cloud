package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "failed_login_tracking", indexes = {
        @Index(name = "idx_failed_login_email", columnList = "email", unique = true),
        @Index(name = "idx_failed_login_blocked", columnList = "is_blocked, blocked_until")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FailedLoginTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "failed_count")
    @Builder.Default
    private Integer failedCount = 0;

    @Column(name = "first_failed_at")
    private LocalDateTime firstFailedAt;

    @Column(name = "last_failed_at")
    private LocalDateTime lastFailedAt;

    @Column(name = "is_blocked")
    @Builder.Default
    private Boolean isBlocked = false;

    @Column(name = "blocked_until")
    private LocalDateTime blockedUntil;

    @Column(name = "blocked_reason", length = 100)
    private String blockedReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unblocked_by")
    private User unblockedBy;

    @Column(name = "unblocked_at")
    private LocalDateTime unblockedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Méthodes utilitaires
    public void recordFailedAttempt() {
        this.failedCount = (this.failedCount == null ? 0 : this.failedCount) + 1;
        this.lastFailedAt = LocalDateTime.now();
        if (this.firstFailedAt == null) {
            this.firstFailedAt = LocalDateTime.now();
        }
    }

    public void blockAccount(int minutes, String reason) {
        this.isBlocked = true;
        this.blockedUntil = LocalDateTime.now().plusMinutes(minutes);
        this.blockedReason = reason;
    }

    public void unblock(User unblockedBy) {
        this.isBlocked = false;
        this.blockedUntil = null;
        this.unblockedBy = unblockedBy;
        this.unblockedAt = LocalDateTime.now();
    }

    public void reset() {
        this.failedCount = 0;
        this.firstFailedAt = null;
        this.lastFailedAt = null;
        this.isBlocked = false;
        this.blockedUntil = null;
        this.blockedReason = null;
    }

    public boolean isCurrentlyBlocked() {
        if (!Boolean.TRUE.equals(this.isBlocked)) {
            return false;
        }
        if (this.blockedUntil == null) {
            return true;
        }
        return LocalDateTime.now().isBefore(this.blockedUntil);
    }
}