package mg.projetfinal.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String password;
}