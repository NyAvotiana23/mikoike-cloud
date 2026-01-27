package mg.projetfinal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.dto.EntrepriseResponseDTO;
import mg.projetfinal.entity.Entreprise;
import mg.projetfinal.entity.User;
import mg.projetfinal.mapper.SignalementMapper;
import mg.projetfinal.service.EntrepriseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/entreprises")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EntrepriseController {

    private final EntrepriseService entrepriseService;
    private final SignalementMapper mapper;

    /**
     * GET /api/entreprises
     * Récupère toutes les entreprises
     */
    @GetMapping
    public ResponseEntity<List<EntrepriseResponseDTO>> getAllEntreprises() {
        log.info("GET /api/entreprises - Récupération de toutes les entreprises");

        List<Entreprise> entreprises = entrepriseService.findAll();
        List<EntrepriseResponseDTO> response = mapper.toEntrepriseDTOList(entreprises);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/entreprises/active
     * Récupère les entreprises actives
     */
    @GetMapping("/active")
    public ResponseEntity<List<EntrepriseResponseDTO>> getActiveEntreprises() {
        log.info("GET /api/entreprises/active - Récupération des entreprises actives");

        List<Entreprise> entreprises = entrepriseService.findActiveEntreprises();
        List<EntrepriseResponseDTO> response = mapper.toEntrepriseDTOList(entreprises);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/entreprises/top-rated
     * Récupère les entreprises les mieux notées
     */
    @GetMapping("/top-rated")
    public ResponseEntity<List<EntrepriseResponseDTO>> getTopRatedEntreprises() {
        log.info("GET /api/entreprises/top-rated - Récupération des meilleures entreprises");

        List<Entreprise> entreprises = entrepriseService.findTopRatedEntreprises();
        List<EntrepriseResponseDTO> response = mapper.toEntrepriseDTOList(entreprises);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/entreprises/{id}
     * Récupère une entreprise par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EntrepriseResponseDTO> getEntrepriseById(@PathVariable Integer id) {
        log.info("GET /api/entreprises/{} - Récupération de l'entreprise", id);

        return entrepriseService.findById(id)
                .map(mapper::toEntrepriseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/entreprises/by-specialite
     * Récupère les entreprises par spécialité
     */
    @GetMapping("/by-specialite")
    public ResponseEntity<List<EntrepriseResponseDTO>> getEntreprisesBySpecialite(
            @RequestParam String specialite) {

        log.info("GET /api/entreprises/by-specialite?specialite={}", specialite);

        List<Entreprise> entreprises = entrepriseService.findBySpecialite(specialite);
        List<EntrepriseResponseDTO> response = mapper.toEntrepriseDTOList(entreprises);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/entreprises
     * Crée une nouvelle entreprise
     */
    @PostMapping
    public ResponseEntity<EntrepriseResponseDTO> createEntreprise(
            @RequestBody Entreprise entreprise,
            @AuthenticationPrincipal User currentUser) {

        log.info("POST /api/entreprises - Création d'une nouvelle entreprise");

        Entreprise created = entrepriseService.create(entreprise, currentUser);
        EntrepriseResponseDTO response = mapper.toEntrepriseDTO(created);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/entreprises/{id}
     * Met à jour une entreprise
     */
    @PutMapping("/{id}")
    public ResponseEntity<EntrepriseResponseDTO> updateEntreprise(
            @PathVariable Integer id,
            @RequestBody Entreprise entreprise) {

        log.info("PUT /api/entreprises/{} - Mise à jour de l'entreprise", id);

        Entreprise updated = entrepriseService.update(id, entreprise);
        EntrepriseResponseDTO response = mapper.toEntrepriseDTO(updated);

        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/entreprises/{id}
     * Supprime une entreprise
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntreprise(@PathVariable Integer id) {
        log.info("DELETE /api/entreprises/{} - Suppression de l'entreprise", id);

        entrepriseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/entreprises/{id}/activate
     * Active une entreprise
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<EntrepriseResponseDTO> activateEntreprise(@PathVariable Integer id) {
        log.info("POST /api/entreprises/{}/activate - Activation de l'entreprise", id);

        Entreprise activated = entrepriseService.activateEntreprise(id);
        EntrepriseResponseDTO response = mapper.toEntrepriseDTO(activated);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/entreprises/{id}/deactivate
     * Désactive une entreprise
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<EntrepriseResponseDTO> deactivateEntreprise(@PathVariable Integer id) {
        log.info("POST /api/entreprises/{}/deactivate - Désactivation de l'entreprise", id);

        Entreprise deactivated = entrepriseService.deactivateEntreprise(id);
        EntrepriseResponseDTO response = mapper.toEntrepriseDTO(deactivated);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/entreprises/{id}/update-note
     * Met à jour la note moyenne
     */
    @PostMapping("/{id}/update-note")
    public ResponseEntity<EntrepriseResponseDTO> updateNoteMoyenne(
            @PathVariable Integer id,
            @RequestParam BigDecimal note) {

        log.info("POST /api/entreprises/{}/update-note - Mise à jour de la note", id);

        entrepriseService.updateNoteMoyenne(id, note);

        return entrepriseService.findById(id)
                .map(mapper::toEntrepriseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}