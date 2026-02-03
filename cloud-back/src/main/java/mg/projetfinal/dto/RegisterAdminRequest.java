package mg.projetfinal.dto;

import lombok.Data;

@Data
public class RegisterAdminRequest {
    private String email;
    private String password;
    private String name;
    private String secretKey; // Clé secrète pour sécuriser l'endpoint
}