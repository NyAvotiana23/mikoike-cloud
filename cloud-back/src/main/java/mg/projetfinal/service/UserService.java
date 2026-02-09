// Updated file: src/main/java/mg/projetfinal/service/UserService.java
package mg.projetfinal.service;

import mg.projetfinal.dto.UserDTO;
import mg.projetfinal.entity.Role;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    /**
     * Récupère tous les utilisateurs sous forme de DTO, mappés aux colonnes du tableau dans la page JSX.
     * Notes :
     * - Le champ 'name' de l'entité User est supposé être le nom complet (ex: "Prenom Nom").
     *   Il est splitté pour extraire 'prenom' et 'nom'. Si impossible à splitter, 'prenom' est vide et 'nom' prend la valeur complète.
     * - Les champs 'age' et 'location' ne sont pas présents dans l'entité User (basé sur entity.txt), ils sont donc settés à null.
     * - Le champ 'role' est extrait du nom du rôle (en supposant que l'entité Role a une méthode getName()).
     *   Si Role n'a pas de getName(), adaptez selon votre implémentation (ex: role.getRoleName() ou role.toString()).
     */
    public List<UserDTO> getAllUserDTOs() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());

        // Mapper le rôle (adaptez si Role n'a pas getName())
        Role role = user.getRole();
        dto.setRole(role != null ? role.getLibelle() : null);

        dto.setCreatedAt(user.getCreatedAt());

        // Splitter 'name' en prenom et nom (adaptation car entity a un seul 'name')
        String name = user.getName();
        if (name != null) {
            String[] parts = name.trim().split("\\s+");
            if (parts.length >= 2) {
                dto.setPrenom(parts[0]);
                dto.setNom(String.join(" ", Arrays.copyOfRange(parts, 1, parts.length)));
            } else {
                dto.setPrenom("");
                dto.setNom(name);
            }
        } else {
            dto.setPrenom(null);
            dto.setNom(null);
        }

        // Champs manquants dans l'entité : settés à null (ajoutez-les à l'entité User si nécessaire)
        dto.setAge(null);
        dto.setLocation(null);

        return dto;
    }
}