package mg.projetfinal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.HistoriqueStatus;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.SignalementStatus;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.HistoriqueStatusRepository;
import mg.projetfinal.repository.SignalementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HistoriqueStatusService {

    private final HistoriqueStatusRepository historiqueStatusRepository;
    private final SignalementRepository signalementRepository;

    public HistoriqueStatus create(HistoriqueStatus historique) {
        log.info("Création d'un nouvel historique de statut");
        
        if (historique.getSignalement() == null) {
            throw new IllegalArgumentException("Le signalement est obligatoire");
        }
        
        if (historique.getAncienStatus() == null || historique.getNouveauStatus() == null) {
            throw new IllegalArgumentException("L'ancien et le nouveau statut sont obligatoires");
        }
        
        if (historique.getModifiedBy() == null) {
            throw new IllegalArgumentException("L'utilisateur qui a modifié le statut est obligatoire");
        }
        
        return historiqueStatusRepository.save(historique);
    }

    @Transactional(readOnly = true)
    public Optional<HistoriqueStatus> findById(Long id) {
        log.debug("Recherche de l'historique avec l'ID: {}", id);
        return historiqueStatusRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<HistoriqueStatus> findAll() {
        log.debug("Récupération de tous les historiques");
        return historiqueStatusRepository.findAll();
    }

    public void delete(Long id) {
        log.info("Suppression de l'historique avec l'ID: {}", id);
        
        if (!historiqueStatusRepository.existsById(id)) {
            throw new IllegalArgumentException("Historique non trouvé avec l'ID: " + id);
        }
        
        historiqueStatusRepository.deleteById(id);
    }

    public HistoriqueStatus createHistorique(
            Signalement signalement,
            SignalementStatus ancienStatus,
            SignalementStatus nouveauStatus,
            User modifiedBy,
            String commentaire) {
        
        return createHistorique(signalement, ancienStatus, nouveauStatus, modifiedBy, commentaire, null);
    }

    public HistoriqueStatus createHistorique(
            Signalement signalement,
            SignalementStatus ancienStatus,
            SignalementStatus nouveauStatus,
            User modifiedBy,
            String commentaire,
            Map<String, Object> metadata) {
        
        log.info("Création d'un historique de changement de statut pour le signalement ID: {}", signalement.getId());
        
        HistoriqueStatus historique = HistoriqueStatus.builder()
                .signalement(signalement)
                .ancienStatus(ancienStatus)
                .nouveauStatus(nouveauStatus)
                .modifiedBy(modifiedBy)
                .commentaire(commentaire)
                .metadata(metadata)
                .build();
        
        HistoriqueStatus savedHistorique = historiqueStatusRepository.save(historique);
        
        signalement.addHistorique(savedHistorique);
        
        return savedHistorique;
    }

    public HistoriqueStatus createInitialHistorique(Signalement signalement, User createdBy) {
        log.info("Création de l'historique initial pour le signalement ID: {}", signalement.getId());
        
        SignalementStatus initialStatus = signalement.getStatus();
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("initial", true);
        metadata.put("createdAt", signalement.getCreatedAt());
        
        HistoriqueStatus historique = HistoriqueStatus.builder()
                .signalement(signalement)
                .ancienStatus(initialStatus)
                .nouveauStatus(initialStatus)
                .modifiedBy(createdBy)
                .commentaire("Création du signalement")
                .metadata(metadata)
                .build();
        
        HistoriqueStatus savedHistorique = historiqueStatusRepository.save(historique);
        
        signalement.addHistorique(savedHistorique);
        
        return savedHistorique;
    }

    @Transactional(readOnly = true)
    public List<HistoriqueStatus> findBySignalement(Signalement signalement) {
        log.debug("Recherche des historiques pour le signalement ID: {}", signalement.getId());
        return historiqueStatusRepository.findBySignalementOrderByChangedAtDesc(signalement);
    }

    @Transactional(readOnly = true)
    public List<HistoriqueStatus> findBySignalementOrderByDate(Signalement signalement) {
        log.debug("Recherche des historiques triés par date pour le signalement ID: {}", signalement.getId());
        return historiqueStatusRepository.findBySignalementOrderByChangedAtDesc(signalement);
    }

    @Transactional(readOnly = true)
    public List<HistoriqueStatus> findByUser(User user) {
        log.debug("Recherche des historiques pour l'utilisateur ID: {}", user.getId());
        
        return historiqueStatusRepository.findAll().stream()
                .filter(h -> h.getModifiedBy().equals(user))
                .toList();
    }

    @Transactional(readOnly = true)
    public HistoriqueStatus getLastStatusChange(Signalement signalement) {
        log.debug("Récupération du dernier changement de statut pour le signalement ID: {}", signalement.getId());
        
        List<HistoriqueStatus> historiques = historiqueStatusRepository
                .findBySignalementOrderByChangedAtDesc(signalement);
        
        return historiques.isEmpty() ? null : historiques.get(0);
    }

    @Transactional(readOnly = true)
    public List<HistoriqueStatus> getStatusHistory(Long signalementId) {
        log.debug("Récupération de l'historique complet pour le signalement ID: {}", signalementId);
        
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé avec l'ID: " + signalementId));
        
        return historiqueStatusRepository.findBySignalementOrderByChangedAtDesc(signalement);
    }

    @Transactional(readOnly = true)
    public long countStatusChangesByUser(User user) {
        log.debug("Comptage des changements de statut effectués par l'utilisateur ID: {}", user.getId());
        
        return historiqueStatusRepository.findAll().stream()
                .filter(h -> h.getModifiedBy().equals(user))
                .count();
    }
}