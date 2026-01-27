package mg.projetfinal.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SessionResponse {
    private Boolean success;
    private Boolean valid;
    private String message;
    private Long userId;
    private String email;
    private String name;
    private String role;
    private LocalDateTime expiresAt;
}