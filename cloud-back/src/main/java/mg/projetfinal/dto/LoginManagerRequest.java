package mg.projetfinal.dto;

import lombok.Data;

@Data
public class LoginManagerRequest {
    private String email;
    private String password;
}