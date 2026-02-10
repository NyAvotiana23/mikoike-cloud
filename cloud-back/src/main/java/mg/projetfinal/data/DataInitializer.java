package mg.projetfinal.data;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.*;
import mg.projetfinal.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final SignalementStatusRepository statusRepository;
    private final SignalementRepository signalementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Démarrage de l'initialisation des données (Madagascar)...");

        // 1. Initialisation des Rôles
        Role adminRole = initRoles();

        // 2. Initialisation des Statuts
        initStatuses();

        // 3. Création de l'User Admin (ID >= 1000)
        User admin = initAdminUser(adminRole);

        // 4. Initialisation des Entreprises
        List<Entreprise> entreprises = initEntreprises(admin);

        // 5. Initialisation des Signalements (Antananarivo)

        log.info("Initialisation terminée avec succès.");
    }

    private Role initRoles() {
        if (roleRepository.count() == 0) {
            Role manager = Role.builder()
                    .code("MANAGER")
                    .libelle("Manager")
                    .description("Gestionnaire système")
                    .niveauAcces(10)
                    .build();

            Role utilisateur = Role.builder()
                    .code("UTILISATEUR")
                    .libelle("Utilisateur standard")
                    .description("Citoyen")
                    .niveauAcces(5)
                    .build();

            roleRepository.saveAll(Arrays.asList(manager, utilisateur));
            return manager;
        }
        return roleRepository.findByCode("MANAGER").orElse(null);
    }

    private void initStatuses() {
        if (statusRepository.count() == 0) {
            // 1. Statut NOUVEAU
            SignalementStatus nouveau = new SignalementStatus();
            nouveau.setId(1);
            nouveau.setOrdre(1);
            nouveau.setCode("NOUVEAU");
            nouveau.setLibelle("Nouveau");
            nouveau.setDescription("Signalement reçu, en attente d'analyse");
            nouveau.setCouleur("#3B82F6");
            nouveau.setCreatedAt(LocalDateTime.now());
            nouveau.setUpdatedAt(LocalDateTime.now());
            statusRepository.save(nouveau);

            // 2. Statut EN_COURS
            SignalementStatus enCours = new SignalementStatus();
            enCours.setId(2);
            enCours.setOrdre(2);
            enCours.setCode("EN_COURS");
            enCours.setLibelle("En cours");
            enCours.setDescription("Travaux ou analyse en cours de réalisation");
            enCours.setCouleur("#F59E0B");
            enCours.setCreatedAt(LocalDateTime.now());
            enCours.setUpdatedAt(LocalDateTime.now());
            statusRepository.save(enCours);

            // 3. Statut TERMINE
            SignalementStatus termine = new SignalementStatus();
            termine.setId(3);
            termine.setOrdre(3);
            termine.setCode("TERMINE");
            termine.setLibelle("Terminé");
            termine.setDescription("Problème résolu et travaux finalisés");
            termine.setCouleur("#10B981");
            termine.setCreatedAt(LocalDateTime.now());
            termine.setUpdatedAt(LocalDateTime.now());
            statusRepository.save(termine);

            log.info("Statuts de signalement initialisés.");
        }
    }

    private User initAdminUser(Role adminRole) {
        return userRepository.findByEmail("admin.tana@mg.gov").orElseGet(() -> {
            User admin = User.builder()
                    .id(1000L) // Forçage de l'ID à 1000
                    .name("Administrateur Antananarivo")
                    .email("admin.tana@mg.gov")
                    .passwordTemp("admin")
                    .passwordHash(passwordEncoder.encode("admin")) // BCrypt "admin"
                    .role(adminRole)
                    .firebaseSynced(false) // Non synchronisé Firebase
                    .isLocked(false)
                    .failedAttempts(0)
                    .build();
            return userRepository.save(admin);
        });
    }

    private List<Entreprise> initEntreprises(User creator) {
        if (entrepriseRepository.count() == 0) {
            Entreprise colas = Entreprise.builder()
                    .nom("Colas Madagascar")
                    .telephone("0202222222")
                    .email("contact@colas.mg")
                    .adresse("Ankorondrano, Antananarivo")
                    .specialites(new String[]{"Terrassement", "Goudronnage"})
                    .isActive(true)
                    .createdBy(creator)
                    .build();

            Entreprise sogea = Entreprise.builder()
                    .nom("SOGEA Madagascar")
                    .telephone("0202233333")
                    .email("info@sogea.mg")
                    .adresse("Alarobia, Antananarivo")
                    .specialites(new String[]{"Assainissement", "Génie Civil"})
                    .isActive(true)
                    .createdBy(creator)
                    .build();

            Entreprise smatp = Entreprise.builder()
                    .nom("SMATP")
                    .telephone("0202244444")
                    .email("direction@smatp.mg")
                    .adresse("Andraharo, Antananarivo")
                    .specialites(new String[]{"Location Engins", "Route"})
                    .isActive(true)
                    .createdBy(creator)
                    .build();

            return entrepriseRepository.saveAll(Arrays.asList(colas, sogea, smatp));
        }
        return entrepriseRepository.findAll();
    }



}