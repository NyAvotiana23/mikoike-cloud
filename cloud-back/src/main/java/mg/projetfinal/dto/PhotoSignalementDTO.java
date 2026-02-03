package mg.projetfinal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoSignalementDTO {
    private Long id;
    private String url;
    private String description;
    private Integer ordre;
    private Boolean isPrincipale;
    private String uploadedBy;
    private String createdAt;
}