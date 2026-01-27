package mg.projetfinal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.HistoriqueStatus;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.service.HistoriqueStatusService;
import mg.projetfinal.service.SignalementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historiques")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HistoriqueStatusController {

    private final HistoriqueStatusService historiqueStatusService;
    private final SignalementService signalementService;

    /**
     * GET /api/historiques
     * Récupère tous les historiques
     */
    @GetMapping
    public ResponseEntity<List<HistoriqueStatus>> getAllHistoriques() {
        log.info("GET /api/historiques - Récupération de tous les historiques");
        
        List<HistoriqueStatus> historiques = historiqueStatusService.findAll();
        return ResponseEntity.ok(historiques);
    }

    /**
     * GET /api/historiques/{id}
     * Récupère un historique par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HistoriqueStatus> getHistoriqueById(@PathVariable Long id) {
        log.info("GET /api/historiques/{} - Récupération de l'historique", id);
        
        return historiqueStatusService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/historiques/signalement/{signalementId}
     * Récupère l'historique d'un signalement
     */
    @GetMapping("/signalement/{signalementId}")
    public ResponseEntity<List<HistoriqueStatus>> getHistoriqueBySignalement(@PathVariable Long signalementId) {
        log.info("GET /api/historiques/signalement/{} - Récupération de l'historique", signalementId);
        
        List<HistoriqueStatus> historiques = historiqueStatusService.getStatusHistory(signalementId);
        return ResponseEntity.ok(historiques);
    }

    /**
     * GET /api/historiques/signalement/{signalementId}/dernier
     * Récupère le dernier changement de statut
     */
    @GetMapping("/signalement/{signalementId}/dernier")
    public ResponseEntity<HistoriqueStatus> getLastStatusChange(@PathVariable Long signalementId) {
        log.info("GET /api/historiques/signalement/{}/dernier - Dernier changement", signalementId);
        
        Signalement signalement = signalementService.findById(signalementId)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé"));
        
        HistoriqueStatus lastChange = historiqueStatusService.getLastStatusChange(signalement);
        
        if (lastChange == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(lastChange);
    }

    /**
     * DELETE /api/historiques/{id}
     * Supprime un historique
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistorique(@PathVariable Long id) {
        log.info("DELETE /api/historiques/{} - Suppression de l'historique", id);
        
        historiqueStatusService.delete(id);
        return ResponseEntity.noContent().build();
    }
}