package mg.projetfinal.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LoginResponse {
    private Boolean success;
    private String message;
    private String token;
    private Long userId;
    private String email;
    private String name;
    private String role;
    private LocalDateTime expiresAt;
}