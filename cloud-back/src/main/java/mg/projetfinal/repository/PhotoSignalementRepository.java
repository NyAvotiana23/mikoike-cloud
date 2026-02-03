package mg.projetfinal.repository;

import mg.projetfinal.entity.PhotoSignalement;
import mg.projetfinal.entity.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoSignalementRepository extends JpaRepository<PhotoSignalement, Long> {

    List<PhotoSignalement> findBySignalementOrderByOrdreAsc(Signalement signalement);

    Optional<PhotoSignalement> findBySignalementAndIsPrincipaleTrue(Signalement signalement);

    @Query("SELECT p FROM PhotoSignalement p WHERE p.signalement.id = :signalementId ORDER BY p.ordre ASC")
    List<PhotoSignalement> findBySignalementId(Long signalementId);

    Long countBySignalement(Signalement signalement);
}