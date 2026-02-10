package mg.projetfinal.repository;

import mg.projetfinal.entity.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfigurationRepository extends JpaRepository<Configuration, Integer> {
    Optional<Configuration> findByCle(String cle);
}
