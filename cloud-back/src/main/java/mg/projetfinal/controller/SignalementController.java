package mg.projetfinal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.dto.*;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.SignalementStatus;
import mg.projetfinal.entity.User;
import mg.projetfinal.mapper.SignalementMapper;
import mg.projetfinal.service.SignalementService;
import mg.projetfinal.service.SignalementStatusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/signalements")
@RequiredArgsConstructor
@Slf4j
//@Validated
public class SignalementController {

    private final SignalementService signalementService;
    private final SignalementStatusService statusService;
    private final SignalementMapper signalementMapper;

    /**
     * GET /api/signalements
     * Récupère tous les signalements
     */
    @GetMapping
    public ResponseEntity<List<SignalementResponseDTO>> getAllSignalements() {
        log.info("GET /api/signalements - Récupération de tous les signalements");
        
        List<Signalement> signalements = signalementService.findAllOrderByDateDesc();
        List<SignalementResponseDTO> response = signalementMapper.toResponseDTOList(signalements);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/signalements/{id}
     * Récupère un signalement par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SignalementResponseDTO> getSignalementById(@PathVariable Long id) {
        log.info("GET /api/signalements/{} - Récupération du signalement", id);
        
        return signalementService.findById(id)
                .map(signalementMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/signalements/status/{status}
     * Récupère les signalements par statut
     */
    @GetMapping("/status/{statusCode}")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsByStatus(@PathVariable String statusCode) {
        log.info("GET /api/signalements/status/{} - Récupération par statut", statusCode);
        
        List<Signalement> signalements = signalementService.findByStatusCode(statusCode);
        List<SignalementResponseDTO> response = signalementMapper.toResponseDTOList(signalements);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/signalements/map
     * Récupère les signalements pour la carte
     */
    @GetMapping("/map")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsForMap() {
        log.info("GET /api/signalements/map - Récupération pour la carte");
        
        List<Signalement> signalements = signalementService.findAll();
        List<SignalementResponseDTO> response = signalementMapper.toResponseDTOList(signalements);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/signalements/statistics
     * Récupère les statistiques des signalements
     */
    @GetMapping("/statistics")
    public ResponseEntity<StatisticsDTO> getStatistics() {
        log.info("GET /api/signalements/statistics - Récupération des statistiques");
        
        List<Signalement> signalements = signalementService.findAll();
        
        int total = signalements.size();
        int totalSurface = signalements.stream()
                .mapToInt(s -> {
                    var action = s.getActiveAction();
                    return action != null && action.getSurfaceM2() != null 
                            ? action.getSurfaceM2().intValue() : 0;
                })
                .sum();
        
        BigDecimal totalBudget = signalements.stream()
                .map(s -> {
                    var action = s.getActiveAction();
                    return action != null && action.getBudget() != null 
                            ? action.getBudget() : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long nouveau = signalementService.countNouveau();
        long enCours = signalementService.countEnCours();
        long termine = signalementService.countTermine();
        
        double avancement = total > 0 ? ((double) termine / total) * 100 : 0;
        
        StatisticsDTO stats = StatisticsDTO.builder()
                .total(total)
                .totalSurface(totalSurface)
                .totalBudget(totalBudget)
                .nouveau((int) nouveau)
                .enCours((int) enCours)
                .termine((int) termine)
                .avancement(Math.round(avancement * 10.0) / 10.0)
                .build();
        
        return ResponseEntity.ok(stats);
    }

    /**
     * POST /api/signalements
     * Crée un nouveau signalement
     */
    @PostMapping
    public ResponseEntity<SignalementResponseDTO> createSignalement(
            @Valid @RequestBody CreateSignalementDTO dto,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("POST /api/signalements - Création d'un nouveau signalement");
        
        // TODO: Récupérer le statut par défaut ou utiliser dto.statusId
        // SignalementStatus status = statusService.findById(dto.getStatusId()).orElseThrow();
        
        Signalement signalement = Signalement.builder()
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .description(dto.getDescription())
                .adresse(dto.getAdresse())
                .photoUrl(dto.getPhotoUrl())
                // .status(status)
                .build();
        
        Signalement created = signalementService.create(signalement, currentUser);
        SignalementResponseDTO response = signalementMapper.toResponseDTO(created);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/signalements/{id}
     * Met à jour un signalement
     */
    @PutMapping("/{id}")
    public ResponseEntity<SignalementResponseDTO> updateSignalement(
            @PathVariable Long id,
            @Valid @RequestBody CreateSignalementDTO dto) {
        
        log.info("PUT /api/signalements/{} - Mise à jour du signalement", id);
        
        Signalement signalement = Signalement.builder()
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .description(dto.getDescription())
                .adresse(dto.getAdresse())
                .photoUrl(dto.getPhotoUrl())
                .build();
        
        Signalement updated = signalementService.update(id, signalement);
        SignalementResponseDTO response = signalementMapper.toResponseDTO(updated);
        
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/signalements/{id}
     * Supprime un signalement
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSignalement(@PathVariable Long id) {
        log.info("DELETE /api/signalements/{} - Suppression du signalement", id);
        
        signalementService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/signalements/location
     * Recherche par localisation
     */
    @GetMapping("/location")
    public ResponseEntity<List<SignalementResponseDTO>> getSignalementsByLocation(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(defaultValue = "5.0") double radiusKm) {
        
        log.info("GET /api/signalements/location - Recherche par localisation");
        
        List<Signalement> signalements = signalementService.findByLocation(latitude, longitude, radiusKm);
        List<SignalementResponseDTO> response = signalementMapper.toResponseDTOList(signalements);
        
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/signalements/{id}/status
     * Change le statut d'un signalement
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<SignalementResponseDTO> setStatus(
            @PathVariable Long id,
            @RequestParam Long statusId,
            @RequestParam(required = false) String commentaire,
            @AuthenticationPrincipal User currentUser) {

        log.info("PUT /api/signalements/{}/status - Changement de statut vers {}", id, statusId);

        Signalement signalement = signalementService.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));

        SignalementStatus newStatus = statusService.findById(statusId.intValue());

        signalement.setStatus(newStatus);


        Signalement updated = signalementService.create(signalement,currentUser);

        SignalementResponseDTO response = signalementMapper.toResponseDTO(updated);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/signalements/status-options
     * Récupère la liste des statuts disponibles pour sélection
     */
    @GetMapping("/status-options")
    public ResponseEntity<List<SignalementStatusDTO>> getStatutOptions() {
        log.info("GET /api/signalements/status-options - Récupération des options de statut");

        List<SignalementStatusDTO> statuts = statusService.findAllDTOs();
        return ResponseEntity.ok(statuts);
    }

    /**
     * POST /api/signalements/{id}/on-hover
     * Endpoint pour afficher une bulle d'information au survol
     * Retourne une liste de statuts pour sélection
     */
    @PostMapping("/{id}/on-hover")
    public ResponseEntity<List<SignalementStatusDTO>> onHoverSignalement(@PathVariable Long id) {
        log.info("POST /api/signalements/{}/on-hover - Affichage des options de statut", id);

        // Vérifier que le signalement existe
        signalementService.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));

        List<SignalementStatusDTO> availableStatuses = statusService.findAllOrderByOrdreDTOs();
        return ResponseEntity.ok(availableStatuses);
    }
}