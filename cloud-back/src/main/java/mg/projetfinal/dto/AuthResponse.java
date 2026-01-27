package mg.projetfinal.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private Boolean success;
    private String message;
    private Long userId;
    private String email;
    private String name;
    private String role;
}