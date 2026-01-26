package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import mg.projetfinal.enums.FailureReason;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_attempts", indexes = {
        @Index(name = "idx_login_attempts_email", columnList = "email"),
        @Index(name = "idx_login_attempts_user_id", columnList = "user_id"),
        @Index(name = "idx_login_attempts_attempted_at", columnList = "attempted_at DESC"),
        @Index(name = "idx_login_attempts_email_time", columnList = "email, attempted_at DESC"),
        @Index(name = "idx_login_attempts_success", columnList = "success, attempted_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "success", nullable = false)
    private Boolean success;

    @Enumerated(EnumType.STRING)
    @Column(name = "failure_reason", length = 50)
    private FailureReason failureReason;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @CreationTimestamp
    @Column(name = "attempted_at", updatable = false)
    private LocalDateTime attemptedAt;

    // Méthodes utilitaires
    public static LoginAttempt createSuccess(String email, User user, String ipAddress, String userAgent) {
        return LoginAttempt.builder()
                .email(email)
                .user(user)
                .success(true)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
    }

    public static LoginAttempt createFailure(String email, User user, FailureReason reason,
                                             String ipAddress, String userAgent) {
        return LoginAttempt.builder()
                .email(email)
                .user(user)
                .success(false)
                .failureReason(reason)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
    }
}