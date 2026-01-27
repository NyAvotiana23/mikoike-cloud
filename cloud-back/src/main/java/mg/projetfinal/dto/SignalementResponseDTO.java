package mg.projetfinal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignalementResponseDTO {
    private Long id;
    private String type;
    private String icon;
    private String color;
    private CoordinatesDTO coordinates;
    private String title;
    private String date;
    private String status;
    private Integer surface;
    private BigDecimal budget;
    private String entreprise;
    private String location;
    private String description;
    private List<ActionDTO> actions;
    
    // Pour la carte
    private BigDecimal lat;
    private BigDecimal lng;
}