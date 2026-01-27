package mg.projetfinal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.Entreprise;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.SignalementAction;
import mg.projetfinal.entity.User;
import mg.projetfinal.service.SignalementActionService;
import mg.projetfinal.service.EntrepriseService;
import mg.projetfinal.service.SignalementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/actions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SignalementActionController {

    private final SignalementActionService actionService;
    private final SignalementService signalementService;
    private final EntrepriseService entrepriseService;

    /**
     * GET /api/actions
     * Récupère toutes les actions
     */
    @GetMapping
    public ResponseEntity<List<SignalementAction>> getAllActions() {
        log.info("GET /api/actions - Récupération de toutes les actions");
        
        List<SignalementAction> actions = actionService.findAll();
        return ResponseEntity.ok(actions);
    }

    /**
     * GET /api/actions/{id}
     * Récupère une action par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SignalementAction> getActionById(@PathVariable Long id) {
        log.info("GET /api/actions/{} - Récupération de l'action", id);
        
        return actionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/actions/signalement/{signalementId}
     * Récupère les actions d'un signalement
     */
    @GetMapping("/signalement/{signalementId}")
    public ResponseEntity<List<SignalementAction>> getActionsBySignalement(@PathVariable Long signalementId) {
        log.info("GET /api/actions/signalement/{} - Récupération des actions", signalementId);
        
        Signalement signalement = signalementService.findById(signalementId)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé"));
        
        List<SignalementAction> actions = actionService.findBySignalement(signalement);
        return ResponseEntity.ok(actions);
    }

    /**
     * GET /api/actions/entreprise/{entrepriseId}
     * Récupère les actions d'une entreprise
     */
    @GetMapping("/entreprise/{entrepriseId}")
    public ResponseEntity<List<SignalementAction>> getActionsByEntreprise(@PathVariable Integer entrepriseId) {
        log.info("GET /api/actions/entreprise/{} - Récupération des actions", entrepriseId);
        
        Entreprise entreprise = entrepriseService.findById(entrepriseId)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise non trouvée"));
        
        List<SignalementAction> actions = actionService.findByEntreprise(entreprise);
        return ResponseEntity.ok(actions);
    }

    /**
     * GET /api/actions/en-cours
     * Récupère les actions en cours
     */
    @GetMapping("/en-cours")
    public ResponseEntity<List<SignalementAction>> getActionsEnCours() {
        log.info("GET /api/actions/en-cours - Récupération des actions en cours");
        
        List<SignalementAction> actions = actionService.findActionsEnCours();
        return ResponseEntity.ok(actions);
    }

    /**
     * GET /api/actions/en-retard
     * Récupère les actions en retard
     */
    @GetMapping("/en-retard")
    public ResponseEntity<List<SignalementAction>> getActionsEnRetard() {
        log.info("GET /api/actions/en-retard - Récupération des actions en retard");
        
        List<SignalementAction> actions = actionService.findActionsEnRetard();
        return ResponseEntity.ok(actions);
    }

    /**
     * POST /api/actions
     * Crée une nouvelle action
     */
    @PostMapping
    public ResponseEntity<SignalementAction> createAction(
            @RequestBody SignalementAction action,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("POST /api/actions - Création d'une nouvelle action");
        
        SignalementAction created = actionService.create(action, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/actions/{id}
     * Met à jour une action
     */
    @PutMapping("/{id}")
    public ResponseEntity<SignalementAction> updateAction(
            @PathVariable Long id,
            @RequestBody SignalementAction action,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("PUT /api/actions/{} - Mise à jour de l'action", id);
        
        SignalementAction updated = actionService.update(id, action, currentUser);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/actions/{id}
     * Supprime une action
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAction(@PathVariable Long id) {
        log.info("DELETE /api/actions/{} - Suppression de l'action", id);
        
        actionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/actions/{id}/assigner-entreprise
     * Assigne une entreprise à une action
     */
    @PostMapping("/{id}/assigner-entreprise")
    public ResponseEntity<SignalementAction> assignerEntreprise(
            @PathVariable Long id,
            @RequestParam Integer entrepriseId,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("POST /api/actions/{}/assigner-entreprise - Assignation entreprise {}", id, entrepriseId);
        
        Entreprise entreprise = entrepriseService.findById(entrepriseId)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise non trouvée"));
        
        SignalementAction updated = actionService.assignerEntreprise(id, entreprise, currentUser);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/actions/{id}/demarrer
     * Démarre les travaux
     */
    @PostMapping("/{id}/demarrer")
    public ResponseEntity<SignalementAction> demarrerTravaux(
            @PathVariable Long id,
            @RequestParam(required = false) String dateDebut,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("POST /api/actions/{}/demarrer - Démarrage des travaux", id);
        
        LocalDateTime dateDebutTravaux = dateDebut != null 
                ? LocalDateTime.parse(dateDebut) 
                : null;
        
        SignalementAction updated = actionService.demarrerTravaux(id, dateDebutTravaux, currentUser);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/actions/{id}/terminer
     * Termine les travaux
     */
    @PostMapping("/{id}/terminer")
    public ResponseEntity<SignalementAction> terminerTravaux(
            @PathVariable Long id,
            @RequestParam boolean conformes,
            @RequestParam(required = false) String commentaire,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("POST /api/actions/{}/terminer - Fin des travaux", id);
        
        SignalementAction updated = actionService.terminerTravaux(id, conformes, commentaire, currentUser);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/actions/{id}/photos-avant
     * Ajoute des photos avant travaux
     */
    @PostMapping("/{id}/photos-avant")
    public ResponseEntity<SignalementAction> ajouterPhotosAvant(
            @PathVariable Long id,
            @RequestBody String[] photos,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("POST /api/actions/{}/photos-avant - Ajout de {} photos", id, photos.length);
        
        SignalementAction updated = actionService.ajouterPhotosAvant(id, photos, currentUser);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/actions/{id}/photos-apres
     * Ajoute des photos après travaux
     */
    @PostMapping("/{id}/photos-apres")
    public ResponseEntity<SignalementAction> ajouterPhotosApres(
            @PathVariable Long id,
            @RequestBody String[] photos,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("POST /api/actions/{}/photos-apres - Ajout de {} photos", id, photos.length);
        
        SignalementAction updated = actionService.ajouterPhotosApres(id, photos, currentUser);
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/actions/{id}/budget
     * Met à jour le budget
     */
    @PutMapping("/{id}/budget")
    public ResponseEntity<SignalementAction> updateBudget(
            @PathVariable Long id,
            @RequestParam BigDecimal budget,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("PUT /api/actions/{}/budget - Mise à jour du budget", id);
        
        SignalementAction updated = actionService.updateBudget(id, budget, currentUser);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/actions/statistics
     * Récupère les statistiques des actions
     */
    @GetMapping("/statistics")
    public ResponseEntity<ActionStatisticsDTO> getStatistics() {
        log.info("GET /api/actions/statistics - Récupération des statistiques");
        
        ActionStatisticsDTO stats = ActionStatisticsDTO.builder()
                .totalActions(actionService.findAll().size())
                .actionsEnCours(actionService.countActionsEnCours())
                .actionsEnRetard(actionService.countActionsEnRetard())
                .actionsTerminees(actionService.countActionsTerminees())
                .budgetTotal(actionService.calculateBudgetTotal())
                .build();
        
        return ResponseEntity.ok(stats);
    }
}

// DTO pour les statistiques des actions
@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class ActionStatisticsDTO {
    private Integer totalActions;
    private Long actionsEnCours;
    private Long actionsEnRetard;
    private Long actionsTerminees;
    private BigDecimal budgetTotal;
}