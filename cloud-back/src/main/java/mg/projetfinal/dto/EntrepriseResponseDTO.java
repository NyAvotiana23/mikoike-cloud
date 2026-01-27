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
public class EntrepriseResponseDTO {
    private Integer id;
    private String nom;
    private String siret;
    private String telephone;
    private String email;
    private String adresse;
    private String[] specialites;
    private Boolean isActive;
    private BigDecimal noteMoyenne;
    private Integer nombreInterventions;
}