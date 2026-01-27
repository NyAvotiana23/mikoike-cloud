package mg.projetfinal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.Entreprise;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.EntrepriseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EntrepriseService {

    private final EntrepriseRepository entrepriseRepository;

    public Entreprise create(Entreprise entreprise, User createdBy) {
        log.info("Création d'une nouvelle entreprise: {}", entreprise.getNom());
        
        if (existsByNom(entreprise.getNom())) {
            throw new IllegalArgumentException("Une entreprise avec ce nom existe déjà");
        }
        
        if (entreprise.getSiret() != null && existsBySiret(entreprise.getSiret())) {
            throw new IllegalArgumentException("Une entreprise avec ce SIRET existe déjà");
        }
        
        entreprise.setCreatedBy(createdBy);
        entreprise.setIsActive(true);
        entreprise.setNombreInterventions(0);
        
        return entrepriseRepository.save(entreprise);
    }

    public Entreprise update(Integer id, Entreprise entreprise) {
        log.info("Mise à jour de l'entreprise avec l'ID: {}", id);
        
        Entreprise existingEntreprise = entrepriseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise non trouvée avec l'ID: " + id));
        
        if (!existingEntreprise.getNom().equals(entreprise.getNom())) {
            if (existsByNom(entreprise.getNom())) {
                throw new IllegalArgumentException("Une entreprise avec ce nom existe déjà");
            }
            existingEntreprise.setNom(entreprise.getNom());
        }
        
        if (entreprise.getSiret() != null && !entreprise.getSiret().equals(existingEntreprise.getSiret())) {
            if (existsBySiret(entreprise.getSiret())) {
                throw new IllegalArgumentException("Une entreprise avec ce SIRET existe déjà");
            }
            existingEntreprise.setSiret(entreprise.getSiret());
        }
        
        existingEntreprise.setTelephone(entreprise.getTelephone());
        existingEntreprise.setEmail(entreprise.getEmail());
        existingEntreprise.setAdresse(entreprise.getAdresse());
        existingEntreprise.setSpecialites(entreprise.getSpecialites());
        
        return entrepriseRepository.save(existingEntreprise);
    }

    @Transactional(readOnly = true)
    public Optional<Entreprise> findById(Integer id) {
        log.debug("Recherche de l'entreprise avec l'ID: {}", id);
        return entrepriseRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Entreprise> findAll() {
        log.debug("Récupération de toutes les entreprises");
        return entrepriseRepository.findAll();
    }

    public void delete(Integer id) {
        log.info("Suppression de l'entreprise avec l'ID: {}", id);
        
        if (!entrepriseRepository.existsById(id)) {
            throw new IllegalArgumentException("Entreprise non trouvée avec l'ID: " + id);
        }
        
        entrepriseRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Entreprise> findByNom(String nom) {
        log.debug("Recherche de l'entreprise par nom: {}", nom);
        return entrepriseRepository.findByNom(nom);
    }

    @Transactional(readOnly = true)
    public Optional<Entreprise> findBySiret(String siret) {
        log.debug("Recherche de l'entreprise par SIRET: {}", siret);
        return entrepriseRepository.findBySiret(siret);
    }

    @Transactional(readOnly = true)
    public List<Entreprise> findActiveEntreprises() {
        log.debug("Récupération des entreprises actives");
        return entrepriseRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Entreprise> findTopRatedEntreprises() {
        log.debug("Récupération des entreprises les mieux notées");
        return entrepriseRepository.findTopRatedEntreprises();
    }

    @Transactional(readOnly = true)
    public List<Entreprise> findBySpecialite(String specialite) {
        log.debug("Recherche des entreprises par spécialité: {}", specialite);
        
        return entrepriseRepository.findByIsActiveTrue().stream()
                .filter(entreprise -> entreprise.getSpecialites() != null 
                        && Arrays.asList(entreprise.getSpecialites()).contains(specialite))
                .collect(Collectors.toList());
    }

    public Entreprise activateEntreprise(Integer id) {
        log.info("Activation de l'entreprise avec l'ID: {}", id);
        
        Entreprise entreprise = entrepriseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise non trouvée avec l'ID: " + id));
        
        entreprise.setIsActive(true);
        return entrepriseRepository.save(entreprise);
    }

    public Entreprise deactivateEntreprise(Integer id) {
        log.info("Désactivation de l'entreprise avec l'ID: {}", id);
        
        Entreprise entreprise = entrepriseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise non trouvée avec l'ID: " + id));
        
        entreprise.setIsActive(false);
        return entrepriseRepository.save(entreprise);
    }

    public void incrementInterventions(Integer id) {
        log.info("Incrémentation du nombre d'interventions pour l'entreprise ID: {}", id);
        
        Entreprise entreprise = entrepriseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise non trouvée avec l'ID: " + id));
        
        entreprise.incrementInterventions();
        entrepriseRepository.save(entreprise);
    }

    public void updateNoteMoyenne(Integer id, BigDecimal nouvelleNote) {
        log.info("Mise à jour de la note moyenne pour l'entreprise ID: {}", id);
        
        if (nouvelleNote == null || nouvelleNote.compareTo(BigDecimal.ZERO) < 0 
                || nouvelleNote.compareTo(BigDecimal.valueOf(5)) > 0) {
            throw new IllegalArgumentException("La note doit être comprise entre 0 et 5");
        }
        
        Entreprise entreprise = entrepriseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise non trouvée avec l'ID: " + id));
        
        entreprise.updateNoteMoyenne(nouvelleNote);
        entrepriseRepository.save(entreprise);
    }

    @Transactional(readOnly = true)
    public boolean existsByNom(String nom) {
        return entrepriseRepository.findByNom(nom).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean existsBySiret(String siret) {
        return entrepriseRepository.findBySiret(siret).isPresent();
    }
}