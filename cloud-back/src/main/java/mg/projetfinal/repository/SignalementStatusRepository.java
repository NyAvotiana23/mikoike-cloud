package mg.projetfinal.repository;

import mg.projetfinal.entity.SignalementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SignalementStatusRepository extends JpaRepository<SignalementStatus, Integer> {
    Optional<SignalementStatus> findByCode(String code);
    List<SignalementStatus> findAllByOrderByOrdreAsc();
    boolean existsByCode(String code);
}