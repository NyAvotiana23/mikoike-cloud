package mg.projetfinal.repository;

import mg.projetfinal.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Integer> {
    Optional<Entreprise> findByNom(String nom);
    Optional<Entreprise> findBySiret(String siret);
    List<Entreprise> findByIsActiveTrue();

    @Query("SELECT e FROM Entreprise e WHERE e.isActive = true ORDER BY e.noteMoyenne DESC")
    List<Entreprise> findTopRatedEntreprises();
}