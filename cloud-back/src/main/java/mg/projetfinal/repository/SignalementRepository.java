package mg.projetfinal.repository;

import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.SignalementStatus;
import mg.projetfinal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    List<Signalement> findByUser(User user);
    List<Signalement> findByStatus(SignalementStatus status);
    List<Signalement> findByFirebaseSyncedFalse();

    @Query("SELECT s FROM Signalement s WHERE s.status.code = :statusCode ORDER BY s.dateSignalement DESC")
    List<Signalement> findByStatusCode(String statusCode);

    @Query("SELECT s FROM Signalement s ORDER BY s.dateSignalement DESC")
    List<Signalement> findAllOrderByDateDesc();
}