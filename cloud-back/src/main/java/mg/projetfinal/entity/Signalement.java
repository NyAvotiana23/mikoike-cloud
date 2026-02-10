package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "signalements", indexes = {
        @Index(name = "idx_signalement_user_id", columnList = "user_id"),
        @Index(name = "idx_signalement_status_id", columnList = "status_id"),
        @Index(name = "idx_signalement_date", columnList = "date_signalement"),
        @Index(name = "idx_signalement_location", columnList = "latitude, longitude"),
        @Index(name = "idx_signalement_firebase_id", columnList = "firebase_id"),
        @Index(name = "idx_signalement_firebase_synced", columnList = "firebase_synced")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Synchronisation Firebase
    @Column(name = "firebase_id", unique = true, length = 128)
    private String firebaseId;

    @Column(name = "firebase_synced")
    @Builder.Default
    private Boolean firebaseSynced = false;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    // Localisation
    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "adresse")
    private String adresse;

    // Détails du problème
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "budget", nullable = false)
    private BigDecimal budget;

    @Column(name = "niveau", nullable = true)
    private Integer niveau;

    @Column(name = "surface", nullable = false)
    private BigDecimal surface;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    // Statut
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    private SignalementStatus status;

    // Dates
    @CreationTimestamp
    @Column(name = "date_signalement", updatable = false)
    private LocalDateTime dateSignalement;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relations
    @OneToMany(mappedBy = "signalement", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.LAZY)
    @Builder.Default
    private Set<SignalementAction> actions = new HashSet<>();

    @OneToMany(mappedBy = "signalement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<HistoriqueStatus> historiquesStatus = new HashSet<>();

    // Méthodes utilitaires
    public boolean isNouveau() {
        return this.status != null && this.status.isNouveau();
    }

    public boolean isEnCours() {
        return this.status != null && this.status.isEnCours();
    }

    public boolean isTermine() {
        return this.status != null && this.status.isTermine();
    }

    public SignalementAction getActiveAction() {
        return this.actions.stream()
                .filter(action -> action.getDateFinReelle() == null)
                .findFirst()
                .orElse(null);
    }

    public void addAction(SignalementAction action) {
        this.actions.add(action);
        action.setSignalement(this);
    }

    public void addHistorique(HistoriqueStatus historique) {
        this.historiquesStatus.add(historique);
        historique.setSignalement(this);
    }
}