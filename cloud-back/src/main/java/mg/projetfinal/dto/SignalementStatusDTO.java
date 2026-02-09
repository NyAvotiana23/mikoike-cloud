// New file: src/main/java/mg/projetfinal/dto/SignalementStatusDTO.java
package mg.projetfinal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalementStatusDTO {
    private Integer id;
    private String code;
    private String libelle;
    private String description;
    private Integer ordre;
}