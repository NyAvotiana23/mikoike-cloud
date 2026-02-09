package mg.projetfinal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.SignalementAction;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.Entreprise;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.SignalementActionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SignalementActionService {

    private final SignalementActionRepository signalementActionRepository;
    private final EntrepriseService entrepriseService;
    private final FirebasePushNotificationService pushNotificationService;

    public SignalementAction create(SignalementAction action, User createdBy) {
        log.info("Création d'une nouvelle action pour le signalement ID: {}", action.getSignalement().getId());
        
        if (action.getSignalement() == null) {
            throw new IllegalArgumentException("Le signalement est obligatoire");
        }
        
        if (action.getDescriptionTravaux() == null || action.getDescriptionTravaux().trim().isEmpty()) {
            throw new IllegalArgumentException("La description des travaux est obligatoire");
        }
        
        action.setCreatedBy(createdBy);
        
        SignalementAction savedAction = signalementActionRepository.save(action);
        
        // Incrémenter le nombre d'interventions de l'entreprise si elle est assignée
        if (action.getEntreprise() != null) {
            entrepriseService.incrementInterventions(action.getEntreprise().getId());
        }
        
        // Envoyer une notification push au créateur du signalement
        try {
            pushNotificationService.notifyNewAction(savedAction);
        } catch (Exception e) {
            log.warn("Erreur lors de l'envoi de la notification push: {}", e.getMessage());
        }

        return savedAction;
    }

    public SignalementAction update(Long id, SignalementAction action, User modifiedBy) {
        log.info("Mise à jour de l'action avec l'ID: {}", id);
        
        SignalementAction existingAction = signalementActionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Action non trouvée avec l'ID: " + id));
        
        existingAction.setDescriptionTravaux(action.getDescriptionTravaux());
        existingAction.setMaterielUtilise(action.getMaterielUtilise());
        existingAction.setSurfaceM2(action.getSurfaceM2());
        existingAction.setBudget(action.getBudget());
        existingAction.setDateDebutTravaux(action.getDateDebutTravaux());
        existingAction.setDateFinPrevue(action.getDateFinPrevue());
        existingAction.setPhotosAvant(action.getPhotosAvant());
        existingAction.setPhotosApres(action.getPhotosApres());
        existingAction.setModifiedBy(modifiedBy);
        
        // Si l'entreprise change, mettre à jour les compteurs
        if (action.getEntreprise() != null && 
                !action.getEntreprise().equals(existingAction.getEntreprise())) {
            existingAction.setEntreprise(action.getEntreprise());
            entrepriseService.incrementInterventions(action.getEntreprise().getId());
        }
        
        return signalementActionRepository.save(existingAction);
    }

    @Transactional(readOnly = true)
    public Optional<SignalementAction> findById(Long id) {
        log.debug("Recherche de l'action avec l'ID: {}", id);
        return signalementActionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<SignalementAction> findAll() {
        log.debug("Récupération de toutes les actions");
        return signalementActionRepository.findAll();
    }

    public void delete(Long id) {
        log.info("Suppression de l'action avec l'ID: {}", id);
        
        if (!signalementActionRepository.existsById(id)) {
            throw new IllegalArgumentException("Action non trouvée avec l'ID: " + id);
        }
        
        signalementActionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<SignalementAction> findBySignalement(Signalement signalement) {
        log.debug("Recherche des actions pour le signalement ID: {}", signalement.getId());
        return signalementActionRepository.findBySignalement(signalement);
    }

    @Transactional(readOnly = true)
    public List<SignalementAction> findByEntreprise(Entreprise entreprise) {
        log.debug("Recherche des actions pour l'entreprise ID: {}", entreprise.getId());
        return signalementActionRepository.findByEntreprise(entreprise);
    }

    @Transactional(readOnly = true)
    public List<SignalementAction> findActionsEnCours() {
        log.debug("Récupération des actions en cours");
        return signalementActionRepository.findActionsEnCours();
    }

    @Transactional(readOnly = true)
    public List<SignalementAction> findActionsEnRetard() {
        log.debug("Récupération des actions en retard");
        return signalementActionRepository.findActionsEnRetard();
    }

    public SignalementAction assignerEntreprise(Long actionId, Entreprise entreprise, User modifiedBy) {
        log.info("Assignation de l'entreprise ID: {} à l'action ID: {}", entreprise.getId(), actionId);
        
        SignalementAction action = signalementActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action non trouvée avec l'ID: " + actionId));
        
        if (action.getEntreprise() != null) {
            log.warn("L'action possède déjà une entreprise assignée");
        }
        
        action.setEntreprise(entreprise);
        action.setModifiedBy(modifiedBy);
        
        entrepriseService.incrementInterventions(entreprise.getId());
        
        SignalementAction savedAction = signalementActionRepository.save(action);

        // Envoyer une notification push au créateur du signalement
        try {
            pushNotificationService.notifyEntrepriseAssigned(savedAction);
        } catch (Exception e) {
            log.warn("Erreur lors de l'envoi de la notification push: {}", e.getMessage());
        }

        return savedAction;
    }

    public SignalementAction demarrerTravaux(Long actionId, LocalDateTime dateDebut, User modifiedBy) {
        log.info("Démarrage des travaux pour l'action ID: {}", actionId);
        
        SignalementAction action = signalementActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action non trouvée avec l'ID: " + actionId));
        
        if (action.getDateDebutTravaux() != null) {
            throw new IllegalStateException("Les travaux ont déjà démarré");
        }
        
        if (action.getEntreprise() == null) {
            throw new IllegalStateException("Une entreprise doit être assignée avant de démarrer les travaux");
        }
        
        action.setDateDebutTravaux(dateDebut != null ? dateDebut : LocalDateTime.now());
        action.setModifiedBy(modifiedBy);
        
        SignalementAction savedAction = signalementActionRepository.save(action);

        // Envoyer une notification push au créateur du signalement
        try {
            pushNotificationService.notifyTravauxStarted(savedAction);
        } catch (Exception e) {
            log.warn("Erreur lors de l'envoi de la notification push: {}", e.getMessage());
        }

        return savedAction;
    }

    public SignalementAction terminerTravaux(Long actionId, boolean conformes, String commentaire, User modifiedBy) {
        log.info("Fin des travaux pour l'action ID: {}", actionId);
        
        SignalementAction action = signalementActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action non trouvée avec l'ID: " + actionId));
        
        if (action.getDateDebutTravaux() == null) {
            throw new IllegalStateException("Les travaux n'ont pas encore démarré");
        }
        
        if (action.getDateFinReelle() != null) {
            throw new IllegalStateException("Les travaux sont déjà terminés");
        }
        
        action.terminerTravaux(conformes, commentaire);
        action.setModifiedBy(modifiedBy);
        
        SignalementAction savedAction = signalementActionRepository.save(action);

        // Envoyer une notification push au créateur du signalement
        try {
            pushNotificationService.notifyTravauxFinished(savedAction);
        } catch (Exception e) {
            log.warn("Erreur lors de l'envoi de la notification push: {}", e.getMessage());
        }

        return savedAction;
    }

    public SignalementAction ajouterPhotosAvant(Long actionId, String[] photos, User modifiedBy) {
        log.info("Ajout de {} photos avant pour l'action ID: {}", photos.length, actionId);
        
        SignalementAction action = signalementActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action non trouvée avec l'ID: " + actionId));
        
        action.setPhotosAvant(photos);
        action.setModifiedBy(modifiedBy);
        
        return signalementActionRepository.save(action);
    }

    public SignalementAction ajouterPhotosApres(Long actionId, String[] photos, User modifiedBy) {
        log.info("Ajout de {} photos après pour l'action ID: {}", photos.length, actionId);
        
        SignalementAction action = signalementActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action non trouvée avec l'ID: " + actionId));
        
        if (action.getDateFinReelle() == null) {
            log.warn("Les travaux ne sont pas encore terminés");
        }
        
        action.setPhotosApres(photos);
        action.setModifiedBy(modifiedBy);
        
        return signalementActionRepository.save(action);
    }

    public SignalementAction updateBudget(Long actionId, BigDecimal budget, User modifiedBy) {
        log.info("Mise à jour du budget pour l'action ID: {}", actionId);
        
        SignalementAction action = signalementActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action non trouvée avec l'ID: " + actionId));
        
        if (budget == null || budget.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Le budget doit être positif");
        }
        
        action.setBudget(budget);
        action.setModifiedBy(modifiedBy);
        
        return signalementActionRepository.save(action);
    }

    public SignalementAction updateDateFinPrevue(Long actionId, LocalDateTime dateFinPrevue, User modifiedBy) {
        log.info("Mise à jour de la date de fin prévue pour l'action ID: {}", actionId);
        
        SignalementAction action = signalementActionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action non trouvée avec l'ID: " + actionId));
        
        if (dateFinPrevue != null && action.getDateDebutTravaux() != null 
                && dateFinPrevue.isBefore(action.getDateDebutTravaux())) {
            throw new IllegalArgumentException("La date de fin prévue ne peut pas être avant la date de début");
        }
        
        action.setDateFinPrevue(dateFinPrevue);
        action.setModifiedBy(modifiedBy);
        
        return signalementActionRepository.save(action);
    }

    @Transactional(readOnly = true)
    public long countActionsEnCours() {
        return signalementActionRepository.findActionsEnCours().size();
    }

    @Transactional(readOnly = true)
    public long countActionsEnRetard() {
        return signalementActionRepository.findActionsEnRetard().size();
    }

    @Transactional(readOnly = true)
    public long countActionsByEntreprise(Entreprise entreprise) {
        return signalementActionRepository.findByEntreprise(entreprise).size();
    }

    @Transactional(readOnly = true)
    public long countActionsTerminees() {
        return signalementActionRepository.findAll().stream()
                .filter(SignalementAction::isTermine)
                .count();
    }

    @Transactional(readOnly = true)
    public List<SignalementAction> findActionsConformes() {
        log.debug("Récupération des actions conformes");
        return signalementActionRepository.findAll().stream()
                .filter(action -> action.getTravauxConformes() != null && action.getTravauxConformes())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SignalementAction> findActionsNonConformes() {
        log.debug("Récupération des actions non conformes");
        return signalementActionRepository.findAll().stream()
                .filter(action -> action.getTravauxConformes() != null && !action.getTravauxConformes())
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateBudgetTotal() {
        log.debug("Calcul du budget total de toutes les actions");
        return signalementActionRepository.findAll().stream()
                .map(SignalementAction::getBudget)
                .filter(budget -> budget != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateBudgetByEntreprise(Entreprise entreprise) {
        log.debug("Calcul du budget total pour l'entreprise ID: {}", entreprise.getId());
        return signalementActionRepository.findByEntreprise(entreprise).stream()
                .map(SignalementAction::getBudget)
                .filter(budget -> budget != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}