// SignalementStatusService.java
package mg.projetfinal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.SignalementStatus;
import mg.projetfinal.repository.SignalementStatusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service pour la gestion des statuts de signalements
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SignalementStatusService {

    private final SignalementStatusRepository statusRepository;

    /**
     * Récupère tous les statuts ordonnés par ordre
     */
    public List<SignalementStatus> findAllOrderByOrdre() {
        log.debug("Récupération de tous les statuts ordonnés");
        return statusRepository.findAllByOrderByOrdreAsc();
    }

    /**
     * Récupère tous les statuts
     */
    public List<SignalementStatus> findAll() {
        log.debug("Récupération de tous les statuts");
        return statusRepository.findAll();
    }

    /**
     * Récupère un statut par ID
     */
    public Optional<SignalementStatus> findById(Integer id) {
        log.debug("Récupération du statut avec ID: {}", id);
        return statusRepository.findById(id);
    }

    /**
     * Récupère un statut par code
     */
    public Optional<SignalementStatus> findByCode(String code) {
        log.debug("Récupération du statut avec code: {}", code);
        return statusRepository.findByCode(code);
    }

    /**
     * Vérifie si un statut existe par code
     */
    public boolean existsByCode(String code) {
        return statusRepository.existsByCode(code);
    }

    /**
     * Crée un nouveau statut
     */
    public SignalementStatus create(SignalementStatus status) {
        log.info("Création d'un nouveau statut: {}", status.getCode());

        if (existsByCode(status.getCode())) {
            throw new RuntimeException("Un statut avec ce code existe déjà");
        }

        return statusRepository.save(status);
    }

    /**
     * Met à jour un statut
     */
    public SignalementStatus update(Integer id, SignalementStatus statusDetails) {
        log.info("Mise à jour du statut ID: {}", id);

        SignalementStatus status = findById(id)
                .orElseThrow(() -> new RuntimeException("Statut non trouvé"));

        status.setLibelle(statusDetails.getLibelle());
        status.setDescription(statusDetails.getDescription());
        status.setOrdre(statusDetails.getOrdre());
        status.setCouleur(statusDetails.getCouleur());

        return statusRepository.save(status);
    }

    /**
     * Supprime un statut
     */
    public void delete(Integer id) {
        log.info("Suppression du statut ID: {}", id);

        SignalementStatus status = findById(id)
                .orElseThrow(() -> new RuntimeException("Statut non trouvé"));

        statusRepository.delete(status);
    }

    /**
     * Récupère le statut par défaut (généralement "nouveau")
     */
    public SignalementStatus getDefaultStatus() {
        return findByCode("nouveau")
                .orElseGet(() -> findAllOrderByOrdre().stream()
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Aucun statut disponible")));
    }
}