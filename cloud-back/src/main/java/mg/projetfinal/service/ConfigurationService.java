package mg.projetfinal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.Configuration;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.ConfigurationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConfigurationService {

    private final ConfigurationRepository configurationRepository;

    // Clés de configuration prédéfinies
    public static final String PRIX_PAR_M2_KEY = "PRIX_PAR_M2";
    public static final BigDecimal PRIX_PAR_M2_DEFAULT = new BigDecimal("10000"); // 10,000 Ar par défaut

    /**
     * Récupère la configuration du prix par m²
     */
    @Transactional(readOnly = true)
    public BigDecimal getPrixParM2() {
        return findByCle(PRIX_PAR_M2_KEY)
                .map(Configuration::getValeurAsDecimal)
                .orElse(PRIX_PAR_M2_DEFAULT);
    }

    /**
     * Définit le prix par m²
     */
    public Configuration setPrixParM2(BigDecimal prix, User updatedBy) {
        log.info("Mise à jour du prix par m² : {} Ar", prix);

        Configuration config = findByCle(PRIX_PAR_M2_KEY)
                .orElse(Configuration.builder()
                        .cle(PRIX_PAR_M2_KEY)
                        .description("Prix forfaitaire par mètre carré pour le calcul du budget")
                        .type("DECIMAL")
                        .build());

        config.setValeur(prix.toString());
        config.setUpdatedBy(updatedBy);

        return configurationRepository.save(config);
    }

    /**
     * Calcule le budget automatiquement
     * Formule: prix_par_m2 * niveau * surface_m2
     */
    public BigDecimal calculerBudget(Integer niveau, BigDecimal surfaceM2) {
        if (niveau == null || surfaceM2 == null) {
            throw new IllegalArgumentException("Le niveau et la surface sont requis pour calculer le budget");
        }

        if (niveau < 1 || niveau > 10) {
            throw new IllegalArgumentException("Le niveau doit être entre 1 et 10");
        }

        BigDecimal prixParM2 = getPrixParM2();
        BigDecimal niveauBigDecimal = new BigDecimal(niveau);

        // Budget = prix_par_m2 * niveau * surface
        BigDecimal budget = prixParM2.multiply(niveauBigDecimal).multiply(surfaceM2);

        log.debug("Calcul du budget : {} Ar (Prix/m²: {}, Niveau: {}, Surface: {} m²)",
                budget, prixParM2, niveau, surfaceM2);

        return budget;
    }

    @Transactional(readOnly = true)
    public Optional<Configuration> findById(Long id) {
        return configurationRepository.findById(id.intValue());
    }

    @Transactional(readOnly = true)
    public Optional<Configuration> findByCle(String cle) {
        return configurationRepository.findByCle(cle);
    }

    @Transactional(readOnly = true)
    public List<Configuration> findAll() {
        return configurationRepository.findAll();
    }

    public Configuration save(Configuration configuration, User updatedBy) {
        configuration.setUpdatedBy(updatedBy);
        return configurationRepository.save(configuration);
    }

    public Configuration createOrUpdate(String cle, String valeur, String description, String type, User updatedBy) {
        Configuration config = findByCle(cle)
                .orElse(Configuration.builder()
                        .cle(cle)
                        .build());

        config.setValeur(valeur);
        config.setDescription(description);
        config.setType(type);
        config.setUpdatedBy(updatedBy);

        return configurationRepository.save(config);
    }

    public void delete(Long id) {
        configurationRepository.deleteById(id.intValue());
    }

    /**
     * Initialise les configurations par défaut si elles n'existent pas
     */
//    public void initializeDefaultConfigurations() {
//        if (!configurationRepository.existsByCle(PRIX_PAR_M2_KEY)) {
//            Configuration config = Configuration.builder()
//                    .cle(PRIX_PAR_M2_KEY)
//                    .valeur(PRIX_PAR_M2_DEFAULT.toString())
//                    .description("Prix forfaitaire par mètre carré pour le calcul du budget des signalements")
//                    .type("DECIMAL")
//                    .build();
//
//            configurationRepository.save(config);
//            log.info("Configuration par défaut créée : {} = {}", PRIX_PAR_M2_KEY, PRIX_PAR_M2_DEFAULT);
//        }
//    }
}