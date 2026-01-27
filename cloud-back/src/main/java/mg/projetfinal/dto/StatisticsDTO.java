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
public class StatisticsDTO {
    private Integer total;
    private Integer totalSurface;
    private BigDecimal totalBudget;
    private Integer nouveau;
    private Integer enCours;
    private Integer termine;
    private Double avancement;
}