package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_firebase_uid", columnList = "firebase_uid"),
        @Index(name = "idx_user_role_id", columnList = "role_id"),
        @Index(name = "idx_user_is_locked", columnList = "is_locked"),
        @Index(name = "idx_user_firebase_synced", columnList = "firebase_synced")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // Synchronisation Firebase
    @Column(name = "firebase_uid", unique = true, length = 128)
    private String firebaseUid;

    @Column(name = "firebase_synced")
    @Builder.Default
    private Boolean firebaseSynced = false;

    @Column(name = "firebase_sync_error", columnDefinition = "TEXT")
    private String firebaseSyncError;

    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    // Rôle
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    // Sécurité et blocage
    @Column(name = "is_locked")
    @Builder.Default
    private Boolean isLocked = false;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "failed_attempts")
    @Builder.Default
    private Integer failedAttempts = 0;

    @Column(name = "last_failed_attempt_at")
    private LocalDateTime lastFailedAttemptAt;

    // Audit
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relations
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Session> sessions = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Signalement> signalements = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<LoginAttempt> loginAttempts = new HashSet<>();

    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> usersCreated = new HashSet<>();

    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<SignalementAction> actionsCreated = new HashSet<>();

    @OneToMany(mappedBy = "modifiedBy", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<SignalementAction> actionsModified = new HashSet<>();

    // Méthodes utilitaires
    public boolean isManager() {
        return this.role != null && this.role.isManager();
    }

    public boolean isAccountLocked() {
        if (!Boolean.TRUE.equals(this.isLocked)) {
            return false;
        }
        if (this.lockedUntil == null) {
            return true;
        }
        return LocalDateTime.now().isBefore(this.lockedUntil);
    }

    public void incrementFailedAttempts() {
        this.failedAttempts = (this.failedAttempts == null ? 0 : this.failedAttempts) + 1;
        this.lastFailedAttemptAt = LocalDateTime.now();
    }

    public void resetFailedAttempts() {
        this.failedAttempts = 0;
        this.lastFailedAttemptAt = null;
    }

    public void lockAccount(int minutes) {
        this.isLocked = true;
        this.lockedUntil = LocalDateTime.now().plusMinutes(minutes);
    }

    public void unlockAccount() {
        this.isLocked = false;
        this.lockedUntil = null;
        this.failedAttempts = 0;
    }
}