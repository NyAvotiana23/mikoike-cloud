package mg.projetfinal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.dto.ConfigurationDTO;
import mg.projetfinal.entity.Configuration;
import mg.projetfinal.entity.User;
import mg.projetfinal.service.ConfigurationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/configurations")
@RequiredArgsConstructor
@Slf4j
public class ConfigurationController {

    private final ConfigurationService configurationService;

    /**
     * GET /api/configurations
     * Récupère toutes les configurations
     */
    @GetMapping
    public ResponseEntity<List<ConfigurationDTO>> getAllConfigurations() {
        log.info("GET /api/configurations - Récupération de toutes les configurations");
        
        List<Configuration> configurations = configurationService.findAll();
        List<ConfigurationDTO> dtos = configurations.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/configurations/prix-par-m2
     * Récupère le prix par m²
     */
    @GetMapping("/prix-par-m2")
    public ResponseEntity<ConfigurationDTO> getPrixParM2() {
        log.info("GET /api/configurations/prix-par-m2 - Récupération du prix par m²");
        
        BigDecimal prix = configurationService.getPrixParM2();
        
        ConfigurationDTO dto = ConfigurationDTO.builder()
                .cle(ConfigurationService.PRIX_PAR_M2_KEY)
                .valeur(prix.toString())
                .type("DECIMAL")
                .description("Prix forfaitaire par mètre carré")
                .build();
        
        return ResponseEntity.ok(dto);
    }

    /**
     * PUT /api/configurations/prix-par-m2
     * Met à jour le prix par m²
     */
    @PutMapping("/prix-par-m2")
    public ResponseEntity<ConfigurationDTO> updatePrixParM2(
            @RequestParam BigDecimal prix,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("PUT /api/configurations/prix-par-m2 - Mise à jour du prix par m² : {}", prix);
        
        if (prix.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        Configuration config = configurationService.setPrixParM2(prix, currentUser);
        
        return ResponseEntity.ok(toDTO(config));
    }

    /**
     * POST /api/configurations/calculer-budget
     * Calcule le budget pour un niveau et une surface donnés
     */
    @PostMapping("/calculer-budget")
    public ResponseEntity<BudgetCalculationDTO> calculerBudget(
            @RequestParam Integer niveau,
            @RequestParam BigDecimal surface) {
        
        log.info("POST /api/configurations/calculer-budget - Niveau: {}, Surface: {} m²", niveau, surface);
        
        try {
            BigDecimal budget = configurationService.calculerBudget(niveau, surface);
            BigDecimal prixParM2 = configurationService.getPrixParM2();
            
            BudgetCalculationDTO result = BudgetCalculationDTO.builder()
                    .niveau(niveau)
                    .surface(surface)
                    .prixParM2(prixParM2)
                    .budget(budget)
                    .build();
            
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.error("Erreur de calcul du budget: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/configurations/{id}
     * Récupère une configuration par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ConfigurationDTO> getConfigurationById(@PathVariable Long id) {
        log.info("GET /api/configurations/{} - Récupération de la configuration", id);
        
        return configurationService.findById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/configurations/by-key/{cle}
     * Récupère une configuration par clé
     */
    @GetMapping("/by-key/{cle}")
    public ResponseEntity<ConfigurationDTO> getConfigurationByCle(@PathVariable String cle) {
        log.info("GET /api/configurations/by-key/{} - Récupération de la configuration", cle);
        
        return configurationService.findByCle(cle)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/configurations/{id}
     * Met à jour une configuration
     */
    @PutMapping("/{id}")
    public ResponseEntity<ConfigurationDTO> updateConfiguration(
            @PathVariable Long id,
            @RequestBody ConfigurationDTO dto,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("PUT /api/configurations/{} - Mise à jour de la configuration", id);
        
        return configurationService.findById(id)
                .map(config -> {
                    config.setValeur(dto.getValeur());
                    config.setDescription(dto.getDescription());
                    config.setType(dto.getType());
                    Configuration updated = configurationService.save(config, currentUser);
                    return ResponseEntity.ok(toDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/configurations
     * Crée une nouvelle configuration
     */
    @PostMapping
    public ResponseEntity<ConfigurationDTO> createConfiguration(
            @RequestBody ConfigurationDTO dto,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("POST /api/configurations - Création d'une nouvelle configuration : {}", dto.getCle());
        
        Configuration config = configurationService.createOrUpdate(
                dto.getCle(),
                dto.getValeur(),
                dto.getDescription(),
                dto.getType(),
                currentUser
        );
        
        return ResponseEntity.ok(toDTO(config));
    }

    /**
     * DELETE /api/configurations/{id}
     * Supprime une configuration
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable Long id) {
        log.info("DELETE /api/configurations/{} - Suppression de la configuration", id);
        
        configurationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Méthode utilitaire de conversion
    private ConfigurationDTO toDTO(Configuration config) {
        return ConfigurationDTO.builder()
                .id(config.getId())
                .cle(config.getCle())
                .valeur(config.getValeur())
                .description(config.getDescription())
                .type(config.getType())
                .build();
    }

    // DTO interne pour le résultat du calcul de budget
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BudgetCalculationDTO {
        private Integer niveau;
        private BigDecimal surface;
        private BigDecimal prixParM2;
        private BigDecimal budget;
    }
}