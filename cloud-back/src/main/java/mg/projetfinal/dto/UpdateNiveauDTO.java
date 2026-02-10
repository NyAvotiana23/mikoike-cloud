package mg.projetfinal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNiveauDTO {
    
    @NotNull(message = "Le niveau est requis")
    @Min(value = 1, message = "Le niveau doit être entre 1 et 10")
    @Max(value = 10, message = "Le niveau doit être entre 1 et 10")
    private Integer niveau;
}