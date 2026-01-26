package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "signalement_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "libelle", nullable = false, length = 50)
    private String libelle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "couleur", length = 7)
    private String couleur; // Format: #FF0000

    @Column(name = "ordre", nullable = false)
    @Builder.Default
    private Integer ordre = 1;

    // Relations
    @OneToMany(mappedBy = "status", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Signalement> signalements = new HashSet<>();

    @OneToMany(mappedBy = "ancienStatus", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<HistoriqueStatus> historiquesAncien = new HashSet<>();

    @OneToMany(mappedBy = "nouveauStatus", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<HistoriqueStatus> historiquesNouveau = new HashSet<>();

    // Audit
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Méthodes utilitaires
    public boolean isNouveau() {
        return "NOUVEAU".equals(this.code);
    }

    public boolean isEnCours() {
        return "EN_COURS".equals(this.code);
    }

    public boolean isTermine() {
        return "TERMINE".equals(this.code);
    }
}