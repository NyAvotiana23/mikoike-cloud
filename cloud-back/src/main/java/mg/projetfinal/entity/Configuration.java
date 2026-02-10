package mg.projetfinal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Configuration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cle", nullable = false, unique = true, length = 100)
    private String cle;

    @Column(name = "valeur", nullable = false, columnDefinition = "TEXT")
    private String valeur;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "type", length = 50)
    @Builder.Default
    private String type = "STRING"; // STRING, NUMBER, DECIMAL, BOOLEAN, JSON

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    // Méthodes utilitaires pour la conversion de type
    public BigDecimal getValeurAsDecimal() {
        try {
            return new BigDecimal(valeur);
        } catch (NumberFormatException e) {
            throw new IllegalStateException("La valeur '" + valeur + "' ne peut pas être convertie en BigDecimal");
        }
    }

    public Integer getValeurAsInteger() {
        try {
            return Integer.parseInt(valeur);
        } catch (NumberFormatException e) {
            throw new IllegalStateException("La valeur '" + valeur + "' ne peut pas être convertie en Integer");
        }
    }

    public Boolean getValeurAsBoolean() {
        return Boolean.parseBoolean(valeur);
    }

    public Double getValeurAsDouble() {
        try {
            return Double.parseDouble(valeur);
        } catch (NumberFormatException e) {
            throw new IllegalStateException("La valeur '" + valeur + "' ne peut pas être convertie en Double");
        }
    }
}