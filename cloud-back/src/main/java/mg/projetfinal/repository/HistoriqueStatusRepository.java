package mg.projetfinal.repository;

import mg.projetfinal.entity.HistoriqueStatus;
import mg.projetfinal.entity.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueStatusRepository extends JpaRepository<HistoriqueStatus, Long> {
    List<HistoriqueStatus> findBySignalementOrderByChangedAtDesc(Signalement signalement);
}