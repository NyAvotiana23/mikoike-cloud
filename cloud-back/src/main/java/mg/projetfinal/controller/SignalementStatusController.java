// SignalementStatusController.java
package mg.projetfinal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.dto.SignalementResponseDTO;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.SignalementStatus;
import mg.projetfinal.entity.User;
import mg.projetfinal.mapper.SignalementMapper;
import mg.projetfinal.service.SignalementService;
import mg.projetfinal.service.SignalementStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur pour la gestion des statuts de signalements
 */
@RestController
@RequestMapping("/api/signalements/status")
@RequiredArgsConstructor
@Slf4j
public class SignalementStatusController {

    private final SignalementService signalementService;
    private final SignalementStatusService statusService;
    private final SignalementMapper mapper;

    /**
     * POST /api/signalements/{id}/synchroniser
     * Synchronise un signalement avec Firebase
     */
    @PostMapping("/{id}/synchroniser")
    public ResponseEntity<SignalementResponseDTO> synchroniserSignalement(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        log.info("POST /api/signalements/{}/synchroniser - Synchronisation avec Firebase", id);

        Signalement signalement = signalementService.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));

        // Logique de synchronisation Firebase ici
        signalement.setFirebaseSynced(true);
        Signalement synced = signalementService.create(signalement,currentUser);

        SignalementResponseDTO response = mapper.toResponseDTO(synced);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/signalements/{id}/detail
     * Récupère les détails complets d'un signalement
     * (surface, budget, entreprise, statut, rues)
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<SignalementResponseDTO> getDetailSignalement(@PathVariable Long id) {
        log.info("GET /api/signalements/{}/detail - Récupération des détails complets", id);

        return signalementService.findById(id)
                .map(mapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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

        SignalementStatus newStatus = statusService.findById(statusId.intValue())
                .orElseThrow(() -> new RuntimeException("Statut non trouvé"));

        signalement.setStatus(newStatus);


        Signalement updated = signalementService.create(signalement,currentUser);

        SignalementResponseDTO response = mapper.toResponseDTO(updated);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/signalements/statut-options
     * Récupère la liste des statuts disponibles pour sélection
     */
    @GetMapping("/statut-options")
    public ResponseEntity<List<SignalementStatus>> getStatutOptions() {
        log.info("GET /api/signalements/statut-options - Récupération des options de statut");

        List<SignalementStatus> statuts = statusService.findAllOrderByOrdre();
        return ResponseEntity.ok(statuts);
    }

    /**
     * POST /api/signalements/{id}/on-hover
     * Endpoint pour afficher une bulle d'information au survol
     * Retourne une liste de statuts pour sélection
     */
    @PostMapping("/{id}/on-hover")
    public ResponseEntity<List<SignalementStatus>> onHoverSignalement(@PathVariable Long id) {
        log.info("POST /api/signalements/{}/on-hover - Affichage des options de statut", id);

        // Vérifier que le signalement existe
        signalementService.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));

        List<SignalementStatus> availableStatuses = statusService.findAllOrderByOrdre();
        return ResponseEntity.ok(availableStatuses);
    }

    /**
     * POST /api/signalements/{id}/set-status-from-detail
     * Intégration de setStatus lors du clic sur le bouton dans la vue détail
     */
    @PostMapping("/{id}/set-status-from-detail")
    public ResponseEntity<SignalementResponseDTO> setStatusFromDetail(
            @PathVariable Long id,
            @RequestParam Long newStatusId,
            @RequestParam(required = false) String commentaire,
            @AuthenticationPrincipal User currentUser) {

        log.info("POST /api/signalements/{}/set-status-from-detail - Changement de statut depuis détail", id);

        return setStatus(id, newStatusId, commentaire, currentUser);
    }
}