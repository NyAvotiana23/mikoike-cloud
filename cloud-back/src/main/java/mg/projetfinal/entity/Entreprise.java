package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "entreprises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nom", unique = true, nullable = false, length = 150)
    private String nom;

    @Column(name = "siret", unique = true, length = 14)
    private String siret;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "email")
    private String email;

    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;

    @Type(StringArrayType.class)
    @Column(name = "specialites", columnDefinition = "text[]")
    private String[] specialites;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "note_moyenne", precision = 3, scale = 2)
    private BigDecimal noteMoyenne;

    @Column(name = "nombre_interventions")
    @Builder.Default
    private Integer nombreInterventions = 0;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "entreprise", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<SignalementAction> actions = new HashSet<>();

    // Audit
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Méthodes utilitaires
    public void incrementInterventions() {
        this.nombreInterventions = (this.nombreInterventions == null ? 0 : this.nombreInterventions) + 1;
    }

    public void updateNoteMoyenne(BigDecimal nouvelleNote) {
        if (this.noteMoyenne == null) {
            this.noteMoyenne = nouvelleNote;
        } else {
            // Calcul simple de moyenne (peut être amélioré avec historique)
            this.noteMoyenne = this.noteMoyenne
                    .add(nouvelleNote)
                    .divide(BigDecimal.valueOf(2), 2, BigDecimal.ROUND_HALF_UP);
        }
    }
}