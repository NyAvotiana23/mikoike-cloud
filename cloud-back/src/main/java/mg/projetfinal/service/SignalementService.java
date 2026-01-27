package mg.projetfinal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.SignalementStatus;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.SignalementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SignalementService {

    private final SignalementRepository signalementRepository;
    private final HistoriqueStatusService historiqueStatusService;

    public Signalement create(Signalement signalement, User user) {
        log.info("Création d'un nouveau signalement pour l'utilisateur: {}", user.getId());
        
        if (signalement.getLatitude() == null || signalement.getLongitude() == null) {
            throw new IllegalArgumentException("La localisation (latitude et longitude) est obligatoire");
        }
        
        if (signalement.getDescription() == null || signalement.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("La description est obligatoire");
        }
        
        signalement.setUser(user);
        signalement.setFirebaseSynced(false);
        
        Signalement savedSignalement = signalementRepository.save(signalement);
        
        if (signalement.getStatus() != null) {
            historiqueStatusService.createInitialHistorique(savedSignalement, user);
        }
        
        return savedSignalement;
    }

    public Signalement update(Long id, Signalement signalement) {
        log.info("Mise à jour du signalement avec l'ID: {}", id);
        
        Signalement existingSignalement = signalementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé avec l'ID: " + id));
        
        existingSignalement.setDescription(signalement.getDescription());
        existingSignalement.setAdresse(signalement.getAdresse());
        existingSignalement.setPhotoUrl(signalement.getPhotoUrl());
        
        if (!existingSignalement.getLatitude().equals(signalement.getLatitude()) 
                || !existingSignalement.getLongitude().equals(signalement.getLongitude())) {
            existingSignalement.setLatitude(signalement.getLatitude());
            existingSignalement.setLongitude(signalement.getLongitude());
            existingSignalement.setFirebaseSynced(false);
        }
        
        return signalementRepository.save(existingSignalement);
    }

    @Transactional(readOnly = true)
    public Optional<Signalement> findById(Long id) {
        log.debug("Recherche du signalement avec l'ID: {}", id);
        return signalementRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Signalement> findAll() {
        log.debug("Récupération de tous les signalements");
        return signalementRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Signalement> findAllOrderByDateDesc() {
        log.debug("Récupération de tous les signalements triés par date");
        return signalementRepository.findAllOrderByDateDesc();
    }

    public void delete(Long id) {
        log.info("Suppression du signalement avec l'ID: {}", id);
        
        if (!signalementRepository.existsById(id)) {
            throw new IllegalArgumentException("Signalement non trouvé avec l'ID: " + id);
        }
        
        signalementRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Signalement> findByUser(User user) {
        log.debug("Recherche des signalements pour l'utilisateur: {}", user.getId());
        return signalementRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public List<Signalement> findByStatus(SignalementStatus status) {
        log.debug("Recherche des signalements par statut: {}", status.getCode());
        return signalementRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Signalement> findByStatusCode(String statusCode) {
        log.debug("Recherche des signalements par code de statut: {}", statusCode);
        return signalementRepository.findByStatusCode(statusCode);
    }

    @Transactional(readOnly = true)
    public List<Signalement> findNonSyncedWithFirebase() {
        log.debug("Récupération des signalements non synchronisés avec Firebase");
        return signalementRepository.findByFirebaseSyncedFalse();
    }

    @Transactional(readOnly = true)
    public List<Signalement> findByLocation(BigDecimal latitude, BigDecimal longitude, double radiusKm) {
        log.debug("Recherche des signalements dans un rayon de {} km autour de ({}, {})", 
                radiusKm, latitude, longitude);
        
        return signalementRepository.findAll().stream()
                .filter(signalement -> {
                    double distance = calculateDistance(
                            latitude.doubleValue(), 
                            longitude.doubleValue(),
                            signalement.getLatitude().doubleValue(),
                            signalement.getLongitude().doubleValue()
                    );
                    return distance <= radiusKm;
                })
                .collect(Collectors.toList());
    }

    public Signalement changeStatus(Long id, SignalementStatus newStatus, User modifiedBy, String commentaire) {
        log.info("Changement de statut pour le signalement ID: {} vers {}", id, newStatus.getCode());
        
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé avec l'ID: " + id));
        
        SignalementStatus oldStatus = signalement.getStatus();
        
        if (oldStatus.equals(newStatus)) {
            log.warn("Le signalement est déjà au statut: {}", newStatus.getCode());
            return signalement;
        }
        
        historiqueStatusService.createHistorique(signalement, oldStatus, newStatus, modifiedBy, commentaire);
        
        signalement.setStatus(newStatus);
        signalement.setFirebaseSynced(false);
        
        return signalementRepository.save(signalement);
    }

    public void markAsSynced(Long id, String firebaseId) {
        log.info("Marquage du signalement ID: {} comme synchronisé avec Firebase ID: {}", id, firebaseId);
        
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé avec l'ID: " + id));
        
        signalement.setFirebaseId(firebaseId);
        signalement.setFirebaseSynced(true);
        signalement.setLastSyncAt(LocalDateTime.now());
        
        signalementRepository.save(signalement);
    }

    public void syncWithFirebase(Long id) {
        log.info("Synchronisation du signalement ID: {} avec Firebase", id);
        
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé avec l'ID: " + id));
        
        // TODO: Implémenter la logique de synchronisation avec Firebase
        signalement.setFirebaseSynced(true);
        signalement.setLastSyncAt(LocalDateTime.now());
        
        signalementRepository.save(signalement);
    }

    public List<Signalement> syncAllPending() {
        log.info("Synchronisation de tous les signalements en attente avec Firebase");
        
        List<Signalement> pendingSignalements = findNonSyncedWithFirebase();
        
        for (Signalement signalement : pendingSignalements) {
            try {
                syncWithFirebase(signalement.getId());
            } catch (Exception e) {
                log.error("Erreur lors de la synchronisation du signalement ID: {}", signalement.getId(), e);
            }
        }
        
        return pendingSignalements;
    }

    @Transactional(readOnly = true)
    public long countByStatus(SignalementStatus status) {
        return signalementRepository.findByStatus(status).size();
    }

    @Transactional(readOnly = true)
    public long countByUser(User user) {
        return signalementRepository.findByUser(user).size();
    }

    @Transactional(readOnly = true)
    public long countNouveau() {
        return signalementRepository.findAll().stream()
                .filter(Signalement::isNouveau)
                .count();
    }

    @Transactional(readOnly = true)
    public long countEnCours() {
        return signalementRepository.findAll().stream()
                .filter(Signalement::isEnCours)
                .count();
    }

    @Transactional(readOnly = true)
    public long countTermine() {
        return signalementRepository.findAll().stream()
                .filter(Signalement::isTermine)
                .count();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371;
        
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS * c;
    }
}