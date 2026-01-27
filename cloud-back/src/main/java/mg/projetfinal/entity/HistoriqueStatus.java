package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "historique_status", indexes = {
        @Index(name = "idx_historique_signalement", columnList = "signalement_id, changed_at DESC"),
        @Index(name = "idx_historique_modified_by", columnList = "modified_by"),
        @Index(name = "idx_historique_ancien_status", columnList = "ancien_status_id"),
        @Index(name = "idx_historique_nouveau_status", columnList = "nouveau_status_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signalement_id", nullable = false)
    private Signalement signalement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ancien_status_id", nullable = false)
    private SignalementStatus ancienStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nouveau_status_id", nullable = false)
    private SignalementStatus nouveauStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by", nullable = false)
    private User modifiedBy;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;
}