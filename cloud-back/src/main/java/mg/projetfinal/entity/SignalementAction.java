package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "signalement_actions", indexes = {
        @Index(name = "idx_signalement_action_signalement", columnList = "signalement_id"),
        @Index(name = "idx_signalement_action_entreprise", columnList = "entreprise_id"),
        @Index(name = "idx_signalement_action_dates", columnList = "date_debut_travaux, date_fin_reelle")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signalement_id", nullable = false)
    private Signalement signalement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    // Informations travaux
    @Column(name = "surface_m2", precision = 10, scale = 2)
    private BigDecimal surfaceM2;

    @Column(name = "budget", precision = 15, scale = 2)
    private BigDecimal budget;

    // Planning
    @Column(name = "date_debut_travaux")
    private LocalDateTime dateDebutTravaux;

    @Column(name = "date_fin_prevue")
    private LocalDateTime dateFinPrevue;

    @Column(name = "date_fin_reelle")
    private LocalDateTime dateFinReelle;

    // Description
    @Column(name = "description_travaux", columnDefinition = "TEXT")
    private String descriptionTravaux;

    @Column(name = "materiel_utilise", columnDefinition = "TEXT")
    private String materielUtilise;

    // Résultat
    @Column(name = "travaux_conformes")
    private Boolean travauxConformes;

    @Column(name = "commentaire_fin", columnDefinition = "TEXT")
    private String commentaireFin;

    // Photos
    @Type(StringArrayType.class)
    @Column(name = "photos_avant", columnDefinition = "text[]")
    private String[] photosAvant;

    @Type(StringArrayType.class)
    @Column(name = "photos_apres", columnDefinition = "text[]")
    private String[] photosApres;

    // Audit
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by")
    private User modifiedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Méthodes utilitaires
    public boolean isEnCours() {
        return this.dateDebutTravaux != null && this.dateFinReelle == null;
    }

    public boolean isTermine() {
        return this.dateFinReelle != null;
    }

    public boolean isEnRetard() {
        return this.dateFinPrevue != null
                && this.dateFinReelle == null
                && LocalDateTime.now().isAfter(this.dateFinPrevue);
    }

    public void terminerTravaux(boolean conformes, String commentaire) {
        this.dateFinReelle = LocalDateTime.now();
        this.travauxConformes = conformes;
        this.commentaireFin = commentaire;
    }
}