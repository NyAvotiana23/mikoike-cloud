// ManagerDashboardController.java
package mg.projetfinal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.dto.*;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.User;
import mg.projetfinal.mapper.SignalementMapper;
import mg.projetfinal.service.EntrepriseService;
import mg.projetfinal.service.SignalementService;
import mg.projetfinal.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Contrôleur pour le dashboard manager
 * Fournit des statistiques et données agrégées pour les managers
 */
@RestController
@RequestMapping("/api/manager/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ManagerDashboardController {

    private final SignalementService signalementService;
    private final UserService userService;
    private final EntrepriseService entrepriseService;
    private final SignalementMapper mapper;

    /**
     * Classe interne pour la réponse du dashboard
     */
    @lombok.Data
    @lombok.Builder
    public static class DashboardResponse {
        private StatisticsDTO statistics;
        private List<SignalementResponseDTO> recentSignalements;
        private List<SignalementParStatus> signalementsByStatus;
        private List<BudgetParEntreprise> budgetByEntreprise;
        private Map<String, Object> kpis;
    }

    @lombok.Data
    @lombok.Builder
    public static class SignalementParStatus {
        private String status;
        private Long count;
        private Double percentage;
    }

    @lombok.Data
    @lombok.Builder
    public static class BudgetParEntreprise {
        private String entrepriseNom;
        private BigDecimal budgetTotal;
        private Integer nombreSignalements;
    }

    /**
     * GET /api/manager/dashboard
     * Récupère toutes les données du dashboard
     */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal User currentUser) {

        log.info("GET /api/manager/dashboard - Récupération du dashboard pour manager");

        // Vérifier les permissions
        if (!isManager(currentUser)) {
            return ResponseEntity.status(403).build();
        }

        // Récupérer les statistiques générales
        List<Signalement> allSignalements = signalementService.findAllOrderByDateDesc();
        StatisticsDTO statistics = calculateStatistics(allSignalements);

        // Récupérer les 10 signalements les plus récents
        List<SignalementResponseDTO> recentSignalements = allSignalements.stream()
                .limit(10)
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());

        // Calculer la répartition par statut
        List<SignalementParStatus> byStatus = calculateSignalementsByStatus(allSignalements);

        // Calculer les budgets par entreprise
        List<BudgetParEntreprise> byEntreprise = calculateBudgetByEntreprise(allSignalements);

        // Calculer les KPIs
        Map<String, Object> kpis = calculateKPIs(allSignalements);

        DashboardResponse response = DashboardResponse.builder()
                .statistics(statistics)
                .recentSignalements(recentSignalements)
                .signalementsByStatus(byStatus)
                .budgetByEntreprise(byEntreprise)
                .kpis(kpis)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/manager/dashboard/statistics
     * Récupère uniquement les statistiques
     */
    @GetMapping("/statistics")
    public ResponseEntity<StatisticsDTO> getStatistics() {
        log.info("GET /api/manager/dashboard/statistics");

        List<Signalement> allSignalements = signalementService.findAll();
        StatisticsDTO statistics = calculateStatistics(allSignalements);

        return ResponseEntity.ok(statistics);
    }

    /**
     * GET /api/manager/dashboard/signalements
     * Liste des signalements avec filtres
     */
    @GetMapping("/signalements")
    public ResponseEntity<List<SignalementResponseDTO>> getFilteredSignalements(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String sortBy) {

        log.info("GET /api/manager/dashboard/signalements - status: {}, limit: {}", status, limit);

        List<Signalement> signalements;

        if (status != null && !status.isEmpty()) {
            signalements = signalementService.findByStatusCode(status);
        } else {
            signalements = signalementService.findAllOrderByDateDesc();
        }

        if (limit != null && limit > 0) {
            signalements = signalements.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        List<SignalementResponseDTO> response = signalements.stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/manager/dashboard/budget-summary
     * Résumé des budgets
     */
    @GetMapping("/budget-summary")
    public ResponseEntity<Map<String, Object>> getBudgetSummary() {
        log.info("GET /api/manager/dashboard/budget-summary");

        List<Signalement> allSignalements = signalementService.findAll();

        BigDecimal totalBudget = allSignalements.stream()
                .map(s -> {
                    var action = s.getActiveAction();
                    return action != null && action.getBudget() != null
                            ? action.getBudget() : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal budgetUtilise = allSignalements.stream()
                .filter(s -> s.getStatus().getCode().equals("termine"))
                .map(s -> {
                    var action = s.getActiveAction();
                    return action != null && action.getBudget() != null
                            ? action.getBudget() : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal budgetRestant = totalBudget.subtract(budgetUtilise);

        double pourcentageUtilise = totalBudget.compareTo(BigDecimal.ZERO) > 0
                ? budgetUtilise.divide(totalBudget, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("budgetTotal", totalBudget);
        summary.put("budgetUtilise", budgetUtilise);
        summary.put("budgetRestant", budgetRestant);
        summary.put("pourcentageUtilise", Math.round(pourcentageUtilise * 10.0) / 10.0);

        return ResponseEntity.ok(summary);
    }

    /**
     * GET /api/manager/dashboard/performance
     * Indicateurs de performance
     */
    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformance() {
        log.info("GET /api/manager/dashboard/performance");

        Map<String, Object> performance = calculateKPIs(signalementService.findAll());
        return ResponseEntity.ok(performance);
    }

    // ========== Méthodes privées ==========

    private boolean isManager(User user) {
        return user != null &&
                (user.getRole().getCode().equals("manager") ||
                        user.getRole().getCode().equals("admin"));
    }

    private StatisticsDTO calculateStatistics(List<Signalement> signalements) {
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

        long nouveau = signalements.stream()
                .filter(s -> s.getStatus().getCode().equals("nouveau"))
                .count();

        long enCours = signalements.stream()
                .filter(s -> s.getStatus().getCode().equals("en_cours"))
                .count();

        long termine = signalements.stream()
                .filter(s -> s.getStatus().getCode().equals("termine"))
                .count();

        double avancement = total > 0 ? ((double) termine / total) * 100 : 0;

        return StatisticsDTO.builder()
                .total(total)
                .totalSurface(totalSurface)
                .totalBudget(totalBudget)
                .nouveau((int) nouveau)
                .enCours((int) enCours)
                .termine((int) termine)
                .avancement(Math.round(avancement * 10.0) / 10.0)
                .build();
    }

    private List<SignalementParStatus> calculateSignalementsByStatus(List<Signalement> signalements) {
        Map<String, Long> countByStatus = signalements.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getStatus().getCode(),
                        Collectors.counting()
                ));

        long total = signalements.size();

        return countByStatus.entrySet().stream()
                .map(entry -> SignalementParStatus.builder()
                        .status(entry.getKey())
                        .count(entry.getValue())
                        .percentage(total > 0 ? (entry.getValue() * 100.0 / total) : 0.0)
                        .build())
                .collect(Collectors.toList());
    }

    private List<BudgetParEntreprise> calculateBudgetByEntreprise(List<Signalement> signalements) {
        Map<String, List<Signalement>> byEntreprise = signalements.stream()
                .filter(s -> s.getActiveAction() != null && s.getActiveAction().getEntreprise() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getActiveAction().getEntreprise().getNom()
                ));

        return byEntreprise.entrySet().stream()
                .map(entry -> {
                    BigDecimal budget = entry.getValue().stream()
                            .map(s -> s.getActiveAction().getBudget())
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return BudgetParEntreprise.builder()
                            .entrepriseNom(entry.getKey())
                            .budgetTotal(budget)
                            .nombreSignalements(entry.getValue().size())
                            .build();
                })
                .sorted((a, b) -> b.getBudgetTotal().compareTo(a.getBudgetTotal()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private Map<String, Object> calculateKPIs(List<Signalement> signalements) {
        Map<String, Object> kpis = new HashMap<>();

        // Taux de résolution
        long total = signalements.size();
        long termine = signalements.stream()
                .filter(s -> s.getStatus().getCode().equals("termine"))
                .count();
        double tauxResolution = total > 0 ? (termine * 100.0 / total) : 0.0;

        // Délai moyen de résolution (en jours) - simplifié
        double delaiMoyen = 15.0; // À calculer réellement avec les dates

        // Nombre d'entreprises actives
        long entreprisesActives = entrepriseService.findActiveEntreprises().size();

        // Nombre d'utilisateurs
        long utilisateursTotal = userService.findAll().size();

        kpis.put("tauxResolution", Math.round(tauxResolution * 10.0) / 10.0);
        kpis.put("delaiMoyenResolution", delaiMoyen);
        kpis.put("entreprisesActives", entreprisesActives);
        kpis.put("utilisateursTotal", utilisateursTotal);
        kpis.put("signalementsDuMois", signalements.size()); // À affiner avec la date

        return kpis;
    }
}