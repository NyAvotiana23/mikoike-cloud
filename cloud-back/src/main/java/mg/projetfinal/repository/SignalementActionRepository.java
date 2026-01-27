package mg.projetfinal.repository;

import mg.projetfinal.entity.SignalementAction;
import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementActionRepository extends JpaRepository<SignalementAction, Long> {
    List<SignalementAction> findBySignalement(Signalement signalement);
    List<SignalementAction> findByEntreprise(Entreprise entreprise);

    @Query("SELECT sa FROM SignalementAction sa WHERE sa.dateDebutTravaux IS NOT NULL AND sa.dateFinReelle IS NULL")
    List<SignalementAction> findActionsEnCours();

    @Query("SELECT sa FROM SignalementAction sa WHERE sa.dateFinPrevue < CURRENT_TIMESTAMP AND sa.dateFinReelle IS NULL")
    List<SignalementAction> findActionsEnRetard();
}