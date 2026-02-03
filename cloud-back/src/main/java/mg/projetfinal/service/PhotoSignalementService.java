package mg.projetfinal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.PhotoSignalement;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.PhotoSignalementRepository;
import mg.projetfinal.repository.SignalementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhotoSignalementService {

    private final PhotoSignalementRepository photoRepository;
    private final SignalementRepository signalementRepository;

    @Transactional
    public PhotoSignalement addPhoto(Long signalementId, String url, String description, User uploadedBy) {
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));

        Long count = photoRepository.countBySignalement(signalement);

        PhotoSignalement photo = PhotoSignalement.builder()
                .signalement(signalement)
                .url(url)
                .description(description)
                .ordre(count.intValue() + 1)
                .isPrincipale(count == 0) // Première photo = principale
                .uploadedBy(uploadedBy)
                .build();

        return photoRepository.save(photo);
    }

    @Transactional
    public PhotoSignalement setPrincipale(Long photoId) {
        PhotoSignalement photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo introuvable"));

        // Retirer l'ancienne photo principale
        photoRepository.findBySignalementAndIsPrincipaleTrue(photo.getSignalement())
                .ifPresent(ancienne -> {
                    ancienne.setIsPrincipale(false);
                    photoRepository.save(ancienne);
                });

        // Définir la nouvelle
        photo.setIsPrincipale(true);
        return photoRepository.save(photo);
    }

    public List<PhotoSignalement> getPhotosBySignalement(Long signalementId) {
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        return photoRepository.findBySignalementOrderByOrdreAsc(signalement);
    }

    public PhotoSignalement getPhotoPrincipale(Long signalementId) {
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        return photoRepository.findBySignalementAndIsPrincipaleTrue(signalement)
                .orElse(null);
    }

    @Transactional
    public void deletePhoto(Long photoId) {
        PhotoSignalement photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo introuvable"));

        boolean wasPrincipale = photo.getIsPrincipale();
        Signalement signalement = photo.getSignalement();

        photoRepository.delete(photo);

        // Si c'était la photo principale, définir une nouvelle
        if (wasPrincipale) {
            List<PhotoSignalement> remaining = photoRepository.findBySignalementOrderByOrdreAsc(signalement);
            if (!remaining.isEmpty()) {
                PhotoSignalement newPrincipale = remaining.get(0);
                newPrincipale.setIsPrincipale(true);
                photoRepository.save(newPrincipale);
            }
        }
    }

    @Transactional
    public void reorderPhotos(Long signalementId, List<Long> photoIds) {
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));

        for (int i = 0; i < photoIds.size(); i++) {
            Long photoId = photoIds.get(i);
            PhotoSignalement photo = photoRepository.findById(photoId)
                    .orElseThrow(() -> new RuntimeException("Photo " + photoId + " introuvable"));

            // Vérifier que la photo appartient bien à ce signalement
            if (!photo.getSignalement().getId().equals(signalementId)) {
                throw new RuntimeException("La photo " + photoId + " n'appartient pas au signalement " + signalementId);
            }

            photo.setOrdre(i + 1);
            photoRepository.save(photo);
        }
    }
}