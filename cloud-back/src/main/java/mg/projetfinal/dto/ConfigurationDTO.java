package mg.projetfinal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfigurationDTO {
    private Long id;
    private String cle;
    private String valeur;
    private String description;
    private String type;
    
    // Méthodes utilitaires
    public BigDecimal getValeurAsDecimal() {
        return new BigDecimal(valeur);
    }
    
    public Integer getValeurAsInteger() {
        return Integer.parseInt(valeur);
    }
}