package mg.projetfinal.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponse {
    private Boolean success;
    private String message;
}