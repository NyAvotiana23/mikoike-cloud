package mg.projetfinal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSignalementDTO {
    @NotNull(message = "La latitude est obligatoire")
    private BigDecimal latitude;

    @NotNull(message = "La longitude est obligatoire")
    private BigDecimal longitude;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    private String adresse;
    private String photoUrl;

    @NotNull(message = "Le statut est obligatoire")
    private Long statusId;
}