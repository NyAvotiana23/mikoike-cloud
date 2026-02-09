// Updated file: src/main/java/mg/projetfinal/service/SignalementStatusService.java
// Assuming this service exists; if not, create it with the following content
package mg.projetfinal.service;

import mg.projetfinal.dto.SignalementStatusDTO;
import mg.projetfinal.entity.SignalementStatus;
import mg.projetfinal.repository.SignalementStatusRepository; // Assume this exists
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SignalementStatusService {

    private final SignalementStatusRepository repository;

    @Autowired
    public SignalementStatusService(SignalementStatusRepository repository) {
        this.repository = repository;
    }

    public List<SignalementStatus> findAll() {
        return repository.findAll();
    }

    public List<SignalementStatusDTO> findAllDTOs() {
        return findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SignalementStatus> findAllOrderByOrdre() {
        return repository.findAllByOrderByOrdreAsc(); // Assume this method exists in repo
    }

    public List<SignalementStatusDTO> findAllOrderByOrdreDTOs() {
        return findAllOrderByOrdre().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SignalementStatus findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statut non trouvé"));
    }

    private SignalementStatusDTO mapToDTO(SignalementStatus status) {
        return new SignalementStatusDTO(
                status.getId(),
                status.getCode(),
                status.getLibelle(),
                status.getDescription(),
                status.getOrdre()
        );
    }
}