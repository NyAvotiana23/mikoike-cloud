// New file: src/main/java/mg/projetfinal/dto/UserDTO.java
package mg.projetfinal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String prenom;
    private String nom;
    private String email;
    private Integer age;
    private String location;
    private String role;
    private LocalDateTime createdAt;
}